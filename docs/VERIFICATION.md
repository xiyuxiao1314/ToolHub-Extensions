# Verification — 2026-10-16

Tested on Windows with the matching ToolHub beta.4 development host. Synthetic local media; no user media or production trust changes. This catalog contains no FFmpeg binary.

- Host workspace: 228 Rust tests passed, one existing ignored; TypeScript SDK four tests and strict types passed; UI production build passed. Final repository-link UI/native desktop change additionally passed all 16 desktop tests.
- Native workbench: CLI contribution install, type/platform filtering, navigation, three operation tabs, read-only choose-before-edit fields, disabled run without a trusted engine, shared Skill discovery, disable/re-enable and narrow viewport layout.
- Real owner-selected FFmpeg: compression, MP4 conversion and M4A extraction produced nonempty declared outputs; generated files were decoded successfully. Existing output rejected without byte changes; missing audio produced a real nonzero error; native task cancellation stopped the owned process. Explicit controller confirmation worked with auto approval disabled. Selected-task final logs and exit code displayed.
- Actual paired MCP: sixteen generic tools; installed FFmpeg workflow found and instructions loaded only on demand.
- Static catalog: all four packages, metadata and SHA-256 values consistent; browser type/platform/text filtering and local download links passed.

Limits: the native file-dialog implementation compiled, but OS dialog interaction was not automated because the Windows capture service did not expose the isolated test window. Tests passed selected synthetic paths to the real native preview/start RPC; execution was not mocked. macOS execution and physical Mac interaction remain unverified/unsupported as documented. This is not independent security certification, a binary signature or a published ToolHub host release.

## Design Studio 0.2.0 — 2026-10-19

Twelve visual presets/model bounds/unsafe inputs, structure/navigation/style/content/platform combinations, strict v1 migration and HTML escaping passed. Native Windows WebView2 ran eleven workflow groups plus responsive mobile controls, camera/keyboard pan, deep-page expansion/focus return, dynamic reduced-motion and virtual row bounds without runtime/CSP errors. Formal 0.1→0.2 install preserved drafts/presets across reload; exported standalone HTML ran its interactions. The unchanged default builder reproduces the exact 116681-byte manifest (SHA-256 c8c6cc28f7e03ffddb1a6d4c1ad07cc35966876ebb717ef581b626c644cc1091). All five catalog entries, paths and raw SHA-256 hashes pass validation. These are maintainer checks, not independent certification; macOS interaction remains unverified.

## AI Prompts 1.0.0 — 2026-10-21

48 original prompts / 6 categories, native package preview and installation, existing extension-state and library preservation passed. Edge CUA checks covered search/filter/empty reset/name sorting/pagination, card and full-text copy, keyboard focus and three window sizes. The real host-served document also rendered and copied. No host rebuild, new permissions, model calls or Skills. Browser connection messages without an application stack were observed; no blanket zero-console-error claim. macOS remains unverified. See [AI Prompts](AI-PROMPTS.md).

## AI Prompts 1.1.0 — 2026-10-21

Data round trips, quota/invalid input and conflict tests passed. Actual isolated Windows WebView CRUD/undo/reload persistence/Markdown file import passed. Native Save-picker E2E remains pending after targeting trouble and user Escape interruption. Host storage and real UTF-8 filesystem-write tests passed. Production installation unchanged; macOS unverified. Requires matching beta.8 host. See AI-PROMPTS.md.
