import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths let the app work at both the domain root and a
  // GitHub Pages repository subpath.
  base: './',
  plugins: [react()],
})
