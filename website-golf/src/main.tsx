import { CssBaseline, ThemeProvider } from '@mui/material';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { createRoot } from 'react-dom/client';
import App from './App';
import theme from './theme';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

// Vercel Web Analytics (cookieless page views). Staff visits to /admin
// aren't counted, and the booking reference is kept out of anything sent.
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = new URL(event.url);
  if (url.pathname.startsWith('/admin')) return null;
  url.searchParams.delete('ref');
  return { ...event, url: url.toString() };
}

createRoot(rootElement).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
    <Analytics beforeSend={beforeSend} />
  </ThemeProvider>,
);
