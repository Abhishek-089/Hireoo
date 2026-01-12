# Hireoo - AI-Powered Job Search Automation

An intelligent job search platform that automates LinkedIn scraping, matches jobs with AI, and sends personalized cold emails.

## Project Structure

```
Hireoo/
├── frontend/           # Next.js web application
│   ├── src/           # Source code
│   ├── prisma/        # Database schema
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── extension/         # Chrome extension
│   ├── src/          # Extension source
│   ├── public/       # Extension manifest & icons
│   └── package.json  # Extension dependencies
└── README.md         # This file
```

## Features

### Web Application
- ✅ User authentication (NextAuth.js)
- ✅ Onboarding flow with job preferences
- ✅ Dashboard with job matches and email activity
- ✅ Gmail OAuth integration
- ✅ PostgreSQL database with Prisma ORM

### Chrome Extension
- 🔄 JWT-based authentication
- 🔄 LinkedIn job scraping foundation
- 🔄 Background processing with service worker
- 🔄 Offscreen document for DOM parsing
- 🔄 Real-time sync with web dashboard

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Chrome browser (for extension)

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb hireoo

# Update DATABASE_URL in frontend/.env.local
DATABASE_URL="postgresql://username:password@localhost:5432/hireoo"
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 3. Extension Setup
```bash
cd extension
npm install
npm run dev
```

### 4. Load Extension in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/dist` folder

## Development Workflow

### Frontend Development
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npx prisma studio    # Database GUI
```

### Extension Development
```bash
cd extension
npm run dev          # Development build with hot reload
npm run build        # Production build
```

### Database Migrations
```bash
cd frontend
npx prisma migrate dev    # Create and apply migrations
npx prisma generate       # Update Prisma client
npx prisma db push        # Push schema changes
```

## Environment Variables

### Frontend (.env.local)
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
ENCRYPTION_KEY="32-char-key"
```

### Extension
No environment variables needed - uses Chrome storage for auth.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Get session info

### Dashboard
- `GET /api/dashboard/overview` - Stats and recent activity
- `GET /api/dashboard/job-matches` - User's job matches
- `GET /api/dashboard/email-activity` - Email history

### Gmail Integration
- `GET /api/gmail/status` - Connection status
- `POST /api/gmail/revoke` - Disconnect Gmail
- `POST /api/gmail/test-email` - Send test email

## Extension Architecture

### Background Service Worker
- Handles authentication and API communication
- Manages LinkedIn scraping requests
- Creates offscreen documents for processing

### Popup Interface
- Login screen for unauthenticated users
- Status dashboard for authenticated users
- Quick actions (scrape, open dashboard)

### Content Scripts
- Injects into LinkedIn pages
- Adds "Apply with Hireoo" buttons to job cards
- Observes DOM changes for new content

### Offscreen Documents
- Provides DOM context for background processing
- Parses LinkedIn HTML content
- Extracts structured job data

## Security

- **JWT Authentication**: Secure token-based auth
- **Encrypted Storage**: Gmail tokens encrypted in database
- **OAuth 2.0**: Secure Google integration
- **CSP Compliance**: Chrome extension security policies
- **Permission Justification**: Minimal required permissions

## Contributing

1. **Frontend**: `cd frontend` - Next.js app with TypeScript
2. **Extension**: `cd extension` - Chrome extension with Vite
3. **Database**: Prisma ORM with PostgreSQL
4. **Styling**: TailwindCSS throughout

## Roadmap

### Completed ✅
- User authentication and onboarding
- Dashboard with stats and job matches
- Gmail OAuth integration
- Chrome extension foundation

### In Progress 🔄
- LinkedIn job scraping implementation
- Email automation workflows
- Advanced AI job matching

### Planned 📋
- Team collaboration features
- Interview scheduling
- Resume optimization
- Advanced analytics

## Support

- **Issues**: Open GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Documentation**: Check individual README files

## License

This project is proprietary software for Hireoo.


