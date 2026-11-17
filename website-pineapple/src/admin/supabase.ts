import { createClient } from '@supabase/supabase-js';

// The browser's Supabase client, for /admin only: signs staff in and edits
// the CMS tables and images, with row level security deciding what each
// signed-in account may touch. Uses the public (anon/publishable) key —
// never the secret one.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export const CONTENT_BUCKET = 'content';
