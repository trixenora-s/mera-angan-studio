#!/usr/bin/env pwsh
# Build script for Next.js app

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Building application..." -ForegroundColor Green
npm run build

Write-Host "Build complete! Ready for deployment." -ForegroundColor Green
