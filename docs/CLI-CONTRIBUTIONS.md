# CLI contributions / 声明式 CLI 面板

[Package schema](../extension.schema.json) · [FFmpeg manifest](../packages/ffmpeg/1.0.0/ffmpeg.toolhub-extension.json)


`extensions/examples/ffmpeg.toolhub-extension.json` 是第一个真实 CLI 面板。安装后增加“媒体工坊”，包括压缩视频、H.264/AAC MP4 转换和 M4A 音频提取，附 Agent 可查询的通用流程。它不包含 FFmpeg 二进制；需要本机可用且已核对信任的 FFmpeg。示例依赖 libx264/AAC，部分构建缺少编码器时会返回错误；不自动下载或静默改用另一份程序。默认不覆盖已有输出，CRF 不保证体积一定缩小。

v2 新增可选 `cli`：`{id,label,icon,order,tool_definition,actions}`。`cli.id` 使用包前缀且不能与 views 重复；最多 8 个 action。action 包含 `id,label,description,parameters,args,timeout_ms`，ID 为 1–48 个小写字母/数字/下划线，最长 300000 ms。包的 `min_toolhub_version` 至少 0.3.0-beta.4；旧快照缺少 cli 时不改变序列化摘要。

每个 action 必须且只能有一个 `input_file` 和一个 `output_file`，可另加有限 `choice`，合计最多 8 个参数。文件参数声明非空后缀列表，不预置本机路径；choice 声明有限 label/value 和有效 default。args 是最多 128 个字符串组成的参数数组，`{input}` 等占位符必须独占一个参数且对应声明；不进行 shell 解析、字符串插值或环境替换。参数只能替换成一个 argv 元素，空格、中文、引号和 & 保持为路径数据。静态参数本身仍需要像代码一样审核；核心不声称沙箱化任意 CLI 的文件/网络行为。

核心原生表单负责文件选择、工具实例、命令预览和一次执行确认；CLI 贡献本身在安装预览中展示写入及执行影响。此权限不会加入 iframe 的 bridge。`extension.cli_preview`、`extension.cli_start` 是 controller-only THP 接口，不能从 `extension.invoke` 调用，Agent 也不能伪造 controller。普通 Agent 通过包附带的 Skill 和现有 execute_tool 使用本机程序，遵守自身任务授权、信任和策略；MCP 仍为 16 个固定工具。

| THP 方法 | 参数 / 行为 |
| --- | --- |
| extension.cli_preview | `{id,expected_digest,action_id,instance_id,values}`；确认已启用包、摘要、动作、工具 definition_id、参数全集、真实本地输入和未存在输出，返回准确 executable/argv/cwd/output/trust/supported |
| extension.cli_start | 相同参数加 `{confirmation:完整预览对象}`；重新生成并逐项比较预览，再为准确请求发放单次许可、按 extension:id 普通主体准备身份绑定后台任务 |

输出文件不能已存在（包括链接），目录必须已存在且有效；拒绝相对路径、URL、上级穿越，Windows 额外拒绝设备/网络路径、备用数据流和保留文件名。FFmpeg 示例另使用 `-nostdin -n -protocol_whitelist file,pipe`，限制输入协议并防止覆盖竞争。执行核心仍检查工具信任、策略、可执行文件哈希、固定身份、输出声明和超时。包启停/更新提升授权 revision；已有扫描或执行期间仍拒绝改包，先完成/取消任务。

面板用现有后台任务接口读取本扩展拥有的任务，显示状态/耗时，原生取消按钮复用核心取消机制。结束后可以查看限量日志和定位实际输出；当前没有百分比/逐行直播日志。失败/取消可能留下不完整文件，保留由用户处理。任务状态跨 daemon 重启保留，stdout/stderr 仅在当前服务内存保存。

Windows 原生执行需要对应 beta.4 宿主；macOS 可预览/复制流程，仍不提供身份绑定执行，实体 Mac 的新选择器未验收。Linux 无桌面发布承诺。独立扩展目录与宿主代码可分开发版；安装扩展从不替换核心二进制或调整 MCP 连接。
