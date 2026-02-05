 import { createClient } from '@supabase/supabase-js';
 import type { Database } from './types';
 
 const SUPABASE_URL = "https://ipaacwaozythcxfoxbee.supabase.co";
 const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwYWFjd2Fvenl0aGN4Zm94YmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjkxODIsImV4cCI6MjA4NTg0NTE4Mn0.PobH2SHShAREIfMt0MwUf4qXNwwaespML4-sM_uufEg";
 
 export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);