import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Each parallel agent can run its own dev server: set VITE_CACHE_DIR to a private
// folder (e.g. node_modules/.vite-5182) so the dependency pre-bundles don't collide.
// The LAN host is only enabled through `npm run dev:phone` (vite --host).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',
  build: {
    chunkSizeWarningLimit: 900,
  },
})
