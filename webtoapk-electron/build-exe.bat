@echo off
echo ========================================
echo  WEBtoAPK Studio - Build Script
echo ========================================
echo.

echo [1/5] Killing all Electron and Node processes...
echo.

REM Kill Electron processes by name (multiple variations)
taskkill /f /im "electron.exe" 2>nul
taskkill /f /im "webtoapk-studio.exe" 2>nul
taskkill /f /im "Electron.exe" 2>nul
taskkill /f /im "ELECTRON.EXE" 2>nul

REM Kill any Node.js processes that might be related
taskkill /f /im "node.exe" 2>nul
taskkill /f /im "npm.exe" 2>nul

REM Kill any processes with "webtoapk" in the name
wmic process where "name like '%%electron%%'" delete 2>nul
wmic process where "name like '%%webtoapk%%'" delete 2>nul

echo Waiting for processes to terminate...
timeout /t 5 /nobreak >nul

echo [2/5] Force unlocking files...
echo.

REM Try to unlock files using PowerShell
powershell -Command "Get-Process | Where-Object {$_.ProcessName -match 'electron|webtoapk|node'} | Stop-Process -Force" 2>nul

REM Wait again
timeout /t 3 /nobreak >nul

echo [3/5] Cleaning old build directories...
echo.

REM Clean up ALL possible build directories
for %%d in (dist build release output) do (
    if exist "%%d" (
        echo Removing %%d folder...
        rmdir /s /q "%%d" 2>nul
        if exist "%%d" (
            echo Retrying %%d removal...
            timeout /t 2 /nobreak >nul
            rmdir /s /q "%%d" 2>nul
        )
        if exist "%%d" (
            echo Force removing %%d with PowerShell...
            powershell -Command "Remove-Item -Path '%%d' -Recurse -Force -ErrorAction SilentlyContinue" 2>nul
        )
    )
)

REM Clean up any build_* directories
echo Cleaning up temporary build directories...
for /d %%i in (build_*) do (
    echo Removing %%i...
    rmdir /s /q "%%i" 2>nul
)

echo [4/5] Building Electron application...
echo.

REM Always build to 'output' directory for consistency
echo Building to output directory...

REM Ensure package.json uses 'output' directory
powershell -Command "(Get-Content package.json) -replace 'out=[^\"]*', 'out=output' | Set-Content package.json.tmp"
if exist package.json.tmp (
    move package.json package.json.bak
    move package.json.tmp package.json
)

REM Run npm package command
call npm run package

REM Restore original package.json if backup exists
if exist package.json.bak (
    move package.json.bak package.json
)

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
    echo [5/5] Opening build directory...
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
    echo Trying alternative approach with system temp directory...
    
    REM Try building to system temp as fallback
    set TEMP_BUILD=%TEMP%\webtoapk_build_%RANDOM%
    mkdir "%TEMP_BUILD%" 2>nul
    
    echo Building to: %TEMP_BUILD%
    powershell -Command "(Get-Content package.json) -replace 'out=[^\"]*', 'out=%TEMP_BUILD%' | Set-Content package.json"
    
    call npm run package
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo Alternative build successful!
        echo Copying files back to output directory...
        if exist "output" rmdir /s /q "output" 2>nul
        xcopy "%TEMP_BUILD%\webtoapk-studio-win32-x64" "output\" /E /I /Y
        rmdir /s /q "%TEMP_BUILD%" 2>nul
        echo.
        echo Build completed! Opening output directory...
        explorer "output"
    ) else (
        echo.
        echo Alternative build also failed.
        echo Please close any running Electron apps and try again.
    )
    
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo Build process completed successfully!
echo.
pause