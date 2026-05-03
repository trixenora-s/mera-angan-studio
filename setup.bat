@echo off
setlocal enabledelayedexpansion

echo.
echo 🚀 Event Decoration Platform - Setup Script
echo ===========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo ✅ Node.js %NODE_VERSION% detected
echo ✅ NPM %NPM_VERSION% detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

REM Setup environment
echo ⚙️  Setting up environment variables...
if not exist .env.local (
    echo 📋 Creating .env.local from .env.example...
    copy .env.example .env.local
    echo ⚠️  Please update .env.local with your actual credentials
) else (
    echo ✅ .env.local already exists
)
echo.

REM Build check
echo 🔨 Checking build...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed. Please check your configuration.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Update .env.local with your credentials
echo 2. Set up your Supabase database
echo 3. Run 'npm run dev' to start development server
echo 4. Open http://localhost:3000 in your browser
echo.

pause
