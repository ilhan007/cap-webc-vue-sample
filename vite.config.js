import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  root: 'app/vue',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src') // Adjust if needed
    }
  },
  build: {
    outDir: 'static',
    emptyOutDir: true
  },
  base: "/vue/static/",
})
