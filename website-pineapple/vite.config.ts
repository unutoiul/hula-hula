import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { seoPages } from './seoPlugin';
import { pageHead, PUBLIC_ROUTES, SITE_NAME, SITE_URL, SOCIAL_IMAGE, SOCIAL_IMAGE_ALT } from './src/seo';

export default defineConfig({
  plugins: [react(), seoPages({
    siteName: SITE_NAME, siteUrl: SITE_URL, image: SOCIAL_IMAGE, imageAlt: SOCIAL_IMAGE_ALT,
    head: pageHead, routes: PUBLIC_ROUTES, entries: ['/', '/book'],
  })],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        book: fileURLToPath(new URL('./book.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 3004,
    strictPort: true,
    // /api/* is implemented as Vercel serverless functions (see api/), which
    // Vite itself can't run. `vercel dev` can, but proxying the whole app
    // through it is unreliable for a Vite SPA with a catch-all rewrite in
    // vercel.json â€” it intermittently 404s the burst of /@vite/client,
    // /src/main.tsx etc. a real page load fires (a real browser navigation
    // races vercel dev's router in a way a single curl doesn't hit â€” that's
    // the "blank white page, console full of 404s" failure). So: run Vite's
    // own dev server here for everything, and only forward /api calls to a
    // separate `vercel dev` instance that exists purely to execute them.
    // For the API locally, start `vercel dev --listen 3005` alongside `npm run dev`.
    proxy: {
      '/api': { target: 'http://localhost:3005', changeOrigin: true },
    },
  },
});
