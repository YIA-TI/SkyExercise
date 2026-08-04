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
  const { error } = await supabase.from('quests').insert(quest)
  if (error) throw error
}

export async function updateQuest(id, patch) {
  const { error } = await supabase.from('quests').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteQuest(id) {
  const { error } = await supabase.from('quests').delete().eq('id', id)
  if (error) throw error
}
