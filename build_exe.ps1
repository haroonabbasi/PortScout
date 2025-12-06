# Build the frontend
npm run build

# Build the executable (No Console Window)
# --noconsole: Hides the command prompt
# --onefile: Packages everything into a single .exe
# --add-data: Bundles the frontend 'dist' folder
pyinstaller --name portscout --noconsole --onefile --add-data "dist;dist" back-end/server.py

Write-Host "Build Complete! Executable is located at dist/portscout.exe"
