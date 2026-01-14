import { defineConfig, loadEnv } from 'vite'
import webExtension from 'vite-plugin-web-extension'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      webExtension({
        manifest: 'public/manifest.json',
        browser: 'chrome',
        additionalInputs: ['src/popup/popup.html', 'src/offscreen/offscreen.html']
      }),
    ],
    define: {
      // Make env variables available in the extension code
      'import.meta.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL || 'http://localhost:3000'),
    },
  }
})
