# ToolHub Extension Catalog

[简体中文](README.md) | **English**

Installable panels for local CLIs, independent pages, themes and reusable Agent workflows. Extensions are maintained separately from the [ToolHub kernel](https://github.com/xiyuxiao1314/ToolHub); they do not each need their own MCP server.

Download and extract this repository, then open [index.html](index.html) locally to filter by type, platform, name and tags. Download a manifest and select **Extensions → Import → Review → Install** in ToolHub. GitHub displays the HTML source; hosted Pages are not automatically enabled. See the Chinese README for the package table and support matrix.

**Compatibility:** FFmpeg requires ToolHub 0.3.0-beta.4, other examples require beta.3. The public host download is still beta.2 and cannot install these v2 packages. Use the matching verified development build or wait for a host release. Windows controlled execution is supported; macOS FFmpeg execution is unavailable and must not be presented as verified.

## Screenshots

Windows beta.4 native acceptance with synthetic media and an isolated registry.

![FFmpeg media workshop](docs/images/ffmpeg.png)

![Filterable extension catalog](docs/images/catalog.png)

## FFmpeg media workshop

Video compression, MP4 conversion and M4A audio extraction using an existing local FFmpeg. The host renders file pickers, finite choices and an exact argument-array preview. Confirm one run, then monitor status/elapsed time, cancel, read final logs or locate the output. No FFmpeg download or redistribution; tool trust and execution policy still apply. libx264/AAC availability depends on the local build. Input is retained, existing output is rejected, and compression may not reduce size. Each task is limited to five minutes. Failed/cancelled partial output is retained. There is no percentage progress, batch mode, network media or embedded terminal in this version.

The included portable Skill is discoverable through the existing generic MCP tools. The catalog does not expose a host-specific API to unrelated Agents. Frame scripts cannot call native execution; only the trusted host can submit a reviewed CLI action.

## Integrity and contribution

[catalog.json](catalog.json) provides categories, tags, versions, platform declarations, minimum host versions, paths and raw-file SHA-256 hashes. [SHA256SUMS.txt](SHA256SUMS.txt) checks file integrity, not publisher identity. These byte hashes are distinct from ToolHub's normalized installed-package digest. Review the source and permissions before installation; package text does not grant authority.

Run `python scripts/validate.py` after changes. Update the manifest, catalog, generated catalog.js and checksums together. Read [CONTRIBUTING.md](CONTRIBUTING.md); report actual platform evidence. This is an initial curated directory, without accounts, signing infrastructure, automatic updates or payments.

[MIT](LICENSE). No third-party executable binaries are included; external tools retain their own licenses.

[Verification / 验证记录](docs/VERIFICATION.md) · [CLI contribution contract](docs/CLI-CONTRIBUTIONS.md)
