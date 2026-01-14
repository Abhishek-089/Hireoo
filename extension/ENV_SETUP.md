# Environment Variable Configuration for Hireoo Extension

## Overview

The Hireoo Chrome extension now supports environment variables, making it easy to switch between local development and production environments.

## Setup

### 1. Environment File

Create or edit the `.env` file in the extension directory:

```bash
# For Production
VITE_APP_URL=https://hireoo-taupe.vercel.app

# For Local Development (uncomment this line)
# VITE_APP_URL=http://localhost:3000
```

### 2. Switch Environments

**For Production:**
```env
VITE_APP_URL=https://hireoo-taupe.vercel.app
```

**For Local Development:**
```env
VITE_APP_URL=http://localhost:3000
```

### 3. Rebuild Extension

After changing the `.env` file, rebuild the extension:

```bash
cd extension
npm run build
```

### 4. Reload Extension in Chrome

1. Go to `chrome://extensions/`
2. Find "Hireoo - AI Job Search Assistant"
3. Click the refresh icon 🔄

## How It Works

The `VITE_APP_URL` environment variable controls:

1. **API Base URL** ([`auth.ts`](file:///Volumes/SAGE%20ssd/Hireoo/extension/src/utils/auth.ts#L12))
   - Where the extension makes API requests
   - Used for authenticated requests to the backend

2. **Login Redirect** ([`popup.tsx`](file:///Volumes/SAGE%20ssd/Hireoo/extension/src/popup/popup.tsx#L83))
   - Where users are redirected when clicking "Sign In"
   - Opens the dashboard login page

3. **Manifest Permissions** ([`manifest.json`](file:///Volumes/SAGE%20ssd/Hireoo/extension/public/manifest.json))
   - Currently still needs manual update for host_permissions
   - Auth-bridge content script runs on the configured domain

## Files Modified

- **[`.env`](file:///Volumes/SAGE%20ssd/Hireoo/extension/.env)** - Your local environment configuration (gitignored)
- **[`.env.example`](file:///Volumes/SAGE%20ssd/Hireoo/extension/.env.example)** - Template with examples
- **[`vite.config.ts`](file:///Volumes/SAGE%20ssd/Hireoo/extension/vite.config.ts)** - Loads and injects env vars
- **[`src/vite-env.d.ts`](file:///Volumes/SAGE%20ssd/Hireoo/extension/src/vite-env.d.ts)** - TypeScript type definitions
- **[`src/utils/auth.ts`](file:///Volumes/SAGE%20ssd/Hireoo/extension/src/utils/auth.ts)** - Uses `VITE_APP_URL`
- **[`src/popup/popup.tsx`](file:///Volumes/SAGE%20ssd/Hireoo/extension/src/popup/popup.tsx)** - Uses `VITE_APP_URL`

## Important Notes

> [!IMPORTANT]
> The `.env` file is gitignored to prevent accidentally committing sensitive or environment-specific configuration. Always use `.env.example` as a template.

> [!TIP]
> When switching between local and production, you only need to:
> 1. Edit `.env`
> 2. Run `npm run build`
> 3. Reload the extension in Chrome

> [!WARNING]
> The `manifest.json` file still contains hardcoded URLs for `host_permissions` and `content_scripts` matches. These currently point to production (`https://hireoo-taupe.vercel.app`). If you need to test locally, you'll need to manually update these in `public/manifest.json` and rebuild.

## Future Improvements

To make the manifest.json fully dynamic, you could:
1. Generate manifest.json during build using the env variable
2. Use a build script to replace URLs in manifest.json
3. Maintain separate manifest files for dev/prod
