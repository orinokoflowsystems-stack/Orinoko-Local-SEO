/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __SUPABASE_URL__: string;

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
