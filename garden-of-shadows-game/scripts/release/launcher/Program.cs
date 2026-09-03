using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace GardenOfShadows.Launcher;

internal static class Program
{
    private const string GameTitle = "游园惊梦：四面证词";
    private const int GamePort = 41737;
    private const string GameUrl = "http://127.0.0.1:41737/";
    private static readonly string BaseDirectory = AppContext.BaseDirectory;
    private static readonly string GameDirectory = Path.Combine(BaseDirectory, "game");

    [STAThread]
    private static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();

        if (!File.Exists(Path.Combine(GameDirectory, "index.html")))
        {
            MessageBox.Show(
                "没有找到 game\\index.html。请先完整解压下载包，再双击启动游戏。",
                GameTitle,
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return;
        }

        using var mutex = new Mutex(true, "Local\\GardenOfShadows-Launcher", out var isFirstInstance);
        if (!isFirstInstance)
        {
            OpenBrowser(GameUrl);
            return;
        }

        try
        {
            using var server = new StaticFileServer(GameDirectory, GamePort);
            server.Start();
            if (!args.Contains("--no-browser", StringComparer.OrdinalIgnoreCase))
            {
                OpenBrowser(server.Url);
            }
            Application.Run(new TrayApplicationContext(server.Url));
        }
        catch (Exception exception)
        {
            MessageBox.Show(
                $"游戏启动失败。\n\n{exception.Message}",
                GameTitle,
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
        }
    }

    private static void OpenBrowser(string url) =>
        Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
}

internal sealed class TrayApplicationContext : ApplicationContext
{
    private readonly NotifyIcon _trayIcon;
    public TrayApplicationContext(string url)
    {
        var menu = new ContextMenuStrip();
        menu.Items.Add("打开游戏", null, (_, _) => OpenBrowser(url));
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("退出", null, (_, _) => ExitThread());

        _trayIcon = new NotifyIcon
        {
            Icon = Icon.ExtractAssociatedIcon(Environment.ProcessPath!),
            Text = "游园惊梦（本地运行中）",
            ContextMenuStrip = menu,
            Visible = true,
        };
        _trayIcon.DoubleClick += (_, _) => OpenBrowser(url);
    }

    protected override void ExitThreadCore()
    {
        _trayIcon.Visible = false;
        _trayIcon.Dispose();
        base.ExitThreadCore();
    }

    private static void OpenBrowser(string url)
    {
        Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
    }
}

internal sealed class StaticFileServer : IDisposable
{
    private readonly string _root;
    private readonly TcpListener _listener;
    private readonly CancellationTokenSource _cancellation = new();
    private Task? _acceptLoop;

    public StaticFileServer(string root, int port)
    {
        _root = Path.GetFullPath(root) + Path.DirectorySeparatorChar;
        _listener = new TcpListener(IPAddress.Loopback, port);
    }

    public int Port => ((IPEndPoint)_listener.LocalEndpoint).Port;
    public string Url => $"http://127.0.0.1:{Port}/";

    public void Start()
    {
        _listener.Start();
        _acceptLoop = AcceptLoopAsync(_cancellation.Token);
    }

    public void Dispose()
    {
        _cancellation.Cancel();
        _listener.Stop();
        try
        {
            _acceptLoop?.GetAwaiter().GetResult();
        }
        catch (OperationCanceledException)
        {
        }
        catch (SocketException)
        {
        }
        _cancellation.Dispose();
    }

    private async Task AcceptLoopAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            TcpClient client;
            try
            {
                client = await _listener.AcceptTcpClientAsync(cancellationToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (SocketException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }

            _ = Task.Run(() => HandleClientAsync(client, cancellationToken), CancellationToken.None);
        }
    }

