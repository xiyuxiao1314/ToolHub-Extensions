# AI Prompts 1.1.2

Offline extension `community.ai-prompts`, requiring **ToolHub 0.3.0-beta.8**. Keep 1.0.0 for older hosts. Open Extension Center → Applications → AI Prompts.

The 48 original templates remain searchable, categorized and paginated. Create prompts with a title, custom category, tags, summary and Markdown text. Edit and delete buttons are always visible on each card; deletion asks for confirmation and supports immediate undo. Open details to export a single .md file. Deletion removes only a library record; source files stay intact. Undo lasts for the current page session.

Import UTF-8 .md/.markdown/.txt or an exported JSON bundle, including multiple files. Plain Markdown uses its first H1 or filename as the title and preserves its body. ToolHub Markdown restores ID/category/tags/summary as well. All files are validated before any write. Preview the result, then keep existing conflicts (default), replace them, or import copies. Conflicts use ID or normalized title plus category; identical records are skipped. Export all creates toolhub-prompts.json for another ToolHub installation with the matching host and extension.

Successful edits persist in package-scoped host storage with optimistic revision checks. Errors keep drafts and prevent partial imports. Clearing the WebView profile removes saved data, so export important presets. Uninstalling the extension preserves its namespace. The standalone preview is memory-only and resets on reload.

Limits: 500 records, 1 MiB UTF-8 JSON state, 20,000 characters per body, 50 files / 2 MiB per import, 2 MiB per export. Markdown/HTML is never executed. No accounts, favorites, publishing, network, model calls, tool execution or Skill registration. Native Save chooses the destination; the extension cannot pass a disk path. Canceling export leaves the library unchanged.

Build with `python packages/ai-prompts/1.1.2/build.py`, test with `node scripts/test-ai-prompts.mjs`, update the index with `python scripts/register-ai-prompts.py`, then `python scripts/validate.py`. Versioned editable sources are included. Templates are original and MIT licensed; the UI concept references AI Short without copying its catalog or service.

Checks passed for 48 Markdown round trips, complete JSON round trip, Unicode/BOM/CRLF, conflict policies, empty-library persistence and invalid/quota inputs. Actual isolated Windows WebView checks covered CRUD, undo, reload persistence and Markdown import. A sandbox form-submission bug was fixed by using explicit save handlers. Host tests cover package storage isolation/revisions/quota and actual UTF-8 file writing/rejection of invalid names and non-files.

Native Save-picker end-to-end verification is **pending**. Local production is now beta.8 / AI Prompts 1.1.2; no GitHub publication. macOS interaction is unverified. Use this development package with the matching beta.8 host for acceptance.

Version 1.1.2 makes card edit/delete actions directly accessible and highlights Add. Native regression checks cover direct actions, delete confirmation/cancel, undo, save/reload and three window sizes. See [verification](AI-PROMPTS-CARDS-VERIFICATION.md).

1.1.2 removes the decorative heading and quote mark; the page starts with search and categories.
