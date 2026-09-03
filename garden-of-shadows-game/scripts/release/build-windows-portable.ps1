param(
    [string]$Version = "0.1.0-demo",
    [switch]$SkipWebBuild,
    [switch]$SkipArchive
)

$ErrorActionPreference = "Stop"
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$releaseRoot = Join-Path $projectRoot "release"
$webOutput = Join-Path $releaseRoot "portable-client"
$launcherOutput = Join-Path $releaseRoot "launcher-publish"
$packageName = "Garden-of-Shadows-Demo-$Version-Windows-x64"
$stageRoot = [System.IO.Path]::GetFullPath((Join-Path $releaseRoot $packageName))
$zipPath = Join-Path $releaseRoot "$packageName.zip"
$hashPath = "$zipPath.sha256.txt"

function Remove-ReleaseDirectory([string]$Path) {
    $resolved = [System.IO.Path]::GetFullPath($Path)
    $releasePrefix = [System.IO.Path]::GetFullPath($releaseRoot) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $resolved.StartsWith($releasePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a path outside the release directory: $resolved"
    }
    if (Test-Path -LiteralPath $resolved) {
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}

Push-Location $projectRoot
try {
    if (-not $SkipWebBuild) {
        & npm.cmd run build:portable:web
        if ($LASTEXITCODE -ne 0) { throw "Portable web build failed." }
    }

    $indexPath = Join-Path $webOutput "index.html"
    if (-not (Test-Path -LiteralPath $indexPath)) {
        throw "Portable web output is missing: $indexPath"
    }

    & node scripts/release/generate-launcher-icon.mjs
    if ($LASTEXITCODE -ne 0) { throw "Launcher icon generation failed." }

    Remove-ReleaseDirectory $launcherOutput
    & dotnet publish scripts/release/launcher/GardenOfShadows.Launcher.csproj `
        --configuration Release `
        --runtime win-x64 `
        --self-contained true `
        --output $launcherOutput `
        -p:PublishSingleFile=true `
        -p:RestoreIgnoreFailedSources=true
    if ($LASTEXITCODE -ne 0) { throw "Windows launcher build failed." }

    Remove-ReleaseDirectory $stageRoot
    New-Item -ItemType Directory -Path $stageRoot | Out-Null
    Copy-Item -LiteralPath $webOutput -Destination (Join-Path $stageRoot "game") -Recurse
    Copy-Item -LiteralPath (Join-Path $launcherOutput "GardenOfShadows.exe") -Destination (Join-Path $stageRoot "游园惊梦.exe")

    $readme = @"
游园惊梦：四面证词 Demo

启动方法
1. 请先完整解压 ZIP，不要在压缩包内直接运行。
2. 双击“游园惊梦.exe”。
3. 游戏会自动在默认浏览器中打开。
4. 关闭游戏时，在 Windows 系统托盘右键游戏图标，选择“退出”。

说明
- 支持 Windows 10/11 64 位。
- 无需安装 Node.js，也不需要联网。
- 存档保存在当前浏览器的本地存储中；清除浏览器网站数据会清除存档。
- Windows 首次运行可能显示“未知发布者”；正式公开发布建议为 EXE 添加代码签名。
- 如果页面没有自动打开，可再次双击“游园惊梦.exe”。

版本：$Version
"@
    Set-Content -LiteralPath (Join-Path $stageRoot "开始前请读.txt") -Value $readme -Encoding UTF8

    if (-not $SkipArchive) {
        if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
        if (Test-Path -LiteralPath $hashPath) { Remove-Item -LiteralPath $hashPath -Force }
        Compress-Archive -LiteralPath $stageRoot -DestinationPath $zipPath -CompressionLevel Optimal
        $hash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
        Set-Content -LiteralPath $hashPath -Value "$hash  $([System.IO.Path]::GetFileName($zipPath))" -Encoding ASCII
    }

    Write-Host ""
    Write-Host "Portable package ready:"
    Write-Host "  Folder: $stageRoot"
    if (-not $SkipArchive) {
        Write-Host "  ZIP:    $zipPath"
        Write-Host "  SHA256: $hashPath"
    }
}
finally {
    Pop-Location
}
