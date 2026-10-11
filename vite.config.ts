import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
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
    // Run `vercel dev --listen 3001` alongside `npm run dev` for this to work.
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
