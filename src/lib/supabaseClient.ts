// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Asegúrate de que estas variables de entorno estén definidas en tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

// Crea una única instancia del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
