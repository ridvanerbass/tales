import { createClient } from "@supabase/supabase-js";

// Fallback values for development - replace with your actual values
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://your-project-url.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
