# Visual Redesign Phase 3b Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recolor every screen's own hardcoded light-theme CSS (white cards, "stone" text colors, pastel tint badges) to match the dark orange+violet glassmorphism theme that Phase 3a already applied to the shared `mobile-ui.css` design system.

**Architecture:** One canonical color-mapping table (below) applied consistently across 13 screen files, grouped into 9 tasks by shared pattern (near-duplicate files, or files sharing one sub-component pattern, are combined into one task). No shared files change in this phase — only each screen's own `<style>` block.

**Tech Stack:** Plain scoped CSS (Vue SFC `<style scoped>`/`<style>` blocks), no preprocessor.

**Scope note (deliberate, not an oversight):** This phase touches ~190 individual CSS rules across 13 files. Rather than transcribe every single rule as a literal find/replace block (which would make this plan document enormous and brittle to the smallest pre-existing formatting difference), each task provides: (1) the exact canonical mapping to apply, and (2) the exact class list (from a full-file survey already done) that needs touching in that file, with instructions to read the file, apply the mapping to every listed class, and self-verify via grep that no old light-theme hex values remain. This is the appropriate level of specification for a large, mechanical, deterministic reskin — the mapping itself has zero ambiguity, unlike a vague instruction such as "restyle this nicely."

---

## Canonical color mapping (apply to ALL 9 tasks below)

**Surfaces:**
| Old | New |
|---|---|
| `background: #ffffff;` / `background: #fff;` (plain white card) | `background: rgba(255, 255, 255, 0.10); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.16);` |
| `background: #f5f1ec;` / `#ece7e2;` / `#e7e2da;` / `#f0ece6;` (light gray/cream utility surface — input bg, icon badge bg, progress track, divider) | `background: rgba(255, 255, 255, 0.08);` |
| `border: ...#ece7e2;` / `border-top: ...#ece7e2;` / `#e7e1db;` / `#f0ece6;` (light border/divider) | same but `rgba(255, 255, 255, 0.14)` |
| `:focus-within { background: #ffffff; }` (input lightens on focus) | `background: rgba(255, 255, 255, 0.14);` |
| `border: 3px solid #fff;` (avatar ring) | `border: 3px solid rgba(255, 255, 255, 0.3);` |

**Text (the "stone" scale → light-on-dark scale, matching what Phase 3a already established in `mobile-ui.css`):**
| Old | New |
|---|---|
| `#1c1917` / `#292524` (primary text) | `#F8FAFC` |
| `#44403c` (medium-dark text, e.g. avatar initials) | `rgba(248, 250, 252, 0.85)` |
| `#57534e` (secondary text) | `rgba(248, 250, 252, 0.75)` |
| `#78716c` (tertiary/muted text) | `rgba(248, 250, 252, 0.65)` |
| `#a8a29e` (faint text, placeholders) | `rgba(248, 250, 252, 0.5)` |

**Pastel semantic tint badges (icon backgrounds — same pattern as `.mui-tag--*` in `mobile-ui.css`):**
| Family | Old bg / Old text | New bg / New text |
|---|---|---|
| Orange | `#fff2e8`/`#ffedd5`/`#fff7ed` / `#c2410c`/`#ea580c` | `rgba(251, 146, 60, 0.18)` / `#FDBA74` |
| Blue/teal | `#ccfbf1` / `#0f766e` | `rgba(45, 212, 191, 0.18)` / `#5EEAD4` |
| Green | `#d1fae5` / `#059669` | `rgba(52, 211, 153, 0.18)` / `#6EE7B7` |
| Purple | `#f3e8ff` / (dark purple text) | `rgba(167, 139, 250, 0.18)` / `#C4B5FD` |
| Amber (e.g. "partial" status) | `#fef3c7` / (dark amber text) | `rgba(251, 191, 36, 0.18)` / `#FDE68A` |
| Gray/neutral chip | `#f5f1ec` / `#57534e` | `rgba(255, 255, 255, 0.10)` / `rgba(248, 250, 252, 0.75)` |
| Destructive/red | `#fee2e2` / `#dc2626`; hover/border `#fecaca` | `rgba(248, 113, 113, 0.18)` / `#FCA5A5`; hover/border `rgba(248, 113, 113, 0.3)` |

