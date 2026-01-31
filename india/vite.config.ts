import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for GitHub Pages: use /India/ if repo name is "India"
const base = (process.env.GITHUB_PAGES === 'true' || process.env.GITHUB_PAGES === true) ? '/India/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
