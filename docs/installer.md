---
title: Installer
---

# Creating Installers

This guide covers how to create native installers for PortRegistry across different platforms.

## Windows - Inno Setup

The repository includes an Inno Setup script to produce a native Windows installer: [`portregistry.iss`](https://github.com/haroonabbasi/port-registry/blob/main/portregistry.iss).

### Prerequisites
- Install [Inno Setup 6+](https://jrsoftware.org/isinfo.php)
- The compiler executable is `ISCC.exe`

### Build Steps

1. **Build the executable**
   - Ensure you've built the frontend and created the `dist\portregistry.exe` binary
   - You can use the provided build script: `.\buid.bat`

2. **Run the Inno Setup compiler**
   ```powershell
   # If Inno Setup is in your PATH
   ISCC .\portregistry.iss

   # Or call the compiler directly (default install path)
   & "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" .\portregistry.iss
   ```

3. **Output**
   - The installer will be written to the `installer` folder
   - Filename: `PortRegistry_Setup.exe`

### What Gets Packaged
The script packages:
- `dist\portregistry.exe` - Main executable
- `.env_example` - Example environment configuration
- `LICENSE.txt` - License file

Edit `portregistry.iss` to add/remove files or change icons.

## macOS - .app and .dmg

Building native installers for macOS requires running on macOS or using macOS CI runners.

### Prerequisites
- macOS machine or GitHub Actions macOS runner
- PyInstaller installed
- Apple Developer account (for code signing and notarization)

### Build Steps

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Create macOS application bundle**
   ```bash
   pyinstaller --name portregistry --windowed --add-data "dist:dist" back-end/server.py
   ```
   This produces `dist/portregistry.app`

3. **Create a .dmg installer**
   ```bash
   hdiutil create -volname PortRegistry -srcfolder dist/portregistry.app -ov -format UDZO PortRegistry.dmg
   ```

### Code Signing & Notarization

If distributing outside the App Store, you must code sign and notarize:

```bash
# Code sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: YOUR NAME (TEAMID)" dist/portregistry.app

# Notarize the DMG
xcrun altool --notarize-app -f PortRegistry.dmg --primary-bundle-id com.example.portregistry -u YOUR_APPLE_ID -p APP_SPECIFIC_PASSWORD
```

::: tip Alternative Tool
`py2app` is another option for creating macOS bundles. For simpler workflows, consider building on macOS CI (GitHub Actions macOS runners).
:::

## Linux - AppImage / DEB

### AppImage (Recommended)

AppImage provides broad compatibility across Linux distributions.

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Create a single binary with PyInstaller**
   ```bash
   pyinstaller --name portregistry --noconsole --onefile --add-data "dist:dist" back-end/server.py
   ```

3. **Create AppImage**
   - Use `appimagetool` or `linuxdeploy` to bundle runtime and dependencies
   - Create a `.desktop` file and AppDir structure
   - Run `appimagetool AppDir` to produce `PortRegistry.AppImage`

### DEB/RPM Packages

For distribution-specific installers:
- Use `fpm` (Effing Package Management) for easy package creation
- Or use native tools: `dpkg-deb`, `rpmbuild`

Example with fpm:
```bash
fpm -s dir -t deb -n portregistry -v 1.0.5 \
  --description "Port monitoring and process control" \
  dist/portregistry=/usr/local/bin/portregistry
```

## CI and Cross-Platform Builds

For reproducible builds and cross-platform packaging, use CI builders with runners per OS.

### Recommended Strategy

Use GitHub Actions matrix runners:
- **Windows runner**: Run `.\buid.bat` then `ISCC` to produce Inno Setup installer
- **macOS runner**: Run `npm run build`, PyInstaller, then `hdiutil` and notarize
- **Linux runner**: Run `npm run build`, PyInstaller, then produce AppImage or packages

### Example Workflow Structure

```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - name: Build frontend
        run: npm run build
      - name: Package with PyInstaller
        run: # OS-specific commands
```

::: warning Platform-Specific Tools
Building installers requires OS-specific tooling:
- **Windows**: Inno Setup
- **macOS**: codesign, hdiutil, altool
- **Linux**: appimagetool, fpm

Install these tools on the corresponding build machine.
:::

### Testing

Always test installers on clean VMs or containers that match your target audience to ensure all dependencies are properly bundled.

## See Also

- [Release Process](./release.md) - How releases are automated
- [Automation & CI](./automation.md) - CI/CD workflow details
