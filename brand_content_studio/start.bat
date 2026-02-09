@echo off
REM Brand Content Studio - Windows Setup Script

echo.
echo ============================================
echo  Brand Content Studio - Setup Script
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo [1/4] Checking Python version...
python --version

echo.
echo [2/4] Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file - Please add your API keys if desired
) else (
    echo .env file already exists
)

echo.
echo [4/4] Setup complete!
echo.
echo ============================================
echo  Ready to launch Brand Content Studio!
echo ============================================
echo.
echo Starting application...
echo.
echo Open your browser to: http://localhost:5000
echo.

python run.py

pause
