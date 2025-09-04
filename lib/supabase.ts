import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a single Supabase client instance to avoid multiple GoTrueClient warnings
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const getSupabaseClient = () => {
  // Check if we're in a browser environment and if environment variables are properly set
  if (typeof window !== 'undefined') {
    // Client-side: validate environment variables
    if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here') {
        // NEXT_PUBLIC_SUPABASE_URL is not properly configured
  return null;
    }
    
    if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
        // NEXT_PUBLIC_SUPABASE_ANON_KEY is not properly configured
  return null;
    }
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          autoRefreshToken: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          // Add better error handling for auth issues
          flowType: 'pkce',
        },
        realtime: {
          params: {
            eventsPerSecond: 2,
          },
        },
        global: {
          headers: {
            'x-application-name': 'kendra-linkedin-clone',
          },
        },
      });
    } catch (error) {
          // Failed to create Supabase client
    return null;
    }
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();

// Export the client for use in Server Components
export default supabase; 