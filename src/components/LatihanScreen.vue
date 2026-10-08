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
      <span class="mui-pill" :style="{ '--pill': tier.color }">{{ tier.label }}</span>
    </header>

    <!-- Hero tier / XP -->
    <div class="q-hero">
      <div class="q-hero-glow"></div>
      <div class="q-hero-top">
        <div class="q-tier-badge"><img :src="`/tiers/${tier.badgeFile}`" :alt="tier.label" /></div>
        <div class="q-hero-info">
          <p class="q-rank">{{ tier.label }}</p>
          <p class="q-rank-sub">{{ tier.tagline }}</p>
        </div>
        <div class="q-streak">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S8 10 8 12a4 4 0 1 0 8 0c0-5-4-10-4-10z"/></svg>
          {{ streak }} hari
        </div>
      </div>
      <div class="q-xpbar"><div class="q-xpfill" :style="{ width: tier.pct + '%' }"></div></div>
      <p class="q-tier-caption mono">
        <template v-if="tier.next">{{ totalXp - tier.minXp }} / {{ tier.next.minXp - tier.minXp }} XP menuju {{ tier.next.label }}</template>
        <template v-else>Tier tertinggi tercapai</template>
      </p>
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
        :class="[statusOf(q), q.kind, { 'is-open': openId === q.id }]"
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
                :disabled="claimingIds.has(q.id)"
                @click.stop="claim(q)"
              >
                <svg v-if="claimingIds.has(q.id)" class="spin-icon is-spinning" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                Klaim {{ q.reward }} XP
              </button>
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
          :disabled="claimingIds.has(q.id)"
          @click.stop="claim(q)"
          aria-label="Klaim reward"
        >
          <svg v-if="claimingIds.has(q.id)" class="spin-icon is-spinning" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Klaim
        </button>
      </article>
    </section>

    <!-- Pencapaian (expandable) -->
    <section class="mui-block">
      <button class="q-ach-toggle" type="button" @click="achievementsOpen = !achievementsOpen">
        <span class="q-ach-toggle-left">
          <h2 class="mui-section-title">Pencapaian</h2>
          <span class="mui-tag mui-tag--gray">{{ unlockedAchCount }}/{{ totalAchCount }}</span>
        </span>
        <svg class="q-ach-chevron" :class="{ 'is-open': achievementsOpen }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <!-- Pratinjau badge — selalu terlihat; ketuk untuk daftar lengkap -->
      <button
        v-if="!achievementsOpen && achievements?.length"
        class="q-ach-strip"
        type="button"
        @click="achievementsOpen = true"
      >
        <span v-for="a in achievements" :key="a.id" class="q-ach-strip-badge" :class="{ 'is-locked': !a.unlockedAt }">
          <img :src="`/badges/${a.badgeFile}`" :alt="a.name" />
        </span>
      </button>
      <p v-if="!achievementsOpen && nextAchLatihan" class="q-ach-next">
        Berikutnya: <strong>{{ nextAchLatihan.name }}</strong> — {{ nextAchLatihan.description }}
      </p>

      <transition name="q-ach-expand">
        <div v-if="achievementsOpen" class="q-ach-list">
          <div v-if="achLoading" class="q-ach-item">
            <div class="mui-skel mui-skel--circle" style="width: 48px; height: 48px;"></div>
            <div style="flex: 1;">
              <div class="mui-skel mui-skel--text" style="width: 50%;"></div>
              <div class="mui-skel mui-skel--text" style="width: 85%; margin-top: 8px;"></div>
            </div>
          </div>
          <template v-else>
            <div v-for="a in achievements" :key="a.id" class="q-ach-item" :class="{ 'is-locked': !a.unlockedAt }">
              <div class="q-ach-badge" :style="{ boxShadow: `0 0 0 2px ${categoryTone(a.category).fg}3d` }"><img :src="`/badges/${a.badgeFile}`" :alt="a.name" /></div>
              <div class="q-ach-body">
                <div class="q-ach-top">
                  <p class="q-ach-name">{{ a.name }}</p>
                  <span class="mui-tag" :style="{ background: categoryTone(a.category).bg, color: categoryTone(a.category).fg }">{{ a.category }}</span>
                </div>
                <p class="q-ach-desc">{{ a.description }}</p>
                <p v-if="a.unlockedAt" class="q-ach-unlocked">Diraih {{ formatAchDate(a.unlockedAt) }}</p>
              </div>
            </div>
          </template>
        </div>
      </transition>
    </section>
  </div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { authState } from '../store/auth.js'
import { useQuests } from '../composables/useQuests.js'
import { useLeaderboard, useAchievements, checkAchievements } from '../composables/useMemberData.js'
import { tierForXp } from '../lib/xpTier.js'
import { showToast } from '../store/toast.js'

