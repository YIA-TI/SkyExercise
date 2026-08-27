// src/composables/useAdminQuests.js
import { ref, onMounted } from 'vue'
import { fetchAllQuests, createQuest, updateQuest, deleteQuest } from '../services/adminQuests.js'

export function useAdminQuests() {
  const quests = ref([])
  const loading = ref(true)
  const error = ref(null)

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      quests.value = await fetchAllQuests()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  async function create(q) { const id = await createQuest(q); await refresh(); return id }
  async function update(id, patch) { await updateQuest(id, patch); await refresh() }
  async function remove(id) { await deleteQuest(id); await refresh() }

  onMounted(refresh)
  return { quests, loading, error, create, update, remove, refresh }
}
