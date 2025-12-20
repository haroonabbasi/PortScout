# Release Process

This document describes how to create a new release for PortRegistry.

## Overview

Releases are automated using GitHub Actions. When a release is created, the workflow will:
1. Build the frontend (React/Vite)
2. Package the executable using PyInstaller
3. Generate a SHA256 checksum file
4. **Generate release notes** using GitHub's auto-generation API (like v1.0.0) - includes PR links, contributors, and changelog
5. Optionally enhance with structured content from `CHANGELOG.md`
6. Create a GitHub release with the artifacts and combined release notes

## Matrix Release Workflow (cross-platform)

We added a matrix workflow that builds and packages PortRegistry for multiple platforms: `.github/workflows/release-matrix.yml`.

- **Triggers**: The workflow runs on tag pushes that match `v*` and can be started manually via **Run workflow** (`workflow_dispatch`) where you provide a `tag` input. Use the same tag format as described above (for example `v1.0.5`).

- **Matrix runners**: `windows-latest`, `macos-latest`, `ubuntu-latest`.

- **What each runner does**:
   - Installs Node.js and Python, builds the frontend (`npm run build`) and installs backend dependencies.
   - Runs PyInstaller on the runner to produce platform-specific builds:
      - Windows runner produces `dist/portregistry.exe`.
      - macOS runner produces `dist/portregistry.app` (and the workflow will create a `PortRegistry.dmg` if the `.app` exists).
      - Linux runner produces a native binary in `dist/` and a `PortRegistry-linux-dist.tar.gz` tarball as a portable artifact.
   - Platform-specific packaging steps are included:
      - Windows: attempts to run Inno Setup (`ISCC.exe`) to create `installer/PortRegistry_Setup.exe` (the runner must have Inno Setup installed or it can be installed via Chocolatey in the job).
      - macOS: creates a compressed `.dmg` using `hdiutil` when `dist/portregistry.app` is present. Code signing and notarization are left to maintainers (requires Apple Developer credentials).
      - Linux: creates a compressed tarball of `dist` for distribution and testing.

- **Release creation & artifact uploads**:
   - Each matrix runner attaches the artifacts it produced to the same GitHub Release using `softprops/action-gh-release`.
   - This means multiple runners will update the same release object; artifacts are uploaded per-runner as they finish.

- **Notes & expectations**:
   - The workflow runs PyInstaller on each runner; it does not require pre-built binaries to be checked into the repo — builds are produced on the runners themselves.
   - macOS builds (and codesigning/notarization) must run on macOS runners or macOS machines (you cannot reliably codesign/notarize on Linux/Windows CI).
   - Windows installer creation requires Inno Setup to be available on the runner. The current workflow attempts to install Inno Setup via Chocolatey when running on Windows GitHub Actions.

- **Aggregation alternative (recommended for deterministic release creation)**:
   - If you prefer a single job to create the release once all platform artifacts are available, we can change the workflow to:
      1. Have each matrix job `upload-artifact` with its produced files.
      2. Add a final job that depends on the matrix jobs, `download-artifact` for each runner, then create the GitHub release and attach all artifacts in one step.
   - Advantages: avoids multiple jobs racing to update the same release and provides a single release body that can include all artifact metadata.

If you want, I can update the workflow to use the aggregated approach and add example `workflow_dispatch` instructions for manual runs.

## Prerequisites

- Ensure `CHANGELOG.md` has been updated with the new version's changes
- Version format in changelog should match: `## [1.0.5] - YYYY-MM-DD`
- Git tag should follow semantic versioning: `v1.0.5` (with `v` prefix)

## Creating a Release

### Method 1: Automatic Release (Recommended)

1. **Update CHANGELOG.md**
   - Add a new section for your version following the format:
     ```markdown
     ## [1.0.5] - 2025-12-17
     
     ### Added
     - Feature description
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

### Method 2: Manual Release (For Existing Tags)

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

## Release Notes Generation

The workflow uses a **hybrid approach** to generate release notes:

### 1. **GitHub Auto-Generated Notes (Primary)**
   - Automatically extracts information from **merged pull requests** between tags
   - Includes:
     - **"What's Changed"** section with PR summaries and links (e.g., `#1`, `#2`)
     - **Contributors** section listing all contributors
     - **Full Changelog** link to commit history
   - Uses GitHub's API: `POST /repos/{owner}/{repo}/releases/generate-notes`
   - This is the same format as manually clicking "Generate release notes" on GitHub

### 2. **CHANGELOG.md Enhancement (Optional)**
   - If auto-generation succeeds, changelog content is added as an additional "Detailed Changelog" section
   - If auto-generation fails, changelog is used as fallback
   - Provides structured, user-facing documentation (Added/Changed/Fixed sections)

### Comparison: v1.0.0 vs v1.0.5

| Feature | **v1.0.0 (Manual)** | **v1.0.5 (Automated)** |
|---------|---------------------|------------------------|
| **Created by** | `@haroonabbasi` | `@github-actions` |
| **Notes Source** | GitHub auto-generated (manual click) | GitHub auto-generated (API) + CHANGELOG.md |
| **PR Links** | ✅ Yes (`#1`, `#2`) | ✅ Yes (from auto-generation) |
| **Contributors** | ✅ Yes | ✅ Yes (from auto-generation) |
| **Structured Sections** | ❌ No | ✅ Yes (from CHANGELOG.md) |
| **Full Changelog Link** | ✅ Yes | ✅ Yes (from auto-generation) |

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
- Changelog content enhances but doesn't replace auto-generated notes

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



