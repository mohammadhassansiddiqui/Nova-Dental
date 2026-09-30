import { createClient } from '@supabase/supabase-js';

// Fallback to project credentials so deployment on Vercel renders seamlessly
// even if environment variables have not been configured yet in the Vercel dashboard.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://zbehpazzteodkjepfuka.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IceMvE5IK4Dq9po5ICvo1A_fpgce8Rz';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

