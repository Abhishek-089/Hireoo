import { defineConfig, loadEnv } from 'vite'
import webExtension from 'vite-plugin-web-extension'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const appUrl = env.VITE_APP_URL || 'http://localhost:3000'

  return {
    plugins: [
      webExtension({
        manifest: 'public/manifest.json',
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