    private async Task HandleClientAsync(TcpClient client, CancellationToken cancellationToken)
    {
        using (client)
        await using (var stream = client.GetStream())
        {
            try
            {
                var request = await ReadRequestAsync(stream, cancellationToken);
                if (request is null)
                {
                    return;
                }

                if (request.Method is not ("GET" or "HEAD"))
                {
                    await WriteErrorAsync(stream, 405, "Method Not Allowed", cancellationToken);
                    return;
                }

                var filePath = ResolveFilePath(request.Target);
                if (filePath is null)
                {
                    await WriteErrorAsync(stream, 404, "Not Found", cancellationToken);
                    return;
                }

                var fileInfo = new FileInfo(filePath);
                var header = new StringBuilder()
                    .Append("HTTP/1.1 200 OK\r\n")
                    .Append("Content-Type: ").Append(GetMimeType(fileInfo.Extension)).Append("\r\n")
                    .Append("Content-Length: ").Append(fileInfo.Length).Append("\r\n")
                    .Append("Cache-Control: public, max-age=3600\r\n")
                    .Append("X-Content-Type-Options: nosniff\r\n")
                    .Append("Connection: close\r\n\r\n");
                await stream.WriteAsync(Encoding.ASCII.GetBytes(header.ToString()), cancellationToken);

                if (request.Method == "GET")
                {
                    await using var file = new FileStream(
                        filePath,
                        FileMode.Open,
                        FileAccess.Read,
                        FileShare.Read,
                        1024 * 128,
                        FileOptions.Asynchronous | FileOptions.SequentialScan);
                    await file.CopyToAsync(stream, 1024 * 128, cancellationToken);
                }
            }
            catch (IOException)
            {
                // The browser may cancel speculative or superseded asset requests.
            }
            catch (OperationCanceledException)
            {
            }
        }
    }

    private static async Task<HttpRequest?> ReadRequestAsync(NetworkStream stream, CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(stream, Encoding.ASCII, false, 4096, true);
        var requestLine = await reader.ReadLineAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(requestLine))
        {
            return null;
        }

        var parts = requestLine.Split(' ', 3, StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length < 2)
        {
            return null;
        }

        string? line;
        do
        {
            line = await reader.ReadLineAsync(cancellationToken);
        }
        while (!string.IsNullOrEmpty(line));

        return new HttpRequest(parts[0].ToUpperInvariant(), parts[1]);
    }

    private string? ResolveFilePath(string requestTarget)
    {
        var queryIndex = requestTarget.IndexOf('?');
        var rawPath = queryIndex >= 0 ? requestTarget[..queryIndex] : requestTarget;
        var relativePath = Uri.UnescapeDataString(rawPath)
            .Replace('/', Path.DirectorySeparatorChar)
            .TrimStart(Path.DirectorySeparatorChar);
        if (string.IsNullOrEmpty(relativePath))
        {
            relativePath = "index.html";
        }

        var candidate = Path.GetFullPath(Path.Combine(_root, relativePath));
        if (!candidate.StartsWith(_root, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        if (File.Exists(candidate))
        {
            return candidate;
        }

        return Path.HasExtension(relativePath) ? null : Path.Combine(_root, "index.html");
    }

    private static async Task WriteErrorAsync(Stream stream, int status, string message, CancellationToken cancellationToken)
    {
        var body = Encoding.UTF8.GetBytes(message);
        var header = Encoding.ASCII.GetBytes(
            $"HTTP/1.1 {status} {message}\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: {body.Length}\r\nConnection: close\r\n\r\n");
        await stream.WriteAsync(header, cancellationToken);
        await stream.WriteAsync(body, cancellationToken);
    }

    private static string GetMimeType(string extension) => extension.ToLowerInvariant() switch
    {
        ".html" => "text/html; charset=utf-8",
        ".js" or ".mjs" => "text/javascript; charset=utf-8",
        ".css" => "text/css; charset=utf-8",
        ".json" => "application/json; charset=utf-8",
        ".svg" => "image/svg+xml",
        ".png" => "image/png",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".webp" => "image/webp",
        ".ico" => "image/x-icon",
        ".wasm" => "application/wasm",
        ".glb" => "model/gltf-binary",
        ".gltf" => "model/gltf+json",
        ".ktx2" => "image/ktx2",
        ".ogg" => "audio/ogg",
        ".mp3" => "audio/mpeg",
        ".wav" => "audio/wav",
        _ => "application/octet-stream",
    };

    private sealed record HttpRequest(string Method, string Target);
}
