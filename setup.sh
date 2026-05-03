#!/bin/bash

echo "🚀 Event Decoration Platform - Setup Script"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo "✅ NPM $(npm --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Setup environment
echo "⚙️  Setting up environment variables..."
if [ ! -f .env.local ]; then
    echo "📋 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual credentials"
else
    echo "✅ .env.local already exists"
fi
echo ""

# Build check
echo "🔨 Checking build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check your configuration."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your credentials"
echo "2. Set up your Supabase database"
echo "3. Run 'npm run dev' to start development server"
echo "4. Open http://localhost:3000 in your browser"
echo ""
