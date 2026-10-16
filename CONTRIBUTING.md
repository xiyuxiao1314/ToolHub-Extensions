# Contributing extensions

Use a unique community namespace. Keep releases under `packages/<slug>/<semver>/`; do not rewrite an already-published version silently. Submit a new version and update catalog metadata, catalog.js and SHA256SUMS.txt atomically. Keep packages below 256 KiB. No binaries, credentials, installation hooks, generated media or machine-specific configs.

Declare real platform and host-version requirements. CLI contributions require beta.4 and are host-rendered: one input_file, one output_file and optional finite choice parameters; whole-argument placeholders only. No raw free-text shell field. Actions use the kernel's trusted registered executable, pinning, policy and one-run approval. The kernel does not provide an OS sandbox for every possible external CLI. Audit the declared static arguments as code; do not embed hidden network access, additional output locations, overwrite flags or arbitrary execution semantics.

Include a portable Skill only when another Agent can actually perform it with available local tools. Do not share a provider's private image-generation/browser APIs as universal capabilities. Instructions are not authorization.

Submit purpose, screenshots with synthetic data, dependencies, permissions, exact tests and known limitations. Run `python scripts/validate.py` locally. CI performs manifest/index consistency checks, not native execution or a security certification. Core Rust parsing and native tests remain required for new host contract contributions.
