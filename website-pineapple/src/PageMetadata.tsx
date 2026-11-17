import { useEffect } from 'react';
import { useLocation } from './router';
import { hotelStructuredData, pageMetadata, SOCIAL_IMAGE } from './seo';

// Vite supplies the same metadata in the initial HTML. Keep it correct when
// navigating between the resort, booking search, checkout and staff pages.
export function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = pageMetadata(pathname);
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
    let structured = document.getElementById('hotel-structured-data');
    if (page.canonical) {
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = page.canonical;
      meta('og:url', page.canonical, 'property');
      if (!structured) {
        structured = document.createElement('script');
        structured.id = 'hotel-structured-data';
        structured.setAttribute('type', 'application/ld+json');
        document.head.appendChild(structured);
      }
      structured.textContent = JSON.stringify(hotelStructuredData);
    } else {
      canonical?.remove();
      structured?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
  }, [pathname]);
  return null;
}
