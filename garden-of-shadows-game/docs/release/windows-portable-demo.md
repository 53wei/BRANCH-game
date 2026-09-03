# Windows 一键启动 Demo 发布

## 玩家拿到的内容

发布物是一个 ZIP。玩家完整解压后双击 `游园惊梦.exe`，启动器会在 `127.0.0.1:41737` 上启动仅本机可访问的静态服务器，并在默认浏览器打开游戏。固定端口用于让浏览器存档在重启和换包后保持同一个来源。玩家不需要安装 Node.js，也不需要联网。

启动器常驻系统托盘。再次双击 EXE 会重新打开游戏页；退出时右键托盘图标并选择“退出”。

## 构建下载包

在项目目录运行：

```powershell
npm run build:portable
```

指定公开版本号：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/release/build-windows-portable.ps1 -Version 0.1.0-demo.1
```

产物位于 `release/`：

- `Garden-of-Shadows-Demo-<版本>-Windows-x64.zip`：给玩家下载的文件。
- `Garden-of-Shadows-Demo-<版本>-Windows-x64.zip.sha256.txt`：下载完整性校验值。
- 同名目录：解压后的测试目录，可以在上传前直接双击 EXE 验收。

构建机需要 Node.js 22.13+、PowerShell 7（`pwsh`）和 .NET 10 SDK；这些都不会被要求安装到玩家电脑。

## 生成下载链接

本项目不把大体积 ZIP 提交到 Git。把 ZIP 上传到 GitHub Releases、Cloudflare R2/Pages、对象存储或网盘，取得允许公开下载的 HTTPS 链接，然后把该链接填入页面中的“Demo 下载链接”字段。

推荐链接直接指向 ZIP，而不是仓库首页。发布页面同时展示版本号、文件大小、SHA-256，以及“仅支持 Windows 10/11 64 位”的提示。

## 上线前检查

1. 在一台没有安装 Node.js 的 Windows 电脑上完整解压并双击 EXE。
2. 验证首页、新建/继续存档、3D 资产、声音和章节切换。
3. 确认 Windows 防火墙没有弹出公网监听请求；启动器只绑定 `127.0.0.1`。
4. 从实际下载链接重新下载一次，核对 SHA-256。
5. 对外大范围分发前购买代码签名证书并签名 EXE，减少 SmartScreen 的“未知发布者”提示。

## 当前限制

- 当前包是 Windows x64 便携版；macOS 需要单独的签名和公证构建。
- 存档跟随玩家使用的浏览器本地存储。更换默认浏览器或清除网站数据时，存档不会自动迁移。
- 启动器没有联网更新器；新版本继续发布新的 ZIP 即可。
