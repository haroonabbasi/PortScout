# Build the frontend
npm run build

# Build the executable (No Console Window)
# --noconsole: Hides the command prompt
# --onefile: Packages everything into a single .exe
# --add-data: Bundles the frontend 'dist' folder
# pyinstaller --name portregistry --noconsole --onefile --add-data "dist;dist" back-end/server.py
pyinstaller portregistry.spec --clean

Write-Host "Build Complete! Executable is located at dist/portregistry.exe"
