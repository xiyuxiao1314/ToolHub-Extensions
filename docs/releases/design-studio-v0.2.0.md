# Design Studio 0.2.0 / 设计台与扩展目录

## 简体中文

- 设计台：12 个精选方向、10 类布局、独立的 Web / Android / 桌面外壳与重排。组合封面、字体、导航和动效，实时试用后复制 JSON、可运行 HTML 或 Agent 设计说明。
- 无限画布使用平移/缩放与视口裁剪，虚拟列表实际限制挂载数量；支持卡片展开、键盘关闭、焦点返回与减少动态效果设置。
- 最多 24 个本机命名预设，支持 JSON 备份导入；旧版 v1 配置保留原字段后迁移，不执行导入脚本。
- 完整目录同时包含 FFmpeg 媒体工坊 1.0.0、石墨主题、工具速览及 Blender 识别/流程包；这些包版本未变，不捆绑 FFmpeg/Blender 等第三方二进制。

下载 `design-studio-0.2.0.toolhub-extension.json`，在 ToolHub → 扩展 → 导入 → 预览 → 确认安装。设计台需要 [ToolHub beta.6](https://github.com/xiyuxiao1314/ToolHub/releases/tag/v0.3.0-beta.6) 的包专属存储接口；主程序不在本 Release 中。

`ToolHub-Extensions-design-studio-v0.2.0.zip` 包含全部目录、版本化源码、构建脚本和文档，可解压后打开 index.html 筛选。`SHA256SUMS.txt` 校验下载资源，仓库内同名文件校验各版本 manifest；不是发布者签名。

Windows WebView2 原生流程、模型组合/导入边界、导出 HTML 和正式 0.1→0.2 升级/预设保留已验证；目录五个包及 SHA-256 一致。macOS 页面交互尚未实机验收，FFmpeg 受控执行仍仅支持 Windows。设计引用用于灵感与说明，示例代码/封面均为原创；不附带参考网站的代码或图片。

## English

Design Studio 0.2.0 adds twelve visual directions, ten layout families, distinct Web/Android/desktop previews, composable cover/type/navigation/motion, and matching JSON/runnable HTML/Agent instructions. Camera canvases use viewport culling; virtual lists limit mounted items. Expanded cards support keyboard dismissal, focus restoration and reduced motion. Keep up to 24 local presets; validated JSON import migrates v1 data without executing imported code.

Download the individual JSON and import/review it in ToolHub Extensions. Requires [ToolHub beta.6](https://github.com/xiyuxiao1314/ToolHub/releases/tag/v0.3.0-beta.6); host binaries are released in the main repository. The source/catalog ZIP also contains unchanged FFmpeg 1.0.0, Graphite, Workspace and Blender packages, editable sources, builders and docs. No third-party executable is bundled. Verify the download checksum separately from per-manifest repository hashes.

Native Windows workflows, model/input bounds, exported HTML and upgrade/preset preservation were verified. All five catalog manifests/checksums pass validation. Physical Mac page interaction remains unverified; FFmpeg execution remains Windows-only. Artwork and implementation are original. Checksums detect changes and are not signatures or security certification.
