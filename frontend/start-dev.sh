#!/bin/bash

echo "🚀 Starting Next.js development server..."
echo "📋 Checking services..."

# Check if PostgreSQL is running
if ! docker ps | grep -q hireoo-postgres; then
  echo "⚠️  PostgreSQL is not running. Starting it..."
  docker start hireoo-postgres 2>/dev/null || echo "❌ Failed to start PostgreSQL"
fi

# Check if Redis is running
if ! docker ps | grep -q hireoo-redis; then
  echo "⚠️  Redis is not running. Starting it..."
  docker start hireoo-redis 2>/dev/null || echo "❌ Failed to start Redis"
fi

# Clear cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next

# Start with verbose logging
echo "✅ Starting Next.js..."
NODE_OPTIONS='--max-old-space-size=4096' npm run dev

