@echo off
echo ========================================
echo  WEBtoAPK Studio - Build Script
echo ========================================
echo.

echo [1/4] Killing all Electron processes...
echo.

REM Kill Electron processes by name
taskkill /f /im "electron.exe" 2>nul
taskkill /f /im "webtoapk-studio.exe" 2>nul
taskkill /f /im "Electron.exe" 2>nul

REM Kill any Node.js processes that might be related
taskkill /f /im "node.exe" 2>nul

REM Kill processes by window title (if any Electron apps are running)
for /f "tokens=2 delims=," %%i in ('tasklist /fo csv ^| findstr /i "electron"') do (
    echo Killing process: %%i
    taskkill /f /pid %%i 2>nul
)

REM Wait a moment for processes to fully terminate
timeout /t 2 /nobreak >nul

echo [2/4] Cleaning old build directories...
echo.

REM Remove old build directories
if exist "dist" (
    echo Removing dist folder...
    rmdir /s /q "dist" 2>nul
)

if exist "build" (
    echo Removing build folder...
    rmdir /s /q "build" 2>nul
)

if exist "release" (
    echo Removing release folder...
    rmdir /s /q "release" 2>nul
)

if exist "output" (
    echo Removing output folder...
    rmdir /s /q "output" 2>nul
)

echo [3/4] Building Electron application...
echo.

REM Run npm package command
call npm run package

REM Check if the build was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  BUILD SUCCESSFUL! 
    echo ========================================
    echo.
    echo Your exe file is ready at:
    echo output\webtoapk-studio-win32-x64\webtoapk-studio.exe
    echo.
    echo [4/4] Opening build directory...
    explorer "output\webtoapk-studio-win32-x64"
    echo.
    echo Press any key to exit...
    pause >nul
) else (
    echo.
    echo ========================================
    echo  BUILD FAILED!
    echo ========================================
    echo.
    echo There was an error during the build process.
    echo Check the output above for details.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Build process completed successfully!
echo.
pause