import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { alias: { '@': path.resolve(rootDir, 'src') } },
  server: { proxy: { '/api': 'http://localhost:5000' } },
})
