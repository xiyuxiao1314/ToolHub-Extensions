window.TOOLHUB_CATALOG={
  "schema": "toolhub.catalog/v1",
  "name": "ToolHub Extension Catalog",
  "description": "Curated CLI panels, pages, themes and reusable workflows. Installation is always explicit.",
  "extensions": [
    {
      "id": "community.ffmpeg",
      "name": "FFmpeg 媒体工坊",
      "version": "1.0.0",
      "description": "把本机 FFmpeg 变成工具面板：压缩视频、转成 MP4、提取音频，保留命令预览、后台任务和执行结果。",
      "category": "media",
      "tags": [
        "FFmpeg",
        "视频",
        "音频",
        "CLI"
      ],
      "platforms": [
        "windows",
        "macos"
      ],
      "min_toolhub_version": "0.3.0-beta.4",
      "path": "packages/ffmpeg/1.0.0/ffmpeg.toolhub-extension.json",
      "sha256": "4fd3855a1ad0724ddd71e6008251110a96600919e45217ee730e43070b2dcaa6",
      "execution_support": "Windows only; macOS query/preview",
      "license": "MIT"
    },
    {
      "id": "community.graphite",
      "name": "石墨工作台",
      "version": "1.0.0",
      "description": "深色主题与紧凑布局，支持左侧、右侧和顶部导航。",
      "category": "theme",
      "tags": [
        "主题",
        "布局"
      ],
      "platforms": [
        "windows",
        "macos",
        "linux"
      ],
      "min_toolhub_version": "0.3.0-beta.3",
      "path": "packages/graphite/1.0.0/graphite.toolhub-extension.json",
      "sha256": "a18bea59ff26afde93017b54940c9d6c73e8224cd16398a883e9ac90139fd970",
      "execution_support": "See host support matrix",
      "license": "MIT"
    },
    {
      "id": "community.workspace",
      "name": "工具速览工作台",
      "version": "1.0.0",
      "description": "独立页面示例：通过隔离的 SDK 查询工具，安装后增加导航，无需重新编译。",
      "category": "page",
      "tags": [
        "工具",
        "搜索"
      ],
      "platforms": [
        "windows",
        "macos",
        "linux"
      ],
      "min_toolhub_version": "0.3.0-beta.3",
      "path": "packages/workspace/1.0.0/workspace.toolhub-extension.json",
      "sha256": "acaff4d2da3b21829c31564e5a2b5e03f8d1e934547eb73a15d53d9bc109a2b1",
      "execution_support": "See host support matrix",
      "license": "MIT"
    },
    {
      "id": "community.blender",
      "name": "Blender 本机渲染",
      "version": "1.0.0",
      "description": "为本机已有的 Blender 增加只读识别规则和跨 Agent 的渲染流程。安装扩展不安装 Blender。",
      "category": "recognition",
      "tags": [
        "Blender",
        "渲染",
        "Skill"
      ],
      "platforms": [
        "windows",
        "macos",
        "linux"
      ],
      "min_toolhub_version": "0.3.0-beta.3",
      "path": "packages/blender/1.0.0/blender.toolhub-extension.json",
      "sha256": "4db08f7d8804d646a3c4816822388045ce315183b65a8f4aac027eeee4acf215",
      "execution_support": "See host support matrix",
      "license": "MIT"
    },
    {
      "id": "community.design-studio",
      "name": "设计台",
      "version": "0.3.0",
      "description": "从预设或空白开始，分步预览、微调并导出布局、HTML 和 Agent 设计说明。",
      "platforms": [
        "windows",
        "macos"
      ],
      "min_toolhub_version": "0.3.0-beta.6",
      "license": "MIT",
      "category": "design",
      "tags": [
        "设计台",
        "步骤条",
        "无预设",
        "12 个方向",
        "布局",
        "Metro",
        "画布",
        "预设"
      ],
      "path": "packages/design-studio/0.3.0/design-studio.toolhub-extension.json",
      "sha256": "d27cdcfd97ff2cad9081f86149637a3b1db9cda7cd8a1cdefecdcf0d42e06610",
      "execution_support": "No native execution. Windows WebView2 wizard and animation verified; macOS interaction unverified."
    }
  ]
};
