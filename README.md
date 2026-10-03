# Signal Multi

真正的 Signal Desktop 多实例启动管理器，不是聊天 UI 模拟器。

## 功能

- 创建多个 Signal Profile
- 每个 Profile 使用独立的数据目录
- 分别启动 / 停止 Signal Desktop
- 第一次启动时分别扫码绑定不同 Signal 账号
- 每个 Profile 可指定不同的 Signal 可执行文件
- 快速打开 Profile 数据目录
- Windows 安装包 / Portable 自动构建
- 内置网页翻译入口

## Windows 使用

1. 安装官方 Signal Desktop。
2. 启动 Signal Multi。
3. 点击 **添加 Signal**。
4. 创建第一个实例，例如“招聘”。
5. 点击 **启动**，在弹出的 Signal Desktop 中扫码绑定账号。
6. 再创建第二个实例，例如“客户”，重新扫码绑定另一个账号。

每个实例的数据保存在 Signal Multi 自己的 `signal-profiles` 目录中，不与其他实例共用。

## 重要兼容性说明

Signal Desktop 官方并没有提供正式的“多账号”产品功能。这个项目通过 Electron/Chromium 的独立用户数据目录方式启动多个实例。

Signal 官方仓库在 2026 年有报告指出，部分较新的 Signal Desktop 构建可能忽略 `--user-data-dir`。因此：

- 如果你的 Signal 版本支持该参数，多实例可以直接使用。
- 如果某个版本忽略该参数，可在不同 Profile 中指定不同的 Signal 可执行文件/构建。
- 本项目不会复制、读取或解密你的 Signal 消息数据库。

## 开发

```bash
npm install
npm start
```

## 打包 Windows

```bash
npm install
npm run dist -- --win
```

GitHub Actions 也会自动生成 Windows 安装包，可在 Actions 的 `Signal-Multi-Windows` artifact 中下载。
