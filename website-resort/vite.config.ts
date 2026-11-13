import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { hotelStructuredData, pageMetadata, SOCIAL_IMAGE } from './src/seo';

export default defineConfig({
  plugins: [react(), {
    name: 'hotel-page-metadata',
    transformIndexHtml(_html, context) {
      const page = pageMetadata(context.path);
      return [
        { tag: 'title', children: page.title },
        { tag: 'meta', attrs: { name: 'description', content: page.description } },
        { tag: 'meta', attrs: { name: 'robots', content: page.robots } },
        ...(page.canonical ? [{ tag: 'link', attrs: { rel: 'canonical', href: page.canonical } }] : []),
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'Hula Hula Resort' } },
        { tag: 'meta', attrs: { property: 'og:title', content: page.title } },
        { tag: 'meta', attrs: { property: 'og:description', content: page.description } },
        ...(page.canonical ? [{ tag: 'meta', attrs: { property: 'og:url', content: page.canonical } }] : []),
        { tag: 'meta', attrs: { property: 'og:image', content: SOCIAL_IMAGE } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Hula Hula Resort in Ao Nang, Krabi' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:title', content: page.title } },
        { tag: 'meta', attrs: { name: 'twitter:description', content: page.description } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: SOCIAL_IMAGE } },
        ...(page.canonical ? [{ tag: 'script', attrs: { id: 'hotel-structured-data', type: 'application/ld+json' }, children: JSON.stringify(hotelStructuredData).replace(/</g, '\\u003c') }] : []),
      ].map((tag) => ({ ...tag, injectTo: 'head' as const }));
    },
  }],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        book: fileURLToPath(new URL('./book.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    // /api/* is implemented as Vercel serverless functions (see api/), which
    // Vite itself can't run. `vercel dev` can, but proxying the whole app
    // through it is unreliable for a Vite SPA with a catch-all rewrite in
    // vercel.json — it intermittently 404s the burst of /@vite/client,
    // /src/main.tsx etc. a real page load fires (a real browser navigation
    // races vercel dev's router in a way a single curl doesn't hit — that's
    // the "blank white page, console full of 404s" failure). So: run Vite's
    // own dev server here for everything, and only forward /api calls to a
    // separate `vercel dev` instance that exists purely to execute them.
    // Run `npm run dev:api` (vercel dev on 3001, with .env.local) alongside `npm run dev`.
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
