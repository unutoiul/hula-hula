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

// Where links back to the site should point. In production SITE_URL must be
// set — 2C2P's return addresses can't be trusted to a request's Host header.
export function siteUrl(req: VercelRequest): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = req.headers['x-forwarded-proto'] ?? (process.env.VERCEL_ENV ? 'https' : 'http');
  return `${proto}://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
}

// Preview deployments sit behind Vercel's login, which would turn 2C2P's
// server-to-server notification away; "Protection Bypass for Automation"
// gives a secret that lets it through. Only the backend URL gets it — the
// guest's browser is already signed in to the preview.
export function withPreviewBypass(url: string): string {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (process.env.VERCEL_ENV !== 'preview' || !secret) return url;
  return `${url}${url.includes('?') ? '&' : '?'}x-vercel-protection-bypass=${encodeURIComponent(secret)}`;
}
