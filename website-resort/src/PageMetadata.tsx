import { useEffect } from 'react';
import { useLocation } from './router';
import { pageHead, SOCIAL_IMAGE } from './seo';

// The build writes each page's <head> into its own HTML file (seoPlugin.ts).
// This keeps it right as visitors move between pages inside the app.
export function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = pageHead(pathname);
    document.title = page.title;
    const meta = (key: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = content;
    };
    meta('description', page.description);
    meta('robots', page.robots);
    meta('og:title', page.title, 'property');
    meta('og:description', page.description, 'property');
    meta('og:image', SOCIAL_IMAGE, 'property');
    meta('twitter:title', page.title);
    meta('twitter:description', page.description);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (page.canonical) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = page.canonical;
      meta('og:url', page.canonical, 'property');
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
    document.head.querySelectorAll('script[data-seo]').forEach((script) => script.remove());
    for (const data of page.structuredData ?? []) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.seo = '';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    }
  }, [pathname]);
  return null;
}
