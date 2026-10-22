# AI Prompts 1.2.0

Offline extension `community.ai-prompts`, requiring **ToolHub 0.3.0-beta.8** or later. Open Extension Center → AI Prompts.

New libraries start empty with no bundled prompts. Add your own text or import Markdown/JSON presets; categories come from your actual entries. Upgrading preserves saved user content. Historical package versions remain available as source.

Create prompts with a title, custom category, optional tags/summary and Markdown text. Edit and delete directly on cards. Deletion asks for confirmation, supports immediate undo in the current page session, and never deletes the original file.

Import UTF-8 .md/.markdown/.txt or an exported JSON bundle. Plain Markdown uses its first H1 or filename as the title; ToolHub Markdown also restores metadata and IDs. Preview before saving, then keep existing conflicts (default), replace them or import copies. Export a single .md from details, or export the whole library as toolhub-prompts.json for another ToolHub installation.

Host storage is package-scoped and revision-checked. Failed writes preserve drafts. Clearing the WebView profile removes saved presets; export important content first. Uninstalling the extension preserves its storage namespace. The standalone preview is memory-only and resets on reload.

Limits: 500 records, 1 MiB UTF-8 JSON, 20,000 characters per body, 50 files / 2 MiB per import, and 2 MiB per export. Markdown/HTML is never executed. No accounts, favorites, publishing, network, model calls or tool execution. Native Save chooses the destination; extensions cannot supply a disk path.

Sources: packages/ai-prompts/1.2.0/src. Build with its build.py; run scripts/test-ai-prompts.mjs, scripts/register-ai-prompts.py and scripts/validate.py. Tests cover an empty shipped library, synthetic text round trips, Unicode/BOM/CRLF, conflict policies, empty state and malformed/quota inputs. Windows WebView checks cover create, direct card edit/delete, confirmation/cancel, undo and reload persistence. Native Save-picker end-to-end and macOS interaction remain unverified.
