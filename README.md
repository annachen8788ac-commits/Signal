# Signal 多工作区

一个纯前端的 Signal 多工作区管理页，包含：

- 多个 Signal 身份/账号入口管理
- 多网页工作区
- 网页翻译入口
- 中英文及多语言文本翻译
- 浏览器本地保存配置
- 响应式布局

## 使用

直接打开 `index.html` 即可。

如果使用 GitHub Pages，可把 Pages 发布源设置为：

- Branch: `main`
- Folder: `/ (root)`

然后通过 Pages 地址访问。

## 说明

Signal 目前没有官方 Web 客户端，因此浏览器页面不能直接创建多个独立 Signal 登录会话。

这个项目的定位是“多账号工作台/启动器”。如果需要真正同时运行多个 Signal 账号，需要配合本机独立 Signal Desktop 环境、容器、虚拟机或独立用户配置。

网页翻译使用 Google Translate 新标签页方式，以避免 iframe、CSP 和跨域限制。
