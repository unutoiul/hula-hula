// Setup uses only the separate Royal Pineapple project. Never logs credentials.
import { readFile, writeFile } from 'node:fs/promises';
const ref = 'nmenfmqgwqpmlfhccdok';
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error('Load the ignored setup env file first');
export async function management(path, method = 'GET', body) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`Supabase ${method} ${path}: ${response.status} ${(await response.text()).slice(0,500)}`);
  return response.json();
}
export const query = (sql, readOnly = true) => management('/database/query', 'POST', { query: sql, read_only: readOnly });
export async function saveSettings(settings) {
  let content = await readFile('.env.local', 'utf8');
  for (const [key, value] of Object.entries(settings)) {
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    const line = `${key}=${JSON.stringify(value)}`;
    content = pattern.test(content) ? content.replace(pattern, line) : content.trimEnd() + '\n' + line + '\n';
  }
  await writeFile('.env.local', content);
}
if (process.argv[2] === 'inspect') {
  console.log(JSON.stringify(await query("select table_name from information_schema.tables where table_schema='public' order by table_name")));
  const keys = await management('/api-keys?reveal=true');
  console.log(JSON.stringify({ keyTypes: keys.map(k => ({name:k.name, type:k.type, available: Boolean(k.api_key)})) }));
  const publicKey = keys.find(k => k.type === 'publishable') ?? keys.find(k => k.name === 'anon');
  const secretKey = keys.find(k => k.type === 'secret') ?? keys.find(k => k.name === 'service_role');
  if (!publicKey?.api_key || !secretKey?.api_key) throw new Error('Missing project runtime keys');
  await saveSettings({ SUPABASE_URL:`https://${ref}.supabase.co`, VITE_SUPABASE_URL:`https://${ref}.supabase.co`,
    SUPABASE_ANON_KEY:publicKey.api_key, VITE_SUPABASE_ANON_KEY:publicKey.api_key, SUPABASE_SERVICE_ROLE_KEY:secretKey.api_key });
  console.log('Saved Royal Pineapple project runtime keys locally.');
}
