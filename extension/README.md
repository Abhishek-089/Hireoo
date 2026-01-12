# Hireoo Chrome Extension

Chrome extension for Hireoo's AI-powered job search automation platform.

## Features

- 🔐 **JWT Authentication**: Secure login with Hireoo account
- 🎯 **LinkedIn Integration**: Scrape job postings automatically
- 📊 **Real-time Sync**: Sync data with Hireoo dashboard
- 🔄 **Background Processing**: Offscreen document for DOM parsing
- 🎨 **Modern UI**: Clean popup interface with status indicators

## Project Structure

```
extension/
├── src/
│   ├── background/          # Service worker
│   │   └── background.ts
│   ├── popup/              # Extension popup UI
│   │   ├── popup.html
│   │   └── popup.tsx
│   ├── content/            # LinkedIn page scripts
│   │   └── content.ts
│   ├── offscreen/          # Background DOM processing
│   │   ├── offscreen.html
│   │   └── offscreen.ts
│   └── utils/              # Shared utilities
│       └── auth.ts
├── public/
│   ├── manifest.json       # Extension manifest
│   └── icons/              # Extension icons
└── dist/                   # Build output
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Chrome browser

### Installation

```bash
# Navigate to extension directory
cd extension

# Install dependencies
npm install

# Start development build
npm run dev
```

### Building for Production

```bash
# Build for production
npm run build

# The built extension will be in the `dist` folder
```

### Loading in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. The extension should now be loaded

## Authentication Flow

1. **User clicks extension icon**
2. **If not authenticated**: Shows login screen with link to Hireoo website
3. **User signs in on website**: JWT token is stored in chrome.storage
4. **Extension detects token**: Shows authenticated status screen
5. **Background sync**: Extension communicates with Hireoo API using JWT

## Architecture

### Background Service Worker (`background.ts`)
- Handles authentication state
- Manages communication between components
- Processes LinkedIn scraping requests
- Creates offscreen documents for DOM parsing

### Popup UI (`popup.tsx`)
- Login/authenticated status screens
- Quick actions (scrape LinkedIn, open dashboard)
- Real-time status updates

### Content Script (`content.ts`)
- Injects into LinkedIn pages
- Adds "Apply with Hireoo" buttons to job cards
- Observes page changes for new job listings

### Offscreen Document (`offscreen.ts`)
- Provides DOM context for background processing
- Parses HTML content from LinkedIn
- Extracts structured job data

### Authentication (`auth.ts`)
- JWT token storage and validation
- API request helpers with authentication
- Token refresh logic

## API Integration

The extension communicates with the Hireoo API using authenticated requests:

```typescript
// Example API call
const response = await chrome.runtime.sendMessage({
  type: 'API_REQUEST',
  url: 'https://api.hireoo.com/jobs',
  method: 'GET'
})
```

## LinkedIn Integration

### Content Script Features
- Detects LinkedIn job pages
- Adds visual indicators when extension is active
- Observes DOM changes for new job cards
- Injects "Apply with Hireoo" buttons

### Scraping Flow
1. User browses LinkedIn jobs
2. Extension detects job cards
3. User clicks "Apply with Hireoo"
4. Content script extracts job data
5. Data sent to background script
6. Background processes and sends to Hireoo API
7. Job appears in dashboard matches

## Security

- **JWT Tokens**: Stored encrypted in chrome.storage
- **OAuth 2.0**: Secure authentication with Google (for Gmail)
- **CSP Compliance**: Follows Chrome extension security policies
- **Permission Justification**: Minimal required permissions only

## Development Tips

### Debugging
- Use Chrome DevTools for popup debugging
- Background script logs appear in `chrome://extensions/` → extension details
- Content script debugging via LinkedIn page DevTools

### Testing Authentication
```typescript
// Test auth check
chrome.runtime.sendMessage({ type: 'AUTH_CHECK' })

// Test login with JWT
chrome.runtime.sendMessage({
  type: 'AUTH_LOGIN',
  jwt: 'your-jwt-token-here'
})
```

### Hot Reload
The development build supports hot reload for faster development:
```bash
npm run dev
```

## Build Configuration

Uses Vite with `vite-plugin-web-extension` for optimal Chrome extension development:

- **TypeScript Support**: Full type checking
- **React Integration**: JSX compilation for popup
- **Asset Handling**: Automatic icon and manifest processing
- **Development Server**: Hot reload and error overlay

## Next Steps

This extension provides the foundation for LinkedIn job scraping. Future enhancements include:

- Advanced job data extraction
- Bulk application processing
- Email response tracking
- Interview scheduling integration
- Resume optimization suggestions

## Contributing

1. Follow the existing code structure
2. Add TypeScript types for new features
3. Test thoroughly on LinkedIn pages
4. Update this README for new features

## License

This project is part of the Hireoo platform.


