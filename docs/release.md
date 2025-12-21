---
title: Release
---

# Release Process

This document describes how to create a new release for PortRegistry.

## Overview

Releases are automated using GitHub Actions. When a release is created, the workflow will:
1. Build the frontend (React/Vite)
2. Package the executable using PyInstaller
3. Generate a SHA256 checksum file
4. **Generate release notes** using GitHub's auto-generation API - includes PR links, contributors, and changelog
5. Optionally enhance with structured content from `CHANGELOG.md`
6. Create a GitHub release with the artifacts and combined release notes

## Matrix Release Workflow

We use a matrix workflow that builds and packages PortRegistry for multiple platforms: `.github/workflows/release-matrix.yml`.

### Triggers
- **Tag pushes** matching `v*` pattern (e.g., `v1.0.5`)
- **Manual dispatch** via "Run workflow" where you provide a tag input

### Matrix Runners
- `windows-latest`
- `macos-latest`
- `ubuntu-latest`

### What Each Runner Does

**Windows runner:**
- Produces `dist/portregistry.exe`
- Attempts to run Inno Setup (`ISCC.exe`) to create `installer/PortRegistry_Setup.exe`
- Inno Setup can be installed via Chocolatey in the job

**macOS runner:**
- Produces `dist/portregistry.app`
- Creates a compressed `.dmg` using `hdiutil`
- Code signing and notarization require Apple Developer credentials (left to maintainers)

**Linux runner:**
- Produces a native binary in `dist/`
- Creates `PortRegistry-linux-dist.tar.gz` tarball as a portable artifact

### Release Creation & Artifact Uploads

Each matrix runner attaches the artifacts it produced to the same GitHub Release using `softprops/action-gh-release`. Multiple runners update the same release object; artifacts are uploaded per-runner as they finish.

::: tip Aggregation Alternative
For deterministic release creation, you can modify the workflow to:
1. Have each matrix job `upload-artifact` with its produced files
2. Add a final job that depends on the matrix jobs, `download-artifact` for each runner
3. Create the GitHub release and attach all artifacts in one step

This avoids multiple jobs racing to update the same release.
:::

## Prerequisites

- Ensure `CHANGELOG.md` has been updated with the new version's changes
- Version format in changelog should match: `## [1.0.5] - YYYY-MM-DD`
- Git tag should follow semantic versioning: `v1.0.5` (with `v` prefix)

## Creating a Release

### Method 1: Automatic Release (Recommended)

1. **Update CHANGELOG.md**
   Add a new section for your version:
   ```markdown
   ## [1.0.5] - 2025-12-17
   
   ### Added
   - Feature description
   
   ### Changed
   - Change description
   
   ### Fixed
   - Bug fix description
   ```

2. **Commit and push changes**
   ```bash
   git add CHANGELOG.md
   git commit -m "chore: update changelog for v1.0.5"
   git push
   ```

3. **Create and push the tag**
   ```bash
   git tag v1.0.5
   git push origin v1.0.5
   ```

4. **Monitor the workflow**
   - Go to the Actions tab in GitHub
   - The "Release" workflow will automatically start
   - Once complete, the release will be available on the Releases page

### Method 2: Manual Release

If you've already created a tag but need to rebuild/recreate the release:

1. Go to **Actions** → **Release** workflow
2. Click **Run workflow**
3. Enter the tag name (e.g., `v1.0.5`)
4. Click **Run workflow**
5. Monitor the workflow execution

## Release Artifacts

Each release includes:
- `portregistry.exe` - The Windows executable
- `PortRegistry-v{version}.sha256.txt` - SHA256 checksum file
- Platform-specific installers (when available)

## Release Notes Generation

The workflow uses a **hybrid approach** to generate release notes:

### 1. GitHub Auto-Generated Notes (Primary)
- Automatically extracts information from **merged pull requests** between tags
- Includes:
  - **"What's Changed"** section with PR summaries and links
  - **Contributors** section listing all contributors
  - **Full Changelog** link to commit history
- Uses GitHub's API: `POST /repos/{owner}/{repo}/releases/generate-notes`

### 2. CHANGELOG.md Enhancement (Optional)
- If auto-generation succeeds, changelog content is added as an additional "Detailed Changelog" section
- If auto-generation fails, changelog is used as fallback
- Provides structured, user-facing documentation (Added/Changed/Fixed sections)

## Changelog Format

The changelog parser expects the following format:

```markdown
## [1.0.5] - 2025-12-17

### Added
- Feature description

### Changed
- Change description

### Fixed
- Bug fix description
```

**Important Notes:**
- Version must be in brackets: `[1.0.5]`
- Date is optional but recommended
- The section ends at the next version header or end of file
- If no matching changelog entry is found, a default message will be used

## Troubleshooting

### Workflow fails to find executable
- Ensure `portregistry.spec` is correct
- Check that `npm run build` completes successfully
- Verify PyInstaller output location matches expected path

### Changelog not extracted correctly
- Verify the version format in `CHANGELOG.md` matches the tag (without `v` prefix)
- Ensure the changelog section uses the format `## [1.0.5]`
- Check that there are no formatting issues in the markdown

### Release already exists
- The workflow will update the existing release if run again with the same tag
- To create a new release, use a new tag version

## Version Management

- Version numbers should follow [Semantic Versioning](https://semver.org/)
- Tag format: `v{major}.{minor}.{patch}` (e.g., `v1.0.5`)
- Update `package.json` version to match the release version
- Update `version.txt` if needed for executable metadata

## See Also

- [Installer Guide](./installer.md) - Creating platform-specific installers
- [Automation & CI](./automation.md) - CI/CD workflow details
