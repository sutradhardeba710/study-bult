import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.js'),
          dest: 'assets',
        },
        {
          src: path.resolve(__dirname, 'node_modules/pdfjs-dist/cmaps'),
          dest: '',
        },
        {
          src: path.resolve(__dirname, 'node_modules/pdfjs-dist/standard_fonts'),
          dest: '',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
