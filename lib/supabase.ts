import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Legacy client for backward compatibility
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Modern SSR client for browser
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Default browser client
export const supabaseBrowser = createSupabaseBrowserClient(); 