**Two-tone gradient accent cards (e.g. AdminMonitoringScreen's "Total Lari"/"Total Gym" cards):**
| Old | New |
|---|---|
| `linear-gradient(#fff7ed, #ffedd5)` border `#fed7aa` (orange-tinted card) | `linear-gradient(rgba(251,146,60,0.15), rgba(251,146,60,0.08))` border `rgba(251,146,60,0.3)` |
| `linear-gradient(#f5f3ff, #ede9fe)` border `#ddd6fe` (purple-tinted card) | `linear-gradient(rgba(167,139,250,0.15), rgba(167,139,250,0.08))` border `rgba(167,139,250,0.3)` |

**Podium silver medal (rank 2) — cooler metallic gray, per design decision (gold/bronze keep their existing colors unchanged, they already read as real medal colors):**
| Old | New |
|---|---|
| Avatar: `linear-gradient(135deg, #f5f1ec, #d6cfc8)` text `#44403c` | `linear-gradient(135deg, #e5e7eb, #94a3b8)` text `#1e293b` |
| Bar: `linear-gradient(180deg, #e7e2da, #c7bfb6)` text `#44403c` | `linear-gradient(180deg, #cbd5e1, #94a3b8)` text `#1e293b` |

**White "active tab" pills (e.g. `.pf-tab.is-active`, `.ins-card-tab.is-active`, `.pf-cta.is-logout`) — converted to glass per design decision, NOT left as solid white:**
| Old | New |
|---|---|
| `background: #ffffff; color: #1c1917;` | `background: rgba(255, 255, 255, 0.16); color: #FDBA74; border: 1px solid rgba(255, 255, 255, 0.25);` |

**Do NOT touch:** any brand-orange gradient (`linear-gradient(45deg, rgb(252,100,45), rgb(255,145,77))` or `#fc4c02`), any already-dark gradient (e.g. `#292524`→`#1c1917`→`#17140f` "spotlight panel" backgrounds in `ProfilScreen.vue`'s `.pf-card` and `AdminAnggotaDetailScreen.vue`'s `.ins-card`), gold/bronze medal colors, or any rule not listed in a task's class inventory below.

---

### Task 1: `HomeScreen.vue` — root background + full light-surface sweep

**Files:**
- Modify: `src/components/HomeScreen.vue`

This is the highest-priority file in this phase: `.aeroguard-home` is this screen's own page-root background (analogous to `.mui` in `mobile-ui.css`) and was NOT touched by Phase 3a — it's still the old light cream theme entirely.

- [ ] **Step 1: Recolor the root page background to match `.mui`'s Phase 3a treatment**

Read the current `.aeroguard-home` rule (background-color, background-image with grain/radial-gradients) and its `::before` (diagonal stripes) and `::after` (route-line) pseudo-elements in `src/components/HomeScreen.vue`'s `<style>` block. Recolor them using the exact same values already applied to `.mui` in `src/assets/mobile-ui.css` (read that file's current `.mui`, `.mui::before`, `.mui::after` rules as the reference — they were done in Phase 3a):
- `.aeroguard-home`'s `background-color` → `#0f0a2e`, and its `background-image` gains the same 4th gradient layer `linear-gradient(160deg, #3b1a0a 0%, #4c1d95 45%, #1e1b4b 75%, #0f0a2e 100%)`, with the existing orange/teal radial-gradient accents recolored the same way `.mui`'s were (teal → violet `rgba(124, 58, 237, 0.30)`).
- `.aeroguard-home::before`'s diagonal stripes recolored the same way `.mui::before`'s were (second stripe layer teal → violet `rgba(196, 181, 253, 0.08)`).
- `.aeroguard-home::after` (route-line) — already orange, leave unchanged (same reasoning as `.mui::after` in Phase 3a).

