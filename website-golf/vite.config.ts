import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { seoPages } from './seoPlugin';
import { pageHead, PUBLIC_ROUTES, SITE_NAME, SITE_URL, SOCIAL_IMAGE, SOCIAL_IMAGE_ALT } from './src/seo';

// Port 3002 so it runs alongside the resort site (3000) and its API (3001).
// /api/* are Vercel functions (api/), which Vite can't run: `npm run dev:api`
// starts them on 3003 and they're proxied from here.
export default defineConfig({
  plugins: [react(), seoPages({
    siteName: SITE_NAME, siteUrl: SITE_URL, image: SOCIAL_IMAGE, imageAlt: SOCIAL_IMAGE_ALT,
    head: pageHead, routes: PUBLIC_ROUTES, entries: ['/'],
  })],
  server: {
    port: 3002,
    strictPort: true,
    proxy: { '/api': { target: 'http://localhost:3003', changeOrigin: true } },
  },
  preview: { port: 3002 },
});