const initials = computed(() =>
  (authState.userName || 'Citra Dewi').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
)

const runIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
const gymIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/></svg>'

// ── Data quest nyata (progress dihitung server-side dari Strava) ──
const { quests: rawQuests, totalXp: totalXpRef, streak: streakRef, claim: claimQuest } = useQuests()

// ── Progres pemain — tier Bronze-Diamond berbasis total_xp kumulatif (selalu naik) ──
const totalXp = computed(() => totalXpRef.value)
const streak = computed(() => streakRef.value)
const tier = computed(() => tierForXp(totalXp.value))

// Peringkat effort nyata (RPC) — posisi atlet sendiri di leaderboard.
const { rows: effortRows } = useLeaderboard('effort')
const effortRank = computed(() => {
  const i = (effortRows.value || []).findIndex((r) => r.athleteId === authState.athleteId)
  return i >= 0 ? `#${i + 1}` : '—'
})

// ── Quest ──
const tab = ref('harian')
const openId = ref(null)
const claimingIds = ref(new Set())

// Map hasil RPC quest_status → bentuk kartu.
const quests = computed(() => (rawQuests.value || []).map((q) => ({
  id: q.id,
  scope: q.scope,
  title: q.title,
  desc: q.description,
  icon: q.metric === 'gym_sessions' ? gymIcon : runIcon,
  kind: q.metric?.startsWith('gym_') ? 'is-gym' : 'is-run', // hanya untuk warna aksen
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
  if (q.claimed || q.current < q.target || claimingIds.value.has(q.id)) return
  claimingIds.value = new Set(claimingIds.value).add(q.id)
  try {
    await claimQuest(q.id)
    await runAchievementCheck()
  } catch (e) {
    alert('Gagal klaim: ' + (e?.message || e))
  } finally {
    const next = new Set(claimingIds.value)
    next.delete(q.id)
    claimingIds.value = next
  }
}

// ── Pencapaian (real, 12 badge tetap — lihat services/achievements.js) ──
const achievementsOpen = ref(false)
const { achievements, loading: achLoading, refresh: refreshAchievements } = useAchievements()
const totalAchCount = computed(() => achievements.value?.length ?? 0)
const unlockedAchCount = computed(() => (achievements.value ?? []).filter((a) => a.unlockedAt).length)
const nextAchLatihan = computed(() => (achievements.value ?? []).find((a) => !a.unlockedAt) ?? null)

// Warna tag kategori — katalog achievement tidak hardcode nama kategori di FE
// (diisi lewat tabel `achievements` di Supabase), jadi warnanya ditentukan dari
// nama kategorinya sendiri (hash sederhana) supaya tetap konsisten tiap render,
// bukan abu-abu seragam semua.
const CATEGORY_PALETTE = [
  { bg: 'rgba(251, 146, 60, 0.15)', fg: '#c2410c' },
  { bg: 'rgba(248, 113, 113, 0.15)', fg: '#b91c1c' },
  { bg: 'rgba(245, 158, 11, 0.15)', fg: '#b45309' },
  { bg: 'rgba(52, 211, 153, 0.15)', fg: '#047857' },
  { bg: 'rgba(244, 114, 182, 0.15)', fg: '#be185d' },
  { bg: 'rgba(180, 83, 9, 0.15)', fg: '#92400e' },
  { bg: 'rgba(202, 138, 4, 0.15)', fg: '#a16207' },
]
function categoryTone(cat) {
  if (!cat) return { bg: 'rgba(15, 23, 42, 0.06)', fg: 'rgba(15, 23, 42, 0.65)' }
  let h = 0
  for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0
  return CATEGORY_PALETTE[h % CATEGORY_PALETTE.length]
}

function formatAchDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Evaluasi ulang kriteria (RPC) & toast perayaan utk yang baru unlock — dipanggil
// saat halaman dimuat & tiap kali quest diklaim (aktivitas/XP baru paling mungkin
// memenuhi kriteria tepat setelah klaim).
async function runAchievementCheck() {
  try {
    const newlyUnlocked = await checkAchievements()
    if (newlyUnlocked.length) await refreshAchievements()
    newlyUnlocked.forEach((a) => showToast(`Achievement baru: ${a.name}!`))
  } catch {
    // Diam-diam abaikan — bukan alur kritis.
  }
}
onMounted(runAchievementCheck)
</script>

<style scoped>
@import '../assets/mobile-ui.css';

/* ── Hero level — tetap kartu gelap sbg "spotlight" sengaja (sama spt pola di
   Profil), supaya tak monoton di tengah layar yang serba putih-biru. Aksen di
   dalamnya digeser dari oranye ke biru (chrome umum), bukan Strava-spesifik. ── */
.q-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 20px;
  color: #fff;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}
.q-hero-glow {
  position: absolute; top: -50%; right: -10%; width: 240px; height: 240px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.5) 0%, rgba(37, 99, 235, 0) 70%);
  pointer-events: none;
}
/* Cahaya kedua di sudut berlawanan, ungu — supaya kartu tier tak terasa
   satu warna datar, melainkan punya kedalaman dua-nada. */
.q-hero-glow::before {
  content: '';
  position: absolute; bottom: -120%; left: -20%; width: 220px; height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, rgba(124, 58, 237, 0) 70%);
}
.q-hero-top { position: relative; display: flex; align-items: center; gap: 14px; }
.q-tier-badge {
  width: 56px; height: 56px; flex-shrink: 0; display: grid; place-content: center;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.45));
}
.q-tier-badge img { width: 100%; height: 100%; object-fit: contain; }
.q-hero-info { flex: 1; min-width: 0; }
.q-rank { margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -0.2px; color: #dbeafe; }
.q-rank-sub { margin: 2px 0 0; font-size: 12px; color: rgba(255, 255, 255, 0.6); }
.q-tier-caption { margin: 0 0 10px; font-size: 11px; font-weight: 600; color: rgba(255, 255, 255, 0.55); text-align: right; }
.q-streak {
  display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700;
  color: #bfdbfe; background: rgba(37, 99, 235, 0.25); padding: 6px 11px; border-radius: 999px;
}
.q-xpbar {
  position: relative; margin: 16px 0 10px; height: 10px; border-radius: 999px;
  background: rgba(255, 255, 255, 0.12); overflow: hidden;
}
.q-xpfill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
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
  background: rgba(15, 23, 42, 0.12); z-index: 1;
}
.q-line { flex: 1; width: 3px; background: rgba(15, 23, 42, 0.12); margin: 4px 0; border-radius: 2px; }

