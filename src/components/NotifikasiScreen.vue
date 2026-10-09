<template>
<div class="mui">
  <div class="mui-col">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Notifications</p>
          <p class="mui-h-sub">{{ notifications.length ? `${notifications.length} notifications` : 'All caught up' }}</p>
        </div>
      </div>
      <span class="mui-pill">Latest</span>
    </header>

    <div v-if="notifications.length" class="nt-list">
      <button v-for="n in notifications" :key="n.key" class="nt-item" type="button" @click="n.action()">
        <span class="nt-ic" :class="n.cls" v-html="n.icon"></span>
        <span class="nt-body">
          <span class="nt-head">{{ n.title }}</span>
          <span class="nt-sub">{{ n.sub }}</span>
        </span>
        <svg class="nt-chev" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <div v-else class="nt-empty">
      <div class="nt-empty-ic">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
      </div>
      <p class="nt-empty-title">No new notifications yet</p>
      <p class="nt-empty-sub">Quests ready to claim and new achievements will show up here.</p>
    </div>
  </div>
</div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState } from '../store/auth.js'
import { openBodyMetricsModal } from '../store/bodyMetricsModal.js'
import { useQuests } from '../composables/useQuests.js'
import { useAchievements } from '../composables/useMemberData.js'
import { achievementEn } from '../lib/achievementsEn.js'

const router = useRouter()

const initials = computed(() =>
  (authState.userName || 'Citra Dewi').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

const ICON = {
  flag: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></svg>',
  scale: '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
}

const { quests } = useQuests()
const { achievements } = useAchievements()

// Daftar notifikasi diturunkan dari data nyata: pengingat berat, quest siap klaim, pencapaian 7 hari terakhir.
const notifications = computed(() => {
  const list = []
  if (authState.needsWeightReminder) {
    list.push({
      key: 'weight', title: 'Update your weight', sub: 'Update it for an accurate BMI',
      cls: 'is-orange', icon: ICON.scale, action: () => openBodyMetricsModal(),
    })
  }
  ;(quests.value || [])
    .filter((q) => !q.claimed && Number(q.progress) >= Number(q.target))
    .forEach((q) => list.push({
      key: `quest-${q.id}`, title: 'Quest ready to claim', sub: q.title,
      cls: 'is-green', icon: ICON.flag, action: () => router.push('/latihan'),
    }))
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  ;(achievements.value || [])
    .filter((a) => a.unlockedAt && new Date(a.unlockedAt).getTime() >= weekAgo)
    .forEach((a) => list.push({
      key: `ach-${a.id}`, title: 'New achievement', sub: achievementEn(a).name,
      cls: 'is-amber', icon: ICON.star, action: () => router.push('/latihan'),
    }))
  return list
})
</script>

<style scoped>
@import '../assets/mobile-ui.css';

.nt-list { display: flex; flex-direction: column; gap: 10px; }
.nt-item {
  display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px;
  border: 1px solid rgba(37, 99, 235, 0.12); border-radius: 18px; cursor: pointer; text-align: left;
  font-family: inherit; color: #0f172a;
  background: #ffffff;
  box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.nt-item:hover { transform: translateY(-2px); box-shadow: 0 18px 34px -22px rgba(15, 23, 42, 0.22); }

.nt-ic { width: 40px; height: 40px; border-radius: 13px; flex-shrink: 0; display: grid; place-content: center; }
.nt-ic.is-orange { background: rgba(251, 146, 60, 0.16); color: #c2410c; }
.nt-ic.is-green { background: rgba(16, 185, 129, 0.14); color: #047857; }
.nt-ic.is-amber { background: rgba(245, 158, 11, 0.16); color: #b45309; }

.nt-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nt-head { font-size: 14px; font-weight: 700; }
.nt-sub { font-size: 12px; color: rgba(15, 23, 42, 0.6); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nt-chev { color: rgba(15, 23, 42, 0.4); flex-shrink: 0; }

.nt-empty {
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;
  padding: 36px 24px; border-radius: 22px; border: 1px dashed rgba(37, 99, 235, 0.25);
  background: rgba(37, 99, 235, 0.03);
}
.nt-empty-ic {
  width: 56px; height: 56px; border-radius: 18px; display: grid; place-content: center; margin-bottom: 6px;
  color: #1d4ed8; background: linear-gradient(135deg, rgba(37, 99, 235, 0.16), rgba(96, 165, 250, 0.16));
}
.nt-empty-title { margin: 0; font-size: 15px; font-weight: 700; color: #0f172a; }
.nt-empty-sub { margin: 0; font-size: 12.5px; color: rgba(15, 23, 42, 0.55); max-width: 260px; }
</style>
