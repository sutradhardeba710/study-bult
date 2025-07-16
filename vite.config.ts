import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Copy robots.txt to build output
    viteStaticCopy({
      targets: [
        {
          src: 'public/robots.txt',
          dest: './'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true
  },
  optimizeDeps: {
    exclude: ['nodemailer']
  },
  build: {
    rollupOptions: {
      external: ['nodemailer']
    }
  }
})
