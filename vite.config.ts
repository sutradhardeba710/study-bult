import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap';

const pwaPlugin = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.png', 'logo.png', 'robots.txt'],
  manifest: {
    name: 'Study Volte',
    short_name: 'Study Volte',
    description: 'Your Gateway to Academic Excellence',
    theme_color: '#ffffff',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] }
        }
      },
      {
        urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'cloudinary-images',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
        }
      }
    ]
  }
});

// Build flag to disable PWA plugin during SSR mode which throws MISSING_EXPORT build error
const isSsrBuild = process.argv.includes('--ssr');
const plugins: import('vite').PluginOption[] = [react()];
if (!isSsrBuild) {
  plugins.push(pwaPlugin);
}
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ...plugins,
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false
    }),
    // Brotli compression (smaller than gzip, preferred by modern browsers)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false
    }),
    // Generate sitemap.xml automatically on build
    Sitemap({
      hostname: 'https://study-volte.site', // Real production URL
      dynamicRoutes: (() => {
        // ── Static pages with higher priority ────────────────────────────
        const staticPages: Array<{ route: string; priority: number; changefreq?: string }> = [
          { route: '/', priority: 1.0, changefreq: 'daily' },
          { route: '/browse', priority: 0.9, changefreq: 'daily' },
          { route: '/question-papers', priority: 0.9, changefreq: 'weekly' },

          // ── Cluster A: Universities ──────────────────────────────────────
          { route: '/question-papers/universities/tripura', priority: 0.9, changefreq: 'weekly' },
          { route: '/universities/tripura/mbbu-question-papers', priority: 0.9, changefreq: 'weekly' },
          { route: '/universities/tripura/bbmc-question-papers', priority: 0.9, changefreq: 'weekly' },

          // ── Cluster B: Courses ───────────────────────────────────────────
          { route: '/question-papers/courses', priority: 0.8, changefreq: 'weekly' },
          { route: '/question-papers/courses/ba', priority: 0.8, changefreq: 'weekly' },
          { route: '/question-papers/courses/bsc', priority: 0.8, changefreq: 'weekly' },
          { route: '/question-papers/courses/bcom', priority: 0.8, changefreq: 'weekly' },
          { route: '/question-papers/courses/bca', priority: 0.75, changefreq: 'weekly' },

          // ── Cluster C: Guides ────────────────────────────────────────────
          { route: '/guides', priority: 0.7, changefreq: 'monthly' },
          { route: '/guides/how-to-use-previous-year-papers', priority: 0.75, changefreq: 'monthly' },
          { route: '/guides/are-questions-repeated-in-exams', priority: 0.75, changefreq: 'monthly' },
          { route: '/guides/exam-preparation-strategy', priority: 0.75, changefreq: 'monthly' },

          // ── Cluster E: Exams ─────────────────────────────────────────────
          { route: '/exams', priority: 0.8, changefreq: 'weekly' },
          { route: '/exams/cuet', priority: 0.8, changefreq: 'weekly' },
          { route: '/exams/cuet/2025', priority: 0.75, changefreq: 'weekly' },
          { route: '/exams/cuet/2024', priority: 0.7, changefreq: 'monthly' },
          { route: '/exams/ssc', priority: 0.8, changefreq: 'weekly' },
          { route: '/exams/ssc-cgl', priority: 0.75, changefreq: 'weekly' },
          { route: '/exams/ssc-chsl', priority: 0.75, changefreq: 'weekly' },
          { route: '/exams/ssc-gd', priority: 0.75, changefreq: 'weekly' },

          // ── Utilities ────────────────────────────────────────────────────
          { route: '/about', priority: 0.7, changefreq: 'monthly' },
          { route: '/faq', priority: 0.7, changefreq: 'monthly' },
          { route: '/help-center', priority: 0.6, changefreq: 'monthly' },
          { route: '/contact', priority: 0.6, changefreq: 'monthly' },
          { route: '/privacy', priority: 0.4, changefreq: 'yearly' },
          { route: '/terms', priority: 0.4, changefreq: 'yearly' },
          { route: '/copyright', priority: 0.4, changefreq: 'yearly' },
          // Note: /test-meta deliberately excluded from sitemap
        ];

        // ── Dynamic semester pages at lower priority ──────────────────────
        const dynamicRoutes: string[] = [];
        const colleges = ['mbbu', 'bbmc'];
        const courses = ['bsc', 'ba', 'bcom', 'bca'];
        const semesters = ['1st-sem', '2nd-sem', '3rd-sem', '4th-sem', '5th-sem', '6th-sem'];
        colleges.forEach(college => {
          courses.forEach(course => {
            semesters.forEach(sem => {
              dynamicRoutes.push(`/${college}/${course}/${sem}-question-papers`);
            });
          });
        });

        // Return combined — static pages (which support priority/changefreq) + dynamic strings
        return [...staticPages.map(p => p.route), ...dynamicRoutes];
      })(),
      changefreq: 'weekly',
      priority: 0.8,
      generateRobotsTxt: false, // We maintain our own robots.txt
    }),
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
    exclude: ['nodemailer'],
    // Pre-bundle heavy deps so dev server starts faster
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  },
  build: {
    cssCodeSplit: true,     // Each lazy chunk gets its own CSS — only load what's needed
    // Auto-inject <link rel="modulepreload"> for entry chunks → fetched in parallel with CSS
    modulePreload: { polyfill: false },
    rollupOptions: {
      external: ['nodemailer'],
      treeshake: 'recommended',
      output: {
        manualChunks(id) {
          // Core React runtime — loaded first, tiny
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router';
          }
          // Firebase: split each service into its own chunk
          if (id.includes('node_modules/firebase/auth') || id.includes('node_modules/@firebase/auth')) {
            return 'firebase-auth';
          }
          if (id.includes('node_modules/firebase/firestore') || id.includes('node_modules/@firebase/firestore')) {
            return 'firebase-firestore';
          }
          if (id.includes('node_modules/firebase/storage') || id.includes('node_modules/@firebase/storage')) {
            return 'firebase-storage';
          }
          if (id.includes('node_modules/firebase/') || id.includes('node_modules/@firebase/')) {
            return 'firebase-core';
          }
          // Icons — tree-shakeable but still a larger bundle
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-icons';
          }
          // Charts — only used in admin + dashboard
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          // DnD — used only in admin rewards
          if (id.includes('node_modules/@dnd-kit')) {
            return 'vendor-dnd';
          }
          // Toast notifications
          if (id.includes('node_modules/react-hot-toast')) {
            return 'ui-toast';
          }
          // react-select — only Browse page
          if (id.includes('node_modules/react-select')) {
            return 'ui-select';
          }
          // Fuse.js — fuzzy search, only Browse page
          if (id.includes('node_modules/fuse.js')) {
            return 'vendor-fuse';
          }
          // Canvas confetti — only Rewards page
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-confetti';
          }
          // React easy crop — only Settings/profile
          if (id.includes('node_modules/react-easy-crop')) {
            return 'vendor-crop';
          }
          // Axios — only used in server calls
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
          // react-type-animation — only home hero
          if (id.includes('node_modules/react-type-animation')) {
            return 'vendor-typeanim';
          }
          // react-countup — only dashboard
          if (id.includes('node_modules/react-countup') || id.includes('node_modules/use-count-up')) {
            return 'vendor-countup';
          }
          // PDF viewer — only load when needed
          if (id.includes('node_modules/react-pdf') || id.includes('node_modules/pdfjs-dist')) {
            return 'vendor-pdf';
          }
        },
        experimentalMinChunkSize: 10_000,  // merge chunks < 10KB → fewer HTTP round-trips
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 1,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        dead_code: true,
        unused: true,
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    assetsDir: 'assets',
    outDir: 'dist',
    reportCompressedSize: false,
    // Target modern browsers — smaller output, no legacy polyfills
    target: ['es2020', 'chrome87', 'safari14', 'firefox78'],
  },
  ssr: {
    noExternal: ['react-helmet-async']
  },
  css: {
    devSourcemap: false
  }
});
