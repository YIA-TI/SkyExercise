// src/lib/supabase.js
// Client Supabase tunggal untuk seluruh FE (pakai anon key — aman di browser).
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Bukan error fatal saat dev; hanya peringatan agar mudah dilacak.
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diset di .env')
}

export const supabase = createClient(url ?? '', anonKey ?? '')