.q-node.done .q-dot { background: linear-gradient(135deg, #34d399, #059669); }
.q-node.ready .q-dot { background: linear-gradient(45deg, #2563eb, #60a5fa); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2); animation: pulse 1.6s ease-in-out infinite; }
.q-node.progress .q-dot { background: linear-gradient(135deg, #fbbf24, #b45309); }
.q-node.locked .q-dot { background: rgba(15, 23, 42, 0.12); color: rgba(15, 23, 42, 0.45); }

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.06); }
}

/* Kartu quest */
.q-card {
  flex: 1; min-width: 0; cursor: pointer;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14); border-radius: 18px; padding: 14px 16px;
  box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.q-card:hover { transform: translateY(-2px); }
.q-node.locked .q-card { opacity: 0.6; }

.q-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.q-title { font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -0.2px; }
.q-reward {
  display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
  font-size: 11.5px; font-weight: 700; color: #1d4ed8; background: rgba(37, 99, 235, 0.12);
  padding: 4px 9px; border-radius: 999px;
}
.q-xp-ic { color: #2563eb; }
.q-desc { margin: 6px 0 10px; font-size: 12px; color: rgba(15, 23, 42, 0.6); line-height: 17px; }

.q-prog { display: flex; align-items: center; gap: 10px; }
.q-prog-track { flex: 1; height: 8px; border-radius: 999px; background: rgba(15, 23, 42, 0.08); overflow: hidden; }
.q-prog-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
  transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.q-node.done .q-prog-fill { background: linear-gradient(90deg, #34d399, #059669); }
.q-prog-num { font-size: 11.5px; font-weight: 700; color: rgba(15, 23, 42, 0.65); white-space: nowrap; }

/* Detail */
.q-detail { margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(15, 23, 42, 0.14); }
.q-tasks { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.q-tasks li { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: rgba(15, 23, 42, 0.65); }
.q-tasks li svg { color: #059669; flex-shrink: 0; }
.q-claim {
  width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: none; cursor: pointer; font-family: inherit;
  font-size: 13.5px; font-weight: 700; color: #fff; padding: 12px; border-radius: 12px;
  background: linear-gradient(45deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 14px 24px -12px rgba(37, 99, 235, 0.6);
  transition: transform 0.15s ease;
}
.q-claim:hover:not(:disabled) { transform: scale(1.02); }
.q-claim:active:not(:disabled) { transform: scale(0.97); }
.q-claim:disabled { opacity: 0.7; cursor: default; }
.q-claimed { display: block; text-align: center; font-size: 12.5px; font-weight: 700; color: #059669; }
.q-locked-note, .q-inprogress { display: block; text-align: center; font-size: 12px; color: rgba(15, 23, 42, 0.5); }

/* Aksi mini kanan */
.q-claim-mini {
  align-self: center; flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px;
  border: none; cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700; color: #fff; padding: 10px 14px; border-radius: 12px;
  background: linear-gradient(45deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 12px 22px -12px rgba(37, 99, 235, 0.6);
}
.q-claim-mini:disabled { opacity: 0.7; cursor: default; }

/* Transisi expand */
.q-expand-enter-active, .q-expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.q-expand-enter-from, .q-expand-leave-to { opacity: 0; max-height: 0; margin-top: 0; }
.q-expand-enter-to, .q-expand-leave-from { opacity: 1; max-height: 260px; }

/* ── Pencapaian (expandable) ── */
.q-ach-toggle {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  width: 100%; border: none; background: none; cursor: pointer; padding: 0; font-family: inherit;
}
.q-ach-toggle-left { display: flex; align-items: center; gap: 8px; }
.q-ach-chevron { color: rgba(15, 23, 42, 0.5); transition: transform 0.2s ease; flex-shrink: 0; }
.q-ach-chevron.is-open { transform: rotate(180deg); }

.q-ach-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.q-ach-item {
  display: flex; align-items: center; gap: 14px;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.14); border-radius: 18px; padding: 14px 16px;
  box-shadow: 0 16px 32px -28px rgba(15, 23, 42, 0.2);
}
.q-ach-badge { flex: 0 0 auto; width: 48px; height: 48px; display: grid; place-content: center; }
.q-ach-badge img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 6px 10px rgba(15, 23, 42, 0.12)); }
.q-ach-item.is-locked .q-ach-badge img { filter: grayscale(1) opacity(0.35); }

.q-ach-body { flex: 1; min-width: 0; }
.q-ach-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.q-ach-name { margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; }
.q-ach-item.is-locked .q-ach-name { color: rgba(15, 23, 42, 0.55); }
.q-ach-desc { margin: 3px 0 0; font-size: 12px; color: rgba(15, 23, 42, 0.6); line-height: 1.4; }
.q-ach-unlocked { margin: 4px 0 0; font-size: 11px; font-weight: 700; color: #059669; }

/* Transisi expand pencapaian — max-height lebih besar drpd .q-expand (bisa 12 item) */
.q-ach-expand-enter-active, .q-ach-expand-leave-active { transition: all 0.25s ease; overflow: hidden; }
.q-ach-expand-enter-from, .q-ach-expand-leave-to { opacity: 0; max-height: 0; }
.q-ach-expand-enter-to, .q-ach-expand-leave-from { opacity: 1; max-height: 2000px; }

/* Pratinjau badge di bawah judul Pencapaian */
.q-ach-strip {
  display: flex; gap: 8px; width: 100%; padding: 12px; margin-top: 12px; overflow-x: auto;
  border: 1px solid rgba(37, 99, 235, 0.16); border-radius: 18px; cursor: pointer; font-family: inherit;
  background: #ffffff;
  box-shadow: 0 10px 24px -20px rgba(15, 23, 42, 0.18);
  scrollbar-width: none; transition: transform 0.15s ease;
}
.q-ach-strip:hover { transform: translateY(-1px); }
.q-ach-strip::-webkit-scrollbar { display: none; }
.q-ach-strip-badge {
  flex: 0 0 auto; width: 52px; height: 52px; display: grid; place-content: center; border-radius: 16px;
  background: rgba(37, 99, 235, 0.06);
}
.q-ach-strip-badge img { width: 42px; height: 42px; object-fit: contain; filter: drop-shadow(0 6px 10px rgba(15, 23, 42, 0.15)); }
.q-ach-strip-badge.is-locked img { filter: grayscale(1) opacity(0.3); }
.q-ach-next { margin: 10px 0 0; font-size: 12px; color: rgba(15, 23, 42, 0.6); }
.q-ach-next strong { color: #1d4ed8; }

/* ── Tampilan: aksen per jenis quest (biru = lari, emas = gym) ── */
.q-node.is-run { --kind: #2563eb; }
.q-node.is-gym { --kind: #f59e0b; }
.q-card { border-left: 3px solid var(--kind, transparent); }
.q-node.is-gym .q-prog-fill { background: linear-gradient(90deg, #fde68a, #d97706); }
.q-node.is-gym .q-reward { color: #92400e; background: rgba(245, 158, 11, 0.16); }
.q-node.is-gym .q-xp-ic { color: #d97706; }

/* ── Tampilan: cahaya lembut yang berdenyut di medali tier (tanpa memotong gambar) ── */
.q-tier-badge img { animation: q-glow 4s ease-in-out infinite; }
@keyframes q-glow {
  0%, 60%, 100% { filter: brightness(1) drop-shadow(0 0 0 rgba(96, 165, 250, 0)); }
  75% { filter: brightness(1.25) drop-shadow(0 0 12px rgba(96, 165, 250, 0.6)); }
}
@media (prefers-reduced-motion: reduce) {
  .q-tier-badge img { animation: none; }
}
</style>
