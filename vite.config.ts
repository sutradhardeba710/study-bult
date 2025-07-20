import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import viteCompression from 'vite-plugin-compression'

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
    }),
    // Compress output files
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Image optimization is now handled by the optimize-images.js script
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
      external: ['nodemailer'],
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['react-hot-toast', 'react-select', 'react-easy-crop', 'lucide-react'],
          'pdf': ['react-pdf', 'pdfjs-dist']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  css: {
    devSourcemap: false
  }
})
