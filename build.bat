@echo off
REM =================================================================
REM PortRegistry Build Script (Windows)
REM =================================================================
REM This script builds the complete PortRegistry application:
REM 1. Frontend (React/Vite)
REM 2. Backend executable (Python with PyInstaller)
REM =================================================================

echo ========================================
echo PortRegistry Build Process Started
echo ========================================

REM Step 1: Build the frontend
echo.
echo [Step 1/2] Building frontend (React/Vite)...
npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Frontend build failed with exit code %ERRORLEVEL%
    echo ========================================
    pause
    exit /b 1
)
echo ✓ Frontend build completed successfully

REM Step 2: Build the executable using PyInstaller
echo.
echo [Step 2/2] Building executable (PyInstaller)...
echo Configuration:
echo   - No console window (hidden)
echo   - Single file executable
echo   - Frontend bundled inside
echo.
pyinstaller portregistry.spec --clean
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: PyInstaller build failed with exit code %ERRORLEVEL%
    echo ========================================
    pause
    exit /b 1
)
echo ✓ Executable build completed successfully

REM Step 3: Verify output
echo.
echo [Step 3/3] Verifying build output...
if exist "dist\portregistry.exe" (
    echo ✓ Build verification successful
    echo   Executable: dist\portregistry.exe
    for %%I in ("dist\portregistry.exe") do (
        set /a sizeMB=%%~zI/1048576
        echo   File size: !sizeMB! MB
    )
) else (
    echo.
    echo ERROR: Build verification failed - executable not found at dist\portregistry.exe
    echo ========================================
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 Build completed successfully!
echo Executable ready at: dist\portregistry.exe
echo ========================================
echo.
pause