- [ ] **Step 2: Apply the canonical mapping to these classes**

Apply the canonical mapping table above to each of these classes in `HomeScreen.vue`'s `<style>` block:
- `.section-title` — text
- `.greeting-card` — surface (light gradient → glass, matching `.mui-header`'s treatment: `background: rgba(255,255,255,0.08); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.14);`), plus its `::before` orange radial glow stays as-is (already orange, just bump opacity slightly to ~0.22 to match `.mui-header::before` if you want, optional)
- `.role` — text (tertiary)
- `.icon-btn` — surface (utility gray), `.icon-btn .dot` border stays `2px solid` but change color to `rgba(255,255,255,0.3)`
- `.strava-card` — this is an orange-tinted accent card, recolor using the "orange" row of the pastel-tint-badge mapping but as a full card background+border, i.e. `background: rgba(251, 146, 60, 0.12); border: 1px solid rgba(251, 146, 60, 0.25);` (slightly lower alpha than a badge since it's a larger surface)
- `.strava-title` — text (primary), `.strava-sub` — text (tertiary)
- `.weight-reminder` — same orange-tint-card treatment as `.strava-card`
- `.swipe-hint` — text (faint)
- `.hchip` — gray/neutral chip mapping
- `.hchip--orange` — orange badge mapping
- `.hchip--green` — green badge mapping
- `.stat-card` — surface (plain white card → glass card mapping)
- `.stat-card-title`, `.stat-big` — text (primary); `.stat-big small` — text (faint); `.stat-note` — text (tertiary)
- `.sphere-dot` — utility gray surface mapping (small dot, use `rgba(255,255,255,0.25)` instead of the 0.08 card value since it needs to read as a discrete dot, not a large translucent surface)
- `.filter-chip` — surface (plain white → glass card mapping, but can use a lighter `rgba(255,255,255,0.08)` variant sized for a small pill)
- `.act-item` — surface (glass card mapping)
- `.act-ic.is-orange` — orange badge mapping; `.act-ic.is-blue` — blue badge mapping; `.act-ic.is-green` — green badge mapping; `.act-ic.is-cyan` — use the blue/teal mapping (closest family)
- `.act-name` — text (primary); `.act-meta` — text (secondary); `.act-time` — text (tertiary); `.act-empty` — text (faint)
- `.act-toggle` — surface (plain white → glass card mapping, sized for a pill/button)

**Do NOT touch:** `.avatar`, `.strava-icon`, `.weight-reminder-btn`, `.strava-sync` (already dark/orange), `.mini-bar` (orange gradient), `.stat-more` (orange text), `.sphere-dot.is-active`, `.filter-chip.is-active`, `.act-toggle:hover` (all already brand-orange).

- [ ] **Step 3: Verify in the browser**

With the dev server running, log in as a participant and visit `/home`. Confirm the whole page background is now the dark orange/violet gradient (matching `/admin`'s Phase 3a look), and every card/chip/text element is legible against it. Check the console for errors.

- [ ] **Step 4: Commit**

The user reviews and commits all changes themselves — do not run `git add`/`git commit`/`git push`. Leave the change unstaged.

---

### Task 2: `LatihanScreen.vue` — quest path/card light-surface sweep

**Files:**
- Modify: `src/components/LatihanScreen.vue`

`.q-hero` (the dark XP/tier hero card) is already dark from before this redesign — do not touch it or its children (`.q-hero-glow`, `.q-hero-top`, `.q-tier-badge`, `.q-hero-info`, `.q-rank`, `.q-rank-sub`, `.q-tier-caption`, `.q-streak`, `.q-xpbar`, `.q-xpfill`, `.q-hero-stats`, `.q-stat-val`, `.q-stat-lbl`). Only the quest-path and achievement-list cards below it need the mapping.

- [ ] **Step 1: Apply the canonical mapping to these classes**

- `.q-dot` (base/default state) — utility gray surface mapping
- `.q-line` — utility gray surface mapping (thin connector line, use `rgba(255,255,255,0.14)`)
- `.q-node.locked .q-dot` — utility gray surface mapping
- `.q-card` — surface (glass card mapping)
- `.q-title` — text (primary); `.q-desc` — text (secondary)
- `.q-reward` — orange badge mapping
- `.q-prog-track` — utility gray surface mapping; `.q-prog-num` — text (secondary)
- `.q-detail` — border-top mapping (dashed stays dashed, just recolor)
- `.q-tasks li` — text (secondary)
- `.q-ach-item` — surface (glass card mapping)
- `.q-ach-name` — text (primary); `.q-ach-item.is-locked .q-ach-name` — text (tertiary); `.q-ach-desc` — text (tertiary)
- `.q-ach-chevron`, `.q-locked-note`, `.q-inprogress` — text (faint)

**Do NOT touch:** `.q-hero` and all its children listed above, `.q-claim`/`.q-claim-mini`/`.q-xpfill`/`.q-prog-fill` (orange gradients), `.q-node.done/.ready/.progress .q-dot` (status gradients — these are semantic, not theme-driven), `.q-claimed`/`.q-ach-unlocked` (green, semantic success text), `.spin-icon` usages (Phase 2 work).

- [ ] **Step 2: Verify in the browser**

Log in as a participant, visit `/latihan`. Confirm quest cards and the achievement list render in the glass style against the dark page background, legible text throughout.

- [ ] **Step 3: Commit**

Leave unstaged for the user.

---

### Task 3: `ProfilScreen.vue` + `AdminAnggotaDetailScreen.vue` — spotlight-panel accents

**Files:**
- Modify: `src/components/ProfilScreen.vue`
- Modify: `src/components/AdminAnggotaDetailScreen.vue`

Both files already have an existing dark "spotlight panel" (`.pf-card` / `.ins-card`, gradient `#292524`→`#1c1917`→`#17140f`) — this predates the redesign and stays completely unchanged, including its `::before` glow, avatar, name/role, stats, tabs container, linkrows, and CTA-connect button. Only the specific classes below (mostly the "white active tab" pattern) need the mapping.

- [ ] **Step 1: `ProfilScreen.vue`**

- `.pf-tab.is-active` — white-active-tab-pill mapping
- `.pf-cta.is-logout` — white-active-tab-pill mapping (same treatment — it's the same "solid white pill on dark panel" pattern, just used for a full-width button instead of a tab)
- `.pf-danger` — destructive/red badge mapping (background + text)
- `.pf-danger:hover` — destructive/red badge mapping's hover variant (the `0.3` alpha border/bg value)

**Do NOT touch:** `.pf-card`, `.pf-card::before`, `.pf-status`, `.pf-avatar-wrap`, `.pf-avatar-fallback`, `.pf-name`/`.pf-role`, `.pf-stats`/`.pf-stat*` (these already got a loading-skeleton treatment in Phase 2 and are dark-panel-appropriate already), `.pf-tabs`, `.pf-linkrow*`, `.pf-cta.is-connect`, `.pf-quick-icon`, `.pf-chart-bar`.

- [ ] **Step 2: `AdminAnggotaDetailScreen.vue`**

- `.ins-back` — utility gray surface + text mapping (this is OUTSIDE the dark panel, a page-level back button, so it needs the full surface+border+text treatment like other back-buttons in this phase)
- `.ins-card-tab.is-active` — white-active-tab-pill mapping
- `.ins-filter-chip` — surface (glass card mapping, sized for a pill)
- `.ins-act-item` — surface (glass card mapping)
- `.ins-act-ic.is-orange` — orange badge mapping; `.ins-act-ic.is-blue` — blue badge mapping
- `.ins-act-name` — text (primary); `.ins-act-meta` — text (secondary); `.ins-act-date` — text (faint)
- `.ins-act-empty`, `.ins-notfound` — text (faint)

**Do NOT touch:** `.ins-card` + `::before`, `.ins-card-status(.is-off)`, `.ins-card-avatar-*`, `.ins-card-name`/`role`, `.ins-card-stats*`, `.ins-card-tabs`, `.ins-card-linkrow*`, `.ins-card-cta`, `.ins-chart-label`, `.ins-filter-chip.is-active` (already orange gradient).

- [ ] **Step 3: Verify in the browser**

Log in as a participant, visit `/profil` — confirm the tab pill and logout button read as glass-on-dark, not stark white, and the danger zone button reads as translucent red. Log in as admin, visit an athlete detail page (`/admin/anggota/:id`) — confirm the back button, filter chips, and activity list are glass-on-dark.

- [ ] **Step 4: Commit**

Leave unstaged for the user.

---

### Task 4: `AdminMonitoringScreen.vue` — full light-surface sweep (largest single file)

**Files:**
- Modify: `src/components/AdminMonitoringScreen.vue`

- [ ] **Step 1: Apply the canonical mapping to these classes**

- `.ad-stat` — surface (glass card mapping)
- `.ad-stat.is-blue .ad-stat-icon` — blue badge mapping; `.is-orange` — orange badge mapping; `.is-green` — green badge mapping; `.is-purple` — purple badge mapping
- `.ad-stat-value` — text (primary); `.ad-stat-label` — text (faint)
- `.ad-chart` — surface (glass card mapping); `.ad-chart-title` — text (faint); `.ad-chart-label` — text (secondary)
- `.ad-chart-track` — utility gray surface mapping; `.ad-chart-value` — text (primary)
- `.qs-legend` — text (tertiary), its `strong` child — text (secondary)
- `.qf-muted` — text (faint)
- `.qs-list` — surface (glass card mapping)
- `.qs-skel-row` / `.qs-athlete-row` — border-bottom mapping; `.qs-athlete-row` — text (primary), `:hover` background → `rgba(255,255,255,0.08)`
- `.qs-quest-list` — utility gray surface mapping
- `.qs-quest-item` — text (secondary); `.qs-quest-item-name` — text (primary); `.qs-quest-item-scope`/`.qs-chevron` — text (faint)
- `.qs-badge.is-full` — green badge mapping; `.is-partial` — amber badge mapping; `.is-none` — destructive/red badge mapping; `.is-na` — gray/neutral chip mapping
- `.qs-progress` — text (primary)
- `.qs-total-card--lari` — orange two-tone gradient card mapping
- `.qs-total-card--gym` — purple two-tone gradient card mapping
- `.qs-total-icon` — change `rgba(255,255,255,0.65)` to `rgba(255,255,255,0.15)` (dial back the opacity since it now sits on a translucent-dark card, not a light one)
- `.qs-total-title`/`.qs-total-stat` — text (tertiary), their `strong` child — text (primary); `.qs-total-empty` — text (faint)
- `.qs-total-card.is-empty` — utility gray surface mapping; its icon → `rgba(255,255,255,0.10)`

**Do NOT touch:** `.qs-pdf-btn` (orange gradient), `.qf-error` (semantic red text, no background to change).

- [ ] **Step 2: Verify in the browser**

Log in as admin, visit `/admin`. Confirm all 4 stat cards, the chart card, the quest-status list, and the two "Total Lari"/"Total Gym" gradient cards all read as glass-on-dark with legible text and correctly-tinted status badges.

- [ ] **Step 3: Commit**

Leave unstaged for the user.

---

### Task 5: `AdminAnggotaScreen.vue` — roster card sweep

**Files:**
- Modify: `src/components/AdminAnggotaScreen.vue`

- [ ] **Step 1: Apply the canonical mapping to these classes**

- `.an-search` — surface (glass card mapping, sized for a search bar) + text (secondary)
- `.an-search input` — text (primary)
- `.an-card` — surface (glass card mapping)
- `.an-avatar` — utility gray surface mapping + text (medium-dark, `rgba(248,250,252,0.85)`)
- `.an-avatar-dot` — border color mapping (`2px solid rgba(255,255,255,0.3)` instead of solid white)
- `.an-name` — text (primary); `.an-role` — text (tertiary)
- `.an-meta-grid` / `.an-contact` — border-top mapping
- `.an-meta-label` — text (faint); `.an-meta-value` — text (primary, since old value `#292524` maps to `#F8FAFC`)
- `.an-contact-value` — text (secondary)
- `.an-copy-btn` — text (faint); `:hover` background → `rgba(255,255,255,0.08)`
- `.an-empty` — text (faint)

**Do NOT touch:** `.an-search:focus-within` (already orange accent border/shadow only), `.an-avatar-dot.is-on`/`.is-off` (semantic status colors, not theme-driven).

- [ ] **Step 2: Verify in the browser**

Log in as admin, visit `/admin/anggota`. Confirm the search bar and roster cards read as glass-on-dark, avatars and text legible.

- [ ] **Step 3: Commit**

Leave unstaged for the user.

---

### Task 6: `AdminQuestScreen.vue` — form + quest list sweep

**Files:**
- Modify: `src/components/AdminQuestScreen.vue`

- [ ] **Step 1: Apply the canonical mapping to these classes**

- `.qf-field span` — text (secondary)
- `.qf-field input` — border mapping, `color: #F8FAFC`, `background: rgba(255,255,255,0.08)`
- `.qf-metric-card` — border mapping, surface `rgba(255,255,255,0.08)`, text (secondary); `:hover` border → `rgba(251,146,60,0.4)` (keep the existing orange-tint hover intent, just make it translucent-appropriate)
- `.qf-reward-input` — border mapping, surface `rgba(255,255,255,0.08)`
- `.qf-reward-input input` — text (primary); `.qf-reward-suffix` — text (faint)
- `.qf-preview-label`, `.qf-muted` — text (faint)
- `.ql-item` — surface (glass card mapping)
- `.ql-icon-badge` — utility gray surface mapping + text (secondary)
- `.ql-item--harian .ql-icon-badge` — blue badge mapping; `.ql-item--mingguan .ql-icon-badge` — orange badge mapping
- `.ql-title` — text (primary); `.ql-meta` — text (secondary)
- `.ql-icon-btn` — border mapping, surface `rgba(255,255,255,0.08)`, text (secondary)
- `.ql-icon-btn--del` — destructive/red badge mapping (background + border)
- `.ql-switch-track` — utility gray surface mapping
- `.ql-btn` — border mapping, surface `rgba(255,255,255,0.08)`, text (secondary) — NOTE: this class already got `display: inline-flex; align-items: center; gap: 5px;` added in Phase 2 (spinner work) — do not remove that, only touch the color-related properties (`border`, `background`, `color`)
- `.ql-edit-date` — border-top mapping (dashed)
- `.ql-edit-date input[type=date]` — border mapping, `color: #F8FAFC`, `background: rgba(255,255,255,0.08)`

**Do NOT touch:** `.qf-metric-card.is-active`, `.qf-submit` (already has Phase 2's spinner markup — do not touch structure, only if it has residual light colors, which per the survey it doesn't), `.ql-switch input:checked + track` (orange gradient), `.qf-hint`/`.qf-reward-icon` (accent text), `.ql-item--harian`/`--mingguan` border-left accents, `.ql-xp-badge` (gold gradient), `.qf-error` (semantic red), `.ql-switch-thumb`, `.ql-toggle-spinner`/`.ql-switch.is-disabled` (Phase 2 additions, leave alone).

- [ ] **Step 2: Verify in the browser**

Log in as admin, visit `/admin/quests`. Confirm the "Tambah Quest" form fields, metric picker cards, and the quest list cards all read as glass-on-dark with legible input text.

- [ ] **Step 3: Commit**

Leave unstaged for the user.

---

### Task 7: `AdminPeringkatScreen.vue` + `PeringkatScreen.vue` — podium/league card sweep

**Files:**
- Modify: `src/components/AdminPeringkatScreen.vue`
- Modify: `src/components/PeringkatScreen.vue`

Both files have near-identical `.lb-*` classes (this is the podium/leaderboard structure Phase 3a's skeleton work in an earlier phase already touched for loading states, but the REAL-content colors were never redesigned). Apply the same mapping to both files.

- [ ] **Step 1: Apply the canonical mapping to these classes (in BOTH files)**

- `.lb-podium` — surface (glass card mapping)
- `.lb-podium-avatar` — border mapping (`3px solid rgba(255,255,255,0.3)` instead of solid white)
- `.lb-podium-item--rank2 .lb-podium-avatar` — podium-silver-medal mapping (avatar variant)
- `.lb-podium-name` — text (primary); `.lb-podium-value` — text (secondary)
- `.lb-podium-item--rank2 .lb-podium-bar` — podium-silver-medal mapping (bar variant)
- `.lb-league-card` — surface (glass card mapping)
- `.lb-league-sub` — text (tertiary)
- `.lb-period-toggle` — utility gray surface mapping
- `.lb-row-avatar` — utility gray surface mapping + text (medium-dark)
- `.lb-tier-chip` — gray/neutral chip mapping

**Also in `PeringkatScreen.vue` only** (this file has an extra "Kamu"/isMe variant `AdminPeringkatScreen.vue` doesn't have):
- `.lb-league-badge.is-current` — utility gray surface mapping

**Do NOT touch (either file):** `.lb-podium-item--rank1`/`--rank3` avatar+bar gradients (gold/bronze medal colors, unchanged per design decision), `.lb-podium-crown` color, `.lb-podium-item.is-me .lb-podium-avatar` (orange ring, brand accent — `PeringkatScreen.vue` only), `mui-tag--accent` usages (already handled by `mobile-ui.css`).

- [ ] **Step 2: Verify in the browser**

Log in as admin, visit `/admin/peringkat` — confirm podium (gold/silver/bronze, silver now cool-gray) and league card read correctly on dark glass. Log in as a participant, visit `/peringkat` — same check, plus confirm the "Kamu" (you) highlight still stands out distinctly.

- [ ] **Step 3: Commit**

Leave unstaged for the user.

---

### Task 8: `GantiPasswordScreen.vue` + `BodyMetricsModal.vue` — form input sweep

**Files:**
- Modify: `src/components/GantiPasswordScreen.vue`
- Modify: `src/components/BodyMetricsModal.vue`

Both files share the same `.gp-*` input-field pattern (separate scoped copies, not shared code) — apply the same mapping to both.

- [ ] **Step 1: `GantiPasswordScreen.vue`**

- `.gp-back` — utility gray surface + border + text mapping
- `.gp-label` — text (primary, since `#292524` maps to `#F8FAFC`)
- `.gp-input-wrap` — utility gray surface mapping
- `.gp-input-wrap:focus-within` — focus-lightens mapping (`rgba(255,255,255,0.14)` instead of solid white)
- `.gp-input-icon`, `.gp-eye` — text (secondary)
- `.gp-input` — text (primary)
- `.gp-input::placeholder` — text (faint)
- `.gp-eye:hover` — text (primary)
- `.gp-strength-bar` — utility gray surface mapping (this is the base/track of a password-strength meter — its filled/active segment colors are semantic red/orange/green and are NOT in scope, only the empty track background)

**Do NOT touch:** `.gp-submit` (dark `#1c1917` button — already reads fine on the new dark page background since it was never light-cream-dependent; this already has Phase 2's spinner markup, don't disturb it), `.gp-error`/`.gp-success` (semantic text colors), any inline strength-meter segment colors (semantic, not surface).

- [ ] **Step 2: `BodyMetricsModal.vue`**

- `.bm-modal-close` — utility gray surface + text mapping; `:hover` background → `rgba(255,255,255,0.14)`
- `.bm-modal-title` — text (primary)
- `.bm-modal-sub` — text (tertiary)
- `.gp-label` — text (primary)
- `.gp-input-wrap` — utility gray surface mapping; `:focus-within` → `rgba(255,255,255,0.14)`
- `.gp-input` — text (primary); `::placeholder` — text (faint)
- `.bm-preview` — text (secondary)

**Do NOT touch:** `.bm-modal-backdrop` (dark rgba overlay, already fine), `.gp-submit` (dark button, already has Phase 2's spinner markup), `.gp-error` (semantic red).

- [ ] **Step 3: Verify in the browser**

Visit `/profil/ganti-password` — confirm the back button, input fields, and labels read correctly on dark. Trigger the body metrics modal (new participant account, or via the profile "edit data tubuh" quick icon) — same check for the modal.

- [ ] **Step 4: Commit**

Leave unstaged for the user.

---

### Task 9: `RincianLatihanScreen.vue` + `StatsDetailScreen.vue` — detail-page sweep

**Files:**
- Modify: `src/components/RincianLatihanScreen.vue`
- Modify: `src/components/StatsDetailScreen.vue`

- [ ] **Step 1: `RincianLatihanScreen.vue`**

- `.rl-back` — utility gray surface + border + text mapping
- `.rl-session-title` — text (primary); `.rl-session-type` — text (secondary)
- `.rl-sum-card` — surface (glass card mapping)
- `.rl-sum-label` — text (secondary); `.rl-sum-value` — text (primary); `.rl-sum-unit` — text (faint)
- `.rl-note`, `.rl-empty` — text (faint)

**Do NOT touch:** `.rl-strava` (brand-orange chip, white text — already fine), `.rl-dot` (white dot inside orange chip — already fine, reads as a design accent not a theme-driven surface).

- [ ] **Step 2: `StatsDetailScreen.vue`**

Recall this file already has a Phase 2 skeleton (`v-if="loading && !stats"`) wrapping its 4-branch content — that skeleton block itself uses `.mui-skel` (already dark from Phase 3a via `mobile-ui.css`, don't touch it). Only the REAL-content classes below need the mapping.

- `.sd-back` — utility gray surface + border + text mapping
- `.sd-hero-value` — text (primary); its `small` child — text (faint)
- `.sd-hero-note` — text (secondary)
- `.sd-mini` — surface (glass card mapping)
- `.sd-mini-label` — text (faint); `.sd-mini-value` — text (primary)
- `.sd-row--active` — orange-tint mapping (note: grep first to confirm whether this class is actually used in the current template — the survey flagged it may be dead CSS; if `grep -n "sd-row--active" src/components/StatsDetailScreen.vue` shows it's only defined in `<style>` and never referenced in `<template>`, leave the color as-is since touching genuinely dead code is out of scope for a recolor pass — do not delete it either, that's a separate cleanup concern)
- `.sd-ic` — orange badge mapping
- `.sd-row-name` — text (primary); `.sd-row-time` — text (faint); `.sd-row-val` — text (primary)
- `.sd-empty` — text (faint)

**Do NOT touch:** `.sd-bar` (orange gradient), the Phase 2 skeleton block and its `.mui-skel` usages.

- [ ] **Step 3: Verify in the browser**

Log in as a participant, visit `/latihan/rincian/:id` for any activity (via the My Activity list on `/home`) — confirm the summary card reads correctly on dark. Visit `/stats/distance` (via a stat card tap on `/home`) — confirm the hero value, mini-stat cards, and recent-activity rows read correctly on dark.

- [ ] **Step 4: Commit**

Leave unstaged for the user.
