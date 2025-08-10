import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Single shared client for both server and browser environments.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
