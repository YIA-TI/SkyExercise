<template>
<div class="mui">
  <div class="mui-col mui-col--wide">
    <header class="mui-header">
      <div class="h-left">
        <div class="mui-avatar">{{ initials }}</div>
        <div>
          <p class="mui-h-title">Latihan Saya</p>
          <p class="mui-h-sub">Misi latihan &amp; pencapaianmu</p>
        </div>
      </div>
      <span class="mui-pill">Level {{ level }}</span>
    </header>

    <!-- Hero level / XP -->
    <div class="q-hero">
      <div class="q-hero-glow"></div>
      <div class="q-hero-top">
        <div class="q-level-badge">{{ level }}</div>
        <div class="q-hero-info">
          <p class="q-rank">{{ rankName }}</p>
          <p class="q-rank-sub">{{ xpInLevel }} / {{ xpPerLevel }} XP</p>
        </div>
        <div class="q-streak">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S8 10 8 12a4 4 0 1 0 8 0c0-5-4-10-4-10z"/></svg>
          {{ streak }} hari
        </div>
      </div>
      <div class="q-xpbar"><div class="q-xpfill" :style="{ width: levelPct + '%' }"></div></div>
      <div class="q-hero-stats">
        <div><p class="q-stat-val mono">{{ completedCount }}</p><p class="q-stat-lbl">Quest Selesai</p></div>
        <div><p class="q-stat-val mono">{{ totalXp.toLocaleString('id-ID') }}</p><p class="q-stat-lbl">Total XP</p></div>
        <div><p class="q-stat-val mono">{{ effortRank }}</p><p class="q-stat-lbl">Peringkat</p></div>
      </div>
    </div>

    <!-- Tab Harian / Mingguan -->
    <div class="mui-toggle">
      <button :class="{ 'is-active': tab === 'harian' }" @click="tab = 'harian'">Harian</button>
      <button :class="{ 'is-active': tab === 'mingguan' }" @click="tab = 'mingguan'">Mingguan</button>
    </div>

    <!-- Jalur quest -->
    <section class="q-path">
      <article
        v-for="(q, idx) in visibleQuests"
        :key="q.id"
        class="q-node"
        :class="[statusOf(q), { 'is-open': openId === q.id }]"
      >
        <!-- Rail + dot -->
        <div class="q-rail">
          <span class="q-dot">
            <svg v-if="statusOf(q) === 'done'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="statusOf(q) === 'locked'" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span v-else v-html="q.icon"></span>
          </span>
          <span v-if="idx < visibleQuests.length - 1" class="q-line"></span>
        </div>

        <!-- Kartu quest -->
        <div class="q-card" @click="toggle(q)">
          <div class="q-card-head">
            <span class="q-title">{{ q.title }}</span>
            <span class="q-reward"><span class="q-xp-ic">✦</span>{{ q.reward }} XP</span>
          </div>
          <p class="q-desc">{{ q.desc }}</p>

          <div class="q-prog">
            <div class="q-prog-track">
              <div class="q-prog-fill" :style="{ width: pct(q) + '%' }"></div>
            </div>
            <span class="q-prog-num mono">{{ q.current }}/{{ q.target }} {{ q.unit }}</span>
          </div>

          <!-- Detail saat dibuka -->
          <transition name="q-expand">
            <div v-if="openId === q.id" class="q-detail">
              <ul class="q-tasks">
                <li v-for="t in q.tasks" :key="t">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ t }}
                </li>
              </ul>
              <button
                v-if="statusOf(q) === 'ready'"
                class="q-claim"
                @click.stop="claim(q)"
              >Klaim {{ q.reward }} XP</button>
              <span v-else-if="statusOf(q) === 'done'" class="q-claimed">✓ Reward diklaim</span>
              <span v-else-if="statusOf(q) === 'locked'" class="q-locked-note">Terkunci — selesaikan quest sebelumnya</span>
              <span v-else class="q-inprogress">Lanjutkan latihan untuk menyelesaikan</span>
            </div>
          </transition>
        </div>

        <!-- Aksi ringkas kanan (saat tertutup) -->
        <button
          v-if="statusOf(q) === 'ready' && openId !== q.id"
          class="q-claim-mini"
          @click.stop="claim(q)"
          aria-label="Klaim reward"
        >Klaim</button>
      </article>
    </section>

    <!-- Achievements -->
    <section class="mui-block">
      <h2 class="mui-section-title">Pencapaian</h2>
      <div class="q-badges">
        <div v-for="b in badges" :key="b.name" class="q-badge" :class="{ 'is-locked': !b.earned }">
          <div class="q-badge-ic" v-html="b.icon"></div>
          <p class="q-badge-name">{{ b.name }}</p>
          <p class="q-badge-sub">{{ b.earned ? 'Diraih' : b.hint }}</p>
        </div>
      </div>
    </section>
  </div>

  <MemberTabBar />
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authState } from '../store/auth.js'
import { useQuests } from '../composables/useQuests.js'
import { useLeaderboard } from '../composables/useMemberData.js'
import MemberTabBar from './MemberTabBar.vue'

