import { createClient } from '@supabase/supabase-js';

export const usesLocalApi = import.meta.env.VITE_TODO_DATA_SOURCE === 'api';
export const usesSupabase = !usesLocalApi;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = usesSupabase && Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;
