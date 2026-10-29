import type { VercelRequest, VercelResponse } from '@vercel/node';

// Small request/response helpers shared by the functions in api/. Vercel
// doesn't turn files under an underscore folder into endpoints.

export function allowMethods(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
  if (methods.includes(req.method ?? '')) return true;
  res.setHeader('Allow', methods.join(', '));
  res.status(405).json({ error: 'Method not allowed' });
  return false;
}

export function readJsonBody(req: VercelRequest): Record<string, unknown> {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) as Record<string, unknown>; } catch { return {}; }
  }
  return (req.body ?? {}) as Record<string, unknown>;
}

export const queryString = (req: VercelRequest, key: string) => (typeof req.query[key] === 'string' ? (req.query[key] as string) : '');

/** Where links back to the site should point: SITE_URL when set, else this request's host. */
export function siteUrl(req: VercelRequest): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] ?? (process.env.VERCEL_ENV ? 'https' : 'http');
  return `${proto}://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
}
