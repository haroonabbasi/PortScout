---
title: Automation
---

# Automation & CI

Recommended CI strategy

- Use GitHub Actions matrix runners (`windows-latest`, `macos-latest`, `ubuntu-latest`) to build platform artifacts.
- Prefer an aggregated final job that collects `upload-artifact` outputs from matrix jobs, then creates a single GitHub Release and uploads all artifacts. This avoids race conditions when multiple jobs update the same release.

Example flow

1. Matrix jobs: build frontend, run PyInstaller per-OS, `upload-artifact` with produced files.
2. Aggregator job: depends on matrix, `download-artifact` for each platform, create release and attach all artifacts.

Other automation ideas
- Run packaging & installer steps in CI and publish artifacts to GitHub Releases.
- Add smoke tests on each artifact (e.g., verify binary runs `--version`).
- Use Dependabot or equivalent to keep dependencies up to date.
