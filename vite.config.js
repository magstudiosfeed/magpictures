import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // Relative base works for both github.io/magpictures AND custom domain root
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        about: resolve(root, 'about.html'),
        work: resolve(root, 'work.html'),
        expertise: resolve(root, 'expertise.html'),
        team: resolve(root, 'team.html'),
        contact: resolve(root, 'contact.html'),
      },
    },
  },
})
