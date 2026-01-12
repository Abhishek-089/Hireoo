# Complete Hireoo App Setup Guide

## ✅ Currently Running
- **Frontend** (Next.js) - Port 3000
- **AI Service** (FastAPI) - Port 8000 (Docker)

## 🔧 Additional Services Needed

### 1. **PostgreSQL Database** (Required)
The frontend uses Prisma with PostgreSQL for:
- User authentication (NextAuth.js)
- Job postings storage
- Email drafts and logs
- User profiles and subscriptions

**Setup:**
```bash
# Option 1: Using Docker (Recommended)
docker run -d \
  --name hireoo-postgres \
  -e POSTGRES_USER=hireoo \
  -e POSTGRES_PASSWORD=hireoo123 \
  -e POSTGRES_DB=hireoo \
  -p 5432:5432 \
  postgres:15

# Option 2: Install PostgreSQL locally
# macOS: brew install postgresql@15
# Then: brew services start postgresql@15
# Create database: createdb hireoo
```

### 2. **Redis** (Required)
Used for BullMQ job queues:
- AI extraction jobs
- Job matching
- Email generation
- Gmail sync

**Setup:**
```bash
# Using Docker (Recommended)
docker run -d \
  --name hireoo-redis \
  -p 6379:6379 \
  redis:7-alpine

# Or install locally
# macOS: brew install redis
# Then: brew services start redis
```

### 3. **Environment Variables**
Create `.env.local` in the `frontend` directory:

```env
# Database
DATABASE_URL="postgresql://hireoo:hireoo123@localhost:5432/hireoo"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# AI Service
AI_SERVICE_URL="http://localhost:8000"

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Optional - for email sending)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@hireoo.com"

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 4. **Database Setup**
After PostgreSQL is running, initialize the database:

```bash
cd frontend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed initial data
npm run seed-plans
```

### 5. **Queue Worker** (Required for Background Jobs)
Run the queue processor in a separate terminal:

```bash
cd frontend
npm run process-queue
```

This processes:
- AI extraction jobs
- Job matching
- Email generation
- Gmail sync

## 🚀 Complete Startup Sequence

### Terminal 1: PostgreSQL
```bash
docker run -d --name hireoo-postgres \
  -e POSTGRES_USER=hireoo \
  -e POSTGRES_PASSWORD=hireoo123 \
  -e POSTGRES_DB=hireoo \
  -p 5432:5432 \
  postgres:15
```

### Terminal 2: Redis
```bash
docker run -d --name hireoo-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Terminal 3: AI Service (Already Running)
```bash
# Already running via Docker
docker ps | grep hireoo-ai-service
```

### Terminal 4: Frontend
```bash
cd frontend
# Create .env.local first (see above)
npx prisma generate
npx prisma db push
npm run dev
```

### Terminal 5: Queue Worker
```bash
cd frontend
npm run process-queue
```

### Terminal 6: Extension (Chrome)
1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `extension/dist` folder

## 📋 Quick Setup Script

Save this as `start-all.sh`:

```bash
#!/bin/bash

# Start PostgreSQL
docker run -d --name hireoo-postgres \
  -e POSTGRES_USER=hireoo \
  -e POSTGRES_PASSWORD=hireoo123 \
  -e POSTGRES_DB=hireoo \
  -p 5432:5432 \
  postgres:15

# Start Redis
docker run -d --name hireoo-redis \
  -p 6379:6379 \
  redis:7-alpine

# Start AI Service (if not already running)
docker run -d --name hireoo-ai-service \
  -p 8000:8000 \
  hireoo-ai-service

echo "✅ All services started!"
echo "Now run:"
echo "  cd frontend && npx prisma generate && npx prisma db push && npm run dev"
echo "  cd frontend && npm run process-queue"
```

## 🧪 Testing

1. **Frontend**: http://localhost:3000
2. **AI Service Health**: http://localhost:8000/health
3. **Database**: `psql -h localhost -U hireoo -d hireoo`
4. **Redis**: `redis-cli ping` (should return "PONG")

## 📝 Notes

- **PostgreSQL** is required for the app to work
- **Redis** is required for background job processing
- **Queue Worker** must be running for jobs to be processed
- **Extension** can work independently but needs frontend for authentication
- **AI Service** is already running and ready

## 🔍 Troubleshooting

**Database connection error:**
- Check PostgreSQL is running: `docker ps | grep postgres`
- Verify DATABASE_URL in `.env.local`

**Redis connection error:**
- Check Redis is running: `docker ps | grep redis`
- Test: `redis-cli ping`

**Queue not processing:**
- Make sure `npm run process-queue` is running
- Check Redis connection


