#!/bin/bash

# Neon PostgreSQL Migration Setup Script
# Run this script to set up Neon database connection

set -e

echo "🚀 Neon PostgreSQL Migration Setup"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file first"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install pg
npm install --save-dev @types/pg

echo "✅ Dependencies installed"
echo ""

echo "🔐 Step 2: Environment Variables Setup"
echo "--------------------------------------"
echo ""
echo "Get your Neon connection string:"
echo "1. Go to https://console.neon.tech"
echo "2. Select your project"
echo "3. Copy the connection string"
echo ""
echo "Connection string format:"
echo "postgresql://user:password@ep-xxx.us-east-1.neon.tech/dbname?sslmode=require"
echo ""

# Check if DATABASE_URL is set
if grep -q "^DATABASE_URL=" .env; then
    echo "✅ DATABASE_URL already set in .env"
else
    echo "⚠️  DATABASE_URL not found in .env"
    echo "📝 Please add to .env:"
    echo "DATABASE_URL=\"postgresql://...your-connection-string...\""
fi

echo ""
echo "🗄️  Step 3: Database Schema"
echo "-----------------------------"
echo ""
echo "Choose how to import schema:"
echo ""
echo "Option A: Using Neon SQL Editor (Easiest)"
echo "  1. Go to Neon console"
echo "  2. Click 'SQL Editor'"
echo "  3. Copy content from: supabase-schema-neon.sql"
echo "  4. Paste and execute"
echo ""
echo "Option B: Using psql (Command line)"
if command -v psql &> /dev/null; then
    echo "  Run: psql \$DATABASE_URL < supabase-schema-neon.sql"
else
    echo "  Install PostgreSQL client first"
fi
echo ""

echo "📚 Step 4: Documentation"
echo "------------------------"
echo ""
echo "Read the migration guide:"
echo "  cat NEON_MIGRATION_GUIDE.md"
echo ""
echo "API examples:"
echo "  cat lib/api-examples-neon.ts"
echo ""

echo "🧪 Step 5: Test Database Connection"
echo "------------------------------------"
echo ""
npm run dev &
DEV_PID=$!
sleep 3

echo "Testing database connection..."
curl -s http://localhost:3000/api/health || echo "⚠️  Health check endpoint may not exist yet"

kill $DEV_PID 2>/dev/null || true

echo ""
echo "✨ Setup Complete!"
echo "==================="
echo ""
echo "Next steps:"
echo "1. ✅ Update all API routes to use new database client"
echo "2. ✅ Configure NextAuth for PostgreSQL"
echo "3. ✅ Test locally: npm run dev"
echo "4. ✅ Deploy to Vercel with Neon secrets"
echo ""
echo "Resources:"
echo "  - Neon Docs: https://neon.tech/docs"
echo "  - NextAuth Docs: https://next-auth.js.org"
echo "  - PostgreSQL Docs: https://www.postgresql.org/docs"
echo ""
