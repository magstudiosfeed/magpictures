import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        about: resolve(root, 'about/index.html'),
        work: resolve(root, 'work/index.html'),
        expertise: resolve(root, 'expertise/index.html'),
        team: resolve(root, 'team/index.html'),
        contact: resolve(root, 'contact/index.html'),
      },
    },
  },
})
