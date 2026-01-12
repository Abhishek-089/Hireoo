import { defineConfig } from 'vite'
import webExtension from 'vite-plugin-web-extension'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    webExtension({
      manifest: 'public/manifest.json',
      browser: 'chrome',
      additionalInputs: ['src/popup/popup.html', 'src/offscreen/offscreen.html']
    }),
  ],
})

