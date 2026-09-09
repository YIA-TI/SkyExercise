// src/composables/useAdminQuests.js
import { computed } from 'vue'
import { fetchAllQuests, createQuest, updateQuest, deleteQuest } from '../services/adminQuests.js'
import { useAsync } from './useAsync.js'

export function useAdminQuests() {
  const { data, loading, error, refresh } = useAsync(fetchAllQuests, [], ['quests'])
  const quests = computed(() => data.value ?? [])

  async function create(q) { const id = await createQuest(q); await refresh(); return id }
  async function update(id, patch) { await updateQuest(id, patch); await refresh() }
  async function remove(id) { await deleteQuest(id); await refresh() }

  return { quests, loading, error, create, update, remove, refresh }
}
