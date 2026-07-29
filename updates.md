# Study Volte - AI Updates & Fixes Log

This document tracks the major changes, optimizations, and mistakes made during the AI-assisted implementation of Server-Side Generation (SSG) and Programmatic SEO.

## 🚀 Major Changes & Optimizations Implemented

### 1. Server-Side Generation (SSG) with `vite-react-ssg`
- Replaced the standard client-side Vite React builder with `vite-react-ssg`.
- Refactored `src/main.tsx` to export a `createRoot` function compatible with Vite SSG.
- Extracted routing logic from `App.tsx` into a central `src/routes.tsx` array to allow the SSG builder to crawl and statically generate HTML files for every route.
- Ensured the output `dist/` envelope contains pre-rendered layout HTML and critical CSS for immediate First Contentful Paint.

### 2. Programmatic SEO Routing
- Created a dynamic semantic template `src/pages/CollegeCourseSemester.tsx` to handle combinations like `/:college/:course/:semester-question-papers`.
- Integrated React Helmet to dynamically inject specific meta titles, OpenGraph descriptions, and canonical URLs upon page render for thousands of search combinations.
- Implemented structured JSON-LD Schema (e.g., `FAQPage`, `WebSite`, `Organization`) across the site to improve rich snippets on Google Search.

### 3. Sitemap & Indexing Improvements
- Fixed the Vite Sitemap Plugin (`vite-plugin-sitemap`) inside `vite.config.ts` to point definitively to the correct production domain: `https://study-volte.site`.
- Injected nested loops arrays (`mbbu/bbmc` -> `courses` -> `semesters`) directly into the `dynamicRoutes` property of the sitemap plugin to automatically list the dynamic pages in `sitemap.xml` during the build step.
- Updated `server/react-vite-sitemap-generator.js` with correct base URLs and dynamic Firebase hooks.

---

## ⚠️ Mistakes Encountered & Resolved by AI

Throughout the implementation, a few architectural friction points and mistakes occurred which had to be systematically debugged and resolved:

### 1. `window` Object SSR Crashes
* **Mistake:** Client-side components (like `Browse.tsx` and error handlers in `main.tsx`) attempted to access browser APIs (`window.location`, `window.open`, `navigator.clipboard`) during the Node.js Server-Side build phase. This caused the SSG build process to continuously crash with `ReferenceError: window is not defined`.
* **Fix:** Wrapped all browser API usages in a strict guard: `if (typeof window !== 'undefined')`. 

### 2. `react-helmet-async` Rollup Export Failures
* **Mistake:** The ES-Module rollup bundler used by Vite SSG choked on `react-helmet-async`'s CommonJS exports, throwing severe `MISSING_EXPORT` errors that broke the layout pre-renderer.
* **Attempted Fixes:** Tried falling back to `import pkg from 'react-helmet-async'; const { Helmet } = pkg;`. This bypassed TypeScript but still crashed the Rollup chunker.
* **Final Fix:** Uninstalled `react-helmet-async` completely, stripped out the asynchronous provider context in `main.tsx`, and migrated to the standard, stable `react-helmet` library which successfully compiles.

### 3. Service Worker PWA Plugin SSR Conflict
* **Mistake:** `vite-plugin-pwa` was injecting virtual modules (`virtual:pwa-register/react`) into the SSR build context, which it doesn't support. This led to fatal missing export errors.
* **Fix:** Updated `vite.config.ts` to explicitly check for the `process.argv.includes('--ssr')` flag. The PWA plugin is now **conditionally excluded** from the server-side rendering pass and only applies to the client-side hydration envelope.

### 4. Wrong Sitemap Domain Configuration
* **Mistake:** Initially overlooked the `Sitemap` plugin initialization inside `vite.config.ts`, assuming the standalone node script (`react-vite-sitemap-generator.js`) was the only source of truth. The Vite plugin was generating a `sitemap.xml` pointing to `https://studyvault.in` and overwriting the correct files during `npm run build`.
* **Fix:** Hardcoded `https://study-volte.site` directly into `vite.config.ts` and automated the specific programmatic long-tail URLs to flush into the dist output flawlessly.

### 5. Config Syntax Typo
* **Mistake:** During a multifile regex replacement to remove the PWA plugin, a nested bracket for the `css: {}` object literal was accidentally broken, triggering a TypeScript compilation error in `vite.config.ts`.
* **Fix:** Realigned the brace nesting immediately.
