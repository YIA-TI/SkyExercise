// src/services/adminQuests.js
// CRUD quest untuk admin (RLS: is_admin() → boleh tulis).
import { supabase } from '../lib/supabase.js'

export async function fetchAllQuests() {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createQuest(quest) {
  const { data, error } = await supabase.from('quests').insert(quest).select('id').single()
  if (error) throw error
  return data.id
}

export async function updateQuest(id, patch) {
  const { error } = await supabase.from('quests').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteQuest(id) {
  const { error } = await supabase.from('quests').delete().eq('id', id)
  if (error) throw error
}

// Backfill klaim quest bertanggal lampau — cek activities riil pada periode target
// quest, langsung insert klaim (+kredit XP) kalau target sudah tercapai, tanpa perlu
// atlet klaim manual (quest_status() tak menampilkan quest yg sudah lewat periodenya).
// Dipanggil admin sesaat setelah membuat/mengubah tanggal quest.
export async function backfillQuestClaims(questId) {
  const { data, error } = await supabase.rpc('backfill_quest_claims', { p_quest_id: questId })
  if (error) throw error
  return data // jumlah klaim baru yang di-backfill
}
