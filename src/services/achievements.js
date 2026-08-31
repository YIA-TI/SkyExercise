// src/services/achievements.js
// Katalog achievement (12 badge tetap) + status unlock milik atlet yang login.
// Kriteria unlock dievaluasi server-side lewat RPC check_achievements() (lihat
// migrasi 20260831130000_achievements.sql) — di sini cuma baca hasilnya.
import { supabase } from '../lib/supabase.js'
import { authState } from '../store/auth.js'

// Katalog lengkap + status unlock (join client-side: achievements x athlete_achievements
// milik atlet ybs, sudah dibatasi RLS "diri sendiri atau admin").
export async function fetchMyAchievements() {
  const [{ data: catalog, error: catErr }, { data: unlocked, error: unlErr }] = await Promise.all([
    supabase.from('achievements').select('*').eq('active', true).order('sort_order', { ascending: true }),
    supabase.from('athlete_achievements').select('achievement_id, unlocked_at').eq('athlete_id', authState.athleteId),
  ])
  if (catErr) throw catErr
  if (unlErr) throw unlErr

  const unlockedMap = new Map((unlocked ?? []).map((u) => [u.achievement_id, u.unlocked_at]))
  return (catalog ?? []).map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    description: a.description,
    category: a.category,
    badgeFile: a.badge_file,
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }))
}

// Evaluasi ulang kriteria & unlock yang sudah terpenuhi — dipanggil mis. saat Home
// dimuat. Balikan cuma yang BARU di-unlock (utk toast perayaan), bukan seluruh koleksi.
export async function checkAchievements() {
  const { data, error } = await supabase.rpc('check_achievements')
  if (error) throw error
  return (data ?? []).map((a) => ({
    id: a.achievement_id,
    code: a.code,
    name: a.name,
    description: a.description,
    badgeFile: a.badge_file,
    unlockedAt: a.unlocked_at,
  }))
}
