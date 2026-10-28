/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" sends "Check availability" to the on-site booking pages instead of SiteMinder's. */
  readonly VITE_ONSITE_BOOKING?: string;
  /** Supabase project URL and public (anon/publishable) key — used only by /admin. */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
