// Supabase's database over its REST interface (PostgREST), with plain fetch
// like the rest of api/. The secret ("service role") key bypasses row level
// security and is only ever used here on the server; the anon key goes through
// the same RLS rules as a browser would.

export class DbError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

type Role = 'service' | 'anon';

function config(role: Role) {
  const url = process.env.SUPABASE_URL;
  const key = role === 'service' ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new DbError(500, 'Supabase is not configured on the server');
  return { url: url.replace(/\/$/, ''), key };
}

export const dbConfigured = (role: Role = 'service') => { try { config(role); return true; } catch { return false; } };

export async function rest<T>(path: string, { method = 'GET', body, prefer, role = 'service' }: { method?: string; body?: unknown; prefer?: string; role?: Role } = {}): Promise<T> {
  const { url, key } = config(role);
  const response = await fetch(`${url}/rest/v1${path}`, {
    method,
    headers: {
      apikey: key,
      // Legacy keys are JWTs and also go in Authorization; the newer
      // sb_secret_/sb_publishable_ keys must not.
      ...(key.startsWith('eyJ') && { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
      ...(prefer && { Prefer: prefer }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new DbError(response.status, `Supabase ${method} ${path.split('?')[0]} failed: ${response.status} ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : null) as T;
}
