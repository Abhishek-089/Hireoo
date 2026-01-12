#!/bin/bash

echo "🚀 Starting all Hireoo services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL..."
if docker ps -a | grep -q hireoo-postgres; then
    docker start hireoo-postgres > /dev/null 2>&1
    echo "✅ PostgreSQL already exists, started it"
else
    docker run -d --name hireoo-postgres \
        -e POSTGRES_USER=hireoo \
        -e POSTGRES_PASSWORD=hireoo123 \
        -e POSTGRES_DB=hireoo \
        -p 5432:5432 \
        postgres:15 > /dev/null 2>&1
    echo "✅ PostgreSQL started"
fi

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Start Redis
echo "📦 Starting Redis..."
if docker ps -a | grep -q hireoo-redis; then
    docker start hireoo-redis > /dev/null 2>&1
    echo "✅ Redis already exists, started it"
else
    docker run -d --name hireoo-redis \
        -p 6379:6379 \
        redis:7-alpine > /dev/null 2>&1
    echo "✅ Redis started"
fi

# Start AI Service
echo "📦 Starting AI Service..."
if docker ps -a | grep -q hireoo-ai-service; then
    docker start hireoo-ai-service > /dev/null 2>&1
    echo "✅ AI Service already exists, started it"
else
    docker run -d --name hireoo-ai-service \
        -p 8000:8000 \
        hireoo-ai-service > /dev/null 2>&1
    echo "✅ AI Service started"
fi

# Wait a bit for services to start
sleep 2

echo ""
echo "✅ All services started!"
echo ""
echo "📋 Service Status:"
docker ps --filter "name=hireoo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📝 Next steps:"
echo "1. Create .env.local in frontend/ directory (see COMPLETE_SETUP_GUIDE.md)"
echo "2. Run database migrations:"
echo "   cd frontend && npx prisma generate && npx prisma db push"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Start queue worker (in another terminal):"
echo "   cd frontend && npm run process-queue"
echo "5. Load extension in Chrome: chrome://extensions/ → Load unpacked → extension/dist"
echo ""


