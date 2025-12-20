---
title: Installer (Inno Setup)
---

This project includes an Inno Setup script to produce a Windows installer: `portregistry.iss`.

Prerequisites
- Inno Setup 6+ (compiler `ISCC.exe` available on PATH)

Build steps (Windows)

1. Build the frontend and backend to produce `dist/portregistry.exe` (see `build_exe.ps1`).
2. Run the Inno Setup compiler:

```powershell
# If Inno Setup is on PATH
ISCC .\portregistry.iss

# Or call the compiler directly
& "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" .\portregistry.iss
```

Output will be placed in the `installer/` folder (adjust `portregistry.iss` as needed).

Cross-platform notes
- macOS and Linux packaging use PyInstaller + platform packaging steps (dmg, AppImage). See the release docs.
