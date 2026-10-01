import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Serve images as files, so each browser downloads only the format it uses.
  build: {
    assetsInlineLimit: 0,
    // /login is the mobile app's sign-in screen, served as its own page.
    rollupOptions: { input: ['index.html', 'login.html'] },
  },
})
