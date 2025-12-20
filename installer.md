### Creating an Installer (Windows - Inno Setup)

The repository includes an Inno Setup script you can use to produce a native Windows installer: [portregistry.iss](portregistry.iss).

- **Prerequisite**: Install Inno Setup (Inno Setup 6+). The compiler executable is `ISCC.exe`.
- **Build steps**:
    - Ensure you've built the frontend and created the `dist\portregistry.exe` binary (see steps above or run `./build_exe.ps1`).
    - From PowerShell (example):
        ```powershell
        # If Inno Setup is in your PATH
        ISCC .\portregistry.iss

        # Or call the compiler directly (default install path):
        & "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" .\portregistry.iss
        ```
- **Output**: The installer will be written to the `installer` folder (filename defined in the script, e.g. `PortRegistry_Setup.exe`).
- The script packages `dist\portregistry.exe`, `.env_example`, and `LICENSE.txt` into the installer — edit `portregistry.iss` if you need to add/remove files or change icons.

### Other OS: macOS and Linux (overview and recommended commands)

Note: Building native installers for macOS and Linux is best done on the target OS or in CI runners that match the target platform. Cross-building from Windows is possible but more complex; consider using GitHub Actions or separate build VMs.

- **macOS (.app + .dmg)**:
    - Build the frontend: `npm run build`.
    - Create a macOS application bundle with PyInstaller (run on macOS):
        ```bash
        pyinstaller --name portregistry --windowed --add-data "dist:dist" back-end/server.py
        ```
        This produces `dist/portregistry.app` (or a `dist/portregistry` folder depending on options).
    - Create a compressed installer (.dmg) (example using `hdiutil`):
        ```bash
        hdiutil create -volname PortRegistry -srcfolder dist/portregistry.app -ov -format UDZO PortRegistry.dmg
        ```
    - Code signing & notarization: If you distribute outside the App Store, you should `codesign` and notarize the `.app` using an Apple Developer account. Example commands:
        ```bash
        codesign --deep --force --verify --verbose --sign "Developer ID Application: YOUR NAME (TEAMID)" dist/portregistry.app
        xcrun altool --notarize-app -f PortRegistry.dmg --primary-bundle-id com.example.portregistry -u YOUR_APPLE_ID -p APP_SPECIFIC_PASSWORD
        ```
    - Alternatives: `py2app` is another option for creating macOS bundles; for simpler workflows consider building on macOS CI (GitHub Actions macOS runners).

- **Linux (AppImage / DEB)**:
    - Build frontend: `npm run build`.
    - Create a single binary with PyInstaller (example on Linux):
        ```bash
        pyinstaller --name portregistry --noconsole --onefile --add-data "dist:dist" back-end/server.py
        ```
    - AppImage (recommended for broad compatibility): use `appimagetool` or `linuxdeploy` to bundle runtime and dependencies into an AppImage.
        - Typical flow: create a `.desktop` file and AppDir, then run `appimagetool AppDir` to produce `PortRegistry.AppImage`.
    - DEB/RPM packages: use `fpm` or native packaging tools (`dpkg-deb`, `rpmbuild`) if you want distribution-specific installers.

### CI and cross-platform builds

- For reproducible builds and cross-platform packaging, use CI builders (GitHub Actions, Azure Pipelines, etc.) with runners per OS. Example strategy:
    - Windows runner: run `./build_exe.ps1` then `ISCC` to produce the Inno Setup installer.
    - macOS runner: run `npm run build`, PyInstaller, then `hdiutil` and notarize.
    - Linux runner: run `npm run build`, PyInstaller, then produce AppImage or distribution packages.

- Notes & tips:
    - Building installers often requires OS-specific tooling (Inno Setup, codesign, hdiutil, appimagetool). Install those tools on the corresponding build machine.
    - Test installers on clean VMs or containers that match your target audience.
    - If you want, I can add CI workflow examples (GitHub Actions) for each platform.
