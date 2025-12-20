# Release Process

Releases are automated using GitHub Actions. The process builds the frontend, packages the backend, and uploads artifacts to a GitHub Release.

Key points
- Use semantic tags like `v1.0.5` to trigger matrix workflows.
- Matrix runners produce platform artifacts (Windows exe, macOS .app/.dmg, Linux tar/AppImage).
- The workflow can either let each runner attach artifacts to the release or use an aggregation job to collect artifacts then create the release once.

Quick manual release

```bash
# update CHANGELOG.md
git add CHANGELOG.md
git commit -m "chore: update changelog for vX.Y.Z"
git tag vX.Y.Z
git push origin vX.Y.Z
```

See `.github/workflows/release-matrix.yml` (if present) for the automation details and the preferred aggregation approach.
