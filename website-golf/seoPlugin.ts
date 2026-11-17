import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

// Search engines read a page's <head> from its first HTML response, before
// any JavaScript runs. In a single-page app every address would otherwise get
// the homepage's title and canonical link, so the inner pages look like
// copies of the homepage. This plugin writes each page's own <head>: into the
// HTML Vite serves in development, and at build time into one HTML file per
// public page (dist/meetings/index.html and so on, which Vercel serves before
// its catch-all rewrite), plus a sitemap.xml listing exactly those pages.
//
// The same file lives in website-resort, website-golf and website-pineapple:
// keep the three in step.

/** Everything a page's <head> tells search engines and link previews. */
export interface PageHead {
  title: string;
  description: string;
  /** null for pages search engines should leave out (staff pages, checkout steps). */
  canonical: string | null;
  robots: string;
  structuredData?: object[];
}

export interface SeoSite {
  siteName: string;
  siteUrl: string;
  image: string;
  imageAlt: string;
  head: (path: string) => PageHead;
  /** Every public page: each gets its own HTML file and a line in the sitemap. */
  routes: string[];
  /** Pages that already have an HTML entry of their own (index.html, book.html). */
  entries: string[];
}

const START = '<!-- seo -->';
const END = '<!-- /seo -->';
const BLOCK = /<!-- seo -->[\s\S]*?<!-- \/seo -->/;
const attr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderHead(site: SeoSite, page: PageHead): string {
  const tags = [
    `<title>${text(page.title)}</title>`,
    `<meta name="description" content="${attr(page.description)}" />`,
    `<meta name="robots" content="${attr(page.robots)}" />`,
    ...(page.canonical ? [`<link rel="canonical" href="${attr(page.canonical)}" />`] : []),
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${attr(site.siteName)}" />`,
    `<meta property="og:title" content="${attr(page.title)}" />`,
    `<meta property="og:description" content="${attr(page.description)}" />`,
    ...(page.canonical ? [`<meta property="og:url" content="${attr(page.canonical)}" />`] : []),
    `<meta property="og:image" content="${attr(site.image)}" />`,
    `<meta property="og:image:alt" content="${attr(site.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${attr(page.title)}" />`,
    `<meta name="twitter:description" content="${attr(page.description)}" />`,
    `<meta name="twitter:image" content="${attr(site.image)}" />`,
    ...(page.structuredData ?? []).map((data) => `<script type="application/ld+json" data-seo>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`),
  ];
  return [START, ...tags, END].join('\n    ');
}

const sitemap = (site: SeoSite) => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...site.routes.filter((route) => !site.head(route).robots.includes('noindex')).map((route) => `  <url><loc>${site.siteUrl}${route}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

export function seoPages(site: SeoSite): Plugin {
  let outDir = '';
  let building = false;
  return {
    name: 'seo-pages',
    configResolved(config) {
      outDir = join(config.root, config.build.outDir);
      building = config.command === 'build';
    },
    transformIndexHtml(html, context) {
      // In development the app's fallback HTML arrives as /index.html; use the address asked for.
      const path = (context.originalUrl ?? context.path).split(/[?#]/)[0];
      return html.replace('</head>', `    ${renderHead(site, site.head(path))}\n  </head>`);
    },
    async closeBundle() {
      if (!building) return;
      const template = await readFile(join(outDir, 'index.html'), 'utf8');
      if (!BLOCK.test(template)) throw new Error('seo-pages: dist/index.html has no <!-- seo --> block');
      for (const route of site.routes.filter((route) => !site.entries.includes(route))) {
        const file = join(outDir, ...route.split('/').filter(Boolean), 'index.html');
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, template.replace(BLOCK, renderHead(site, site.head(route))));
      }
      await writeFile(join(outDir, 'sitemap.xml'), sitemap(site));
    },
  };
}
