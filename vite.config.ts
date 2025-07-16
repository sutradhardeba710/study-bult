import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  // Check if .env.local exists
  const hasEnvLocal = fs.existsSync(path.resolve(process.cwd(), '.env.local'))
  
  return {
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
    define: {
      // Add a custom environment variable to indicate the source
      'import.meta.env.VITE_ENV_SOURCE': JSON.stringify(hasEnvLocal ? 'env.local' : 'process')
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
  }
})
