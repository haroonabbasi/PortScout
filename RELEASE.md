# Release Process

This document describes how to create a new release for PortRegistry.

## Overview

Releases are automated using GitHub Actions. When a release is created, the workflow will:
1. Build the frontend (React/Vite)
2. Package the executable using PyInstaller
3. Generate a SHA256 checksum file
4. Extract release notes from `CHANGELOG.md`
5. Create a GitHub release with the artifacts

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



