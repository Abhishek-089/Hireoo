import { defineConfig, loadEnv } from 'vite'
import webExtension from 'vite-plugin-web-extension'

// URLs that should only exist in development builds, never in production.
// Showing localhost or staging URLs in the Chrome Web Store permissions dialog
// looks suspicious to users and triggers extra security warnings.
const DEV_ONLY_URL_PATTERNS = [
  'http://localhost:3000/*',
  'https://hireoo-taupe.vercel.app/*',
]

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const appUrl = env.VITE_APP_URL || 'http://localhost:3000'
  const isProduction = mode === 'production'

  return {
    plugins: [
      webExtension({
        manifest: 'manifest.json',
        transformManifest: (manifest) => {
          const permissionPattern = `${appUrl}/*`

          // Add host permission for the app URL
          if (!manifest.host_permissions.includes(permissionPattern)) {
            manifest.host_permissions.push(permissionPattern)
          }

          // Add content script match for the app URL
          const authBridge = manifest.content_scripts?.find((cs: any) =>
            cs.js?.some((js: string) => js.includes('auth-bridge'))
          )

          if (authBridge && !authBridge.matches.includes(permissionPattern)) {
            authBridge.matches.push(permissionPattern)
          }

          // Strip dev-only URLs from production builds so users don't see
          // "localhost" or staging domains in the permissions install dialog.
          if (isProduction) {
            manifest.host_permissions = manifest.host_permissions.filter(
              (p: string) => !DEV_ONLY_URL_PATTERNS.includes(p)
            )

            manifest.content_scripts?.forEach((cs: any) => {
              cs.matches = cs.matches.filter(
                (m: string) => !DEV_ONLY_URL_PATTERNS.includes(m)
              )
            })

            if (manifest.externally_connectable?.matches) {
              manifest.externally_connectable.matches =
                manifest.externally_connectable.matches.filter(
                  (m: string) => !DEV_ONLY_URL_PATTERNS.includes(m)
                )
            }
          }

          return manifest
        },
        browser: 'chrome',
        additionalInputs: ['src/popup/popup.html', 'src/offscreen/offscreen.html']
      }),
    ],
    define: {
      // Make env variables available in the extension code
      'import.meta.env.VITE_APP_URL': JSON.stringify(appUrl),
    },
  }
})