const initials = computed(() =>
  (authState.userName || 'Citra Dewi').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

const runIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
const gymIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/></svg>'
const fireIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2"/></svg>'

// ── Data quest nyata (progress dihitung server-side dari Strava) ──
const { quests: rawQuests, totalXp: totalXpRef, streak: streakRef, claim: claimQuest } = useQuests()

// ── Progres pemain ──
const xpPerLevel = 1000
const totalXp = computed(() => totalXpRef.value)
const streak = computed(() => streakRef.value)
const level = computed(() => Math.floor(totalXp.value / xpPerLevel) + 1)
const xpInLevel = computed(() => totalXp.value % xpPerLevel)
const levelPct = computed(() => (xpInLevel.value / xpPerLevel) * 100)

const RANKS = ['Rekrut', 'Petugas', 'Senior', 'Veteran', 'Komandan', 'Elite ARFF']
const rankName = computed(() => RANKS[Math.min(RANKS.length - 1, Math.floor(level.value / 2))])

// Peringkat effort nyata (RPC) — posisi atlet sendiri di leaderboard.
const { rows: effortRows } = useLeaderboard('effort')
const effortRank = computed(() => {
  const i = (effortRows.value || []).findIndex((r) => r.athleteId === authState.athleteId)
  return i >= 0 ? `#${i + 1}` : '—'
})

// ── Quest ──
const tab = ref('harian')
const openId = ref(null)

// Map hasil RPC quest_status → bentuk kartu.
const quests = computed(() => (rawQuests.value || []).map((q) => ({
  id: q.id,
  scope: q.scope,
  title: q.title,
  desc: q.description,
  icon: q.metric === 'gym_sessions' ? gymIcon : runIcon,
  current: q.metric === 'run_distance' ? +Number(q.progress).toFixed(1) : Math.floor(q.progress),
  target: q.target,
  unit: q.unit,
  reward: q.reward,
  claimed: q.claimed,
  tasks: q.description ? [q.description] : [],
})))

const visibleQuests = computed(() => quests.value.filter(q => q.scope === tab.value))
const completedCount = computed(() => quests.value.filter(q => q.claimed).length)

function pct(q) {
  return Math.min(100, Math.round((q.current / q.target) * 100))
}
function statusOf(q) {
  if (q.claimed) return 'done'
  if (q.current >= q.target) return 'ready'
  return 'progress'
}
function toggle(q) {
  openId.value = openId.value === q.id ? null : q.id
}
async function claim(q) {
  if (q.claimed || q.current < q.target) return
  try {
    await claimQuest(q.id)
  } catch (e) {
    alert('Gagal klaim: ' + (e?.message || e))
  }
}

// Pencapaian diturunkan dari data nyata (quest yang pernah diklaim, streak, level) — bukan dikarang.
const hasClaimedRun = computed(() => quests.value.some((q) => q.claimed && q.id != null && rawQuests.value.find((r) => r.id === q.id)?.metric?.startsWith('run_')))
const hasClaimedGym = computed(() => quests.value.some((q) => q.claimed && rawQuests.value.find((r) => r.id === q.id)?.metric === 'gym_sessions'))

const badges = computed(() => [
  { name: 'Pelari Tangguh', earned: hasClaimedRun.value, icon: runIcon, hint: 'Klaim 1 quest lari' },
  { name: 'Kuat Angkat', earned: hasClaimedGym.value, icon: gymIcon, hint: 'Klaim 1 quest gym' },
  { name: 'Beruntun 7 Hari', earned: streak.value >= 7, icon: fireIcon, hint: `Streak ${streak.value}/7 hari` },
  { name: 'Komandan Fisik', earned: level.value >= 10, icon: fireIcon, hint: `Level ${level.value}/10` },
])
</script>

<style scoped>
@import '../assets/mobile-ui.css';

/* ── Hero level ── */
.q-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 20px;
  color: #fff;
  background: linear-gradient(135deg, #292524 0%, #1c1917 100%);
}
.q-hero-glow {
  position: absolute; top: -50%; right: -10%; width: 240px; height: 240px;
  background: radial-gradient(circle, rgba(252, 76, 2, 0.5) 0%, rgba(252, 76, 2, 0) 70%);
  pointer-events: none;
}
.q-hero-top { position: relative; display: flex; align-items: center; gap: 14px; }
.q-level-badge {
  width: 52px; height: 52px; border-radius: 16px; display: grid; place-content: center;
  font-size: 24px; font-weight: 700; flex-shrink: 0; color: #3a2a06;
  font-family: "Chakra Petch", system-ui, sans-serif;
  background: linear-gradient(135deg, #f4d27a 0%, #d1962a 55%, #b8862f 100%);
  box-shadow: 0 10px 24px -8px rgba(184, 134, 47, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.5);
}
.q-hero-info { flex: 1; min-width: 0; }
.q-rank { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -0.2px; color: #fbe8c8; }
.q-rank-sub { margin: 2px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.6); }
.q-streak {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700;
  color: #ffd7b0; background: rgba(252, 76, 2, 0.2); padding: 6px 11px; border-radius: 999px;
}
.q-xpbar {
  position: relative; margin: 16px 0 10px; height: 10px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.12); overflow: hidden;
}
.q-xpfill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #fc642d, #ff914d);
  transition: width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.q-hero-stats { position: relative; display: flex; gap: 8px; }
.q-hero-stats > div { flex: 1; text-align: center; }
.q-stat-val { margin: 0; font-size: 18px; font-weight: 700; }
.q-stat-lbl { margin: 2px 0 0; font-size: 10.5px; color: rgba(255, 255, 255, 0.55); }

/* ── Jalur quest ── */
.q-path { display: flex; flex-direction: column; }
.q-node { position: relative; display: flex; align-items: stretch; gap: 14px; padding-bottom: 14px; }

.q-rail { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 40px; }
.q-dot {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  display: grid; place-content: center; color: #fff;
  background: #d6cfc8; z-index: 1;
}
.q-line { flex: 1; width: 3px; background: #e7e1db; margin: 4px 0; border-radius: 2px; }

.q-node.done .q-dot { background: linear-gradient(135deg, #34d399, #059669); }
.q-node.ready .q-dot { background: linear-gradient(45deg, #fc642d, #ff914d); box-shadow: 0 0 0 4px rgba(252, 76, 2, 0.2); animation: pulse 1.6s ease-in-out infinite; }
.q-node.progress .q-dot { background: linear-gradient(135deg, #60a5fa, #0d9488); }
.q-node.locked .q-dot { background: #d6cfc8; color: #fff; }

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(252, 76, 2, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(252, 76, 2, 0.08); }
}

/* Kartu quest */
.q-card {
  flex: 1; min-width: 0; cursor: pointer;
  background: #fff; border-radius: 18px; padding: 14px 16px;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.q-card:hover { transform: translateY(-2px); }
.q-node.locked .q-card { opacity: 0.6; }

.q-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.q-title { font-size: 14px; font-weight: 700; color: #1c1917; letter-spacing: -0.2px; }
.q-reward {
  display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
  font-size: 11.5px; font-weight: 700; color: #c2410c; background: #fff2e8;
  padding: 4px 9px; border-radius: 999px;
}
.q-xp-ic { color: #fc4c02; }
.q-desc { margin: 6px 0 10px; font-size: 12px; color: #57534e; line-height: 17px; }

.q-prog { display: flex; align-items: center; gap: 10px; }
.q-prog-track { flex: 1; height: 8px; border-radius: 999px; background: #f5f1ec; overflow: hidden; }
.q-prog-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #fc642d, #ff914d);
  transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.q-node.done .q-prog-fill { background: linear-gradient(90deg, #34d399, #059669); }
.q-prog-num { font-size: 11.5px; font-weight: 700; color: #57534e; white-space: nowrap; }

/* Detail */
.q-detail { margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e7e1db; }
.q-tasks { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.q-tasks li { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #57534e; }
.q-tasks li svg { color: #059669; flex-shrink: 0; }
.q-claim {
  width: 100%; border: none; cursor: pointer; font-family: inherit;
  font-size: 13.5px; font-weight: 700; color: #fff; padding: 12px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 14px 24px -12px rgba(252, 76, 2, 0.8);
  transition: transform 0.15s ease;
}
.q-claim:hover { transform: scale(1.02); }
.q-claim:active { transform: scale(0.97); }
.q-claimed { display: block; text-align: center; font-size: 12.5px; font-weight: 700; color: #059669; }
.q-locked-note, .q-inprogress { display: block; text-align: center; font-size: 12px; color: #a8a29e; }

/* Aksi mini kanan */
.q-claim-mini {
  align-self: center; flex-shrink: 0; border: none; cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: #fff; padding: 10px 14px; border-radius: 12px;
  background: linear-gradient(45deg, rgb(252, 100, 45) 0%, rgb(255, 145, 77) 100%);
  box-shadow: 0 12px 22px -12px rgba(252, 76, 2, 0.8);
}

/* Transisi expand */
.q-expand-enter-active, .q-expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.q-expand-enter-from, .q-expand-leave-to { opacity: 0; max-height: 0; margin-top: 0; }
.q-expand-enter-to, .q-expand-leave-from { opacity: 1; max-height: 260px; }

/* ── Achievements ── */
.q-badges { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.q-badge {
  background: #fff; border-radius: 18px; padding: 16px; text-align: center;
  box-shadow: 0 16px 32px -28px rgba(17, 18, 20, 0.5);
}
.q-badge-ic {
  width: 46px; height: 46px; border-radius: 14px; margin: 0 auto 10px; display: grid; place-content: center;
  color: #ea580c; background: #fff2e8;
}
.q-badge-name { margin: 0; font-size: 13px; font-weight: 700; color: #1c1917; }
.q-badge-sub { margin: 3px 0 0; font-size: 11px; color: #fc4c02; font-weight: 600; }
.q-badge.is-locked { opacity: 0.55; filter: grayscale(0.6); }
.q-badge.is-locked .q-badge-ic { color: #a8a29e; background: #f5f1ec; }
.q-badge.is-locked .q-badge-sub { color: #a8a29e; }
</style>
