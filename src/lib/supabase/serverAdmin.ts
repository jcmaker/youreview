import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Server-only Supabase client using the service role key.
// Do NOT import this in client-side code.
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: { persistSession: false },
  }
);

export default supabaseAdmin;
