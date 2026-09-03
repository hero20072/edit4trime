@echo off
setlocal enabledelayedexpansion
rem ============================================================
rem  One-click commit & push to GitHub (with retry + auto rebase)
rem  Usage: double-click to run (default msg "auto update")
rem         or: git-push.bat "commit message"
rem ============================================================

set "MSG=%~1"
if "%MSG%"=="" set "MSG=auto update"
set "MAX=6"
set /a "n=1"

echo == check working tree ==
git status --porcelain

>nul 2>&1 git add -A
git commit -m "%MSG%" 2>nul
if not errorlevel 1 echo [committed] %MSG%

echo == pushing (max %MAX% attempts, auto rebase) ==

:pushloop
if %n% gtr %MAX% goto :fail
echo -- push attempt %n%/%MAX% --

set "OUT="
for /f "delims=" %%L in ('git push origin main 2^>^&1') do set "OUT=!OUT! %%L"
set "RC=%errorlevel%"

if not "!OUT!"=="" echo !OUT!
if "%RC%"=="0" goto :ok

echo !OUT! | findstr /i "rejected fetch first" >nul
if not errorlevel 1 (
    echo -- remote ahead, pull --rebase --
    git pull --rebase origin main
    if errorlevel 1 echo [rebase failed]
)

set /a "n+=1"
timeout /t 4 /nobreak >nul
goto :pushloop

:ok
echo.
echo OK: pushed to GitHub successfully
endlocal
exit /b 0

:fail
echo.
echo FAILED: push failed, check network and retry; local commits kept
endlocal
exit /b 1