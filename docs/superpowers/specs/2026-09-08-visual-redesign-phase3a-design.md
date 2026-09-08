# Visual Redesign — Phase 3a: Shared Design System (Phase 3 of 3: Realtime → Animasi → Redesign)

## Background

Phases 1 (realtime data) and 2 (loading states/transitions) are shipped. This is Phase 3:
a full visual redesign of the app, moving from the current light cream/white theme to a
dark orange+violet "glassmorphism athletic" theme. Direction was chosen interactively via the
brainstorming visual companion — 3 candidate directions were mocked up against the real Admin
Monitoring header/stats layout, then iterated twice more (swapping a teal accent for violet,
then swapping a literal starfield texture for diagonal motion-stripes) before being approved.

**Scope decomposition (why this isn't one giant task):** 15 of ~19 screens/components already
share one file, `src/assets/mobile-ui.css`, for their header/card/tag/toggle/tab-bar/skeleton
styling (confirmed via `grep -l "@import '../assets/mobile-ui.css'"`). Redesigning that one file
cascades the new look to all 15 immediately. This phase (3a) covers only that shared file plus
the three small global files that control fonts/fallback background. Screen-specific hardcoded
styling (each screen's own hero card, unique layouts) is Phase 3b (not yet planned). The 3
standalone screens that don't import `mobile-ui.css` at all (`WelcomeScreen`, `SignInScreen`,
`StravaAuthorizeScreen`) are Phase 3c (not yet planned).

## Decisions (from visual brainstorming)

- **Background:** dark gradient, burnt orange → deep violet → near-black
  (`#7c2d12` → `#4c1d95` → `#1e1b4b` → `#0f0a2e`), replacing the current light `#ece7e2` base.
- **Surfaces (header/card/toggle/rank rows):** frosted glass —
  `background: rgba(255,255,255,0.08-0.12)`, `backdrop-filter: blur(10-16px)`,
  `border: 1px solid rgba(255,255,255,0.12-0.2)`.
- **Accent:** keep the existing Strava orange (`#fc4c02` / `#FB923C`) as primary — brand
  continuity, not replaced.
- **Texture:** the existing diagonal stripe motif (`.mui::before`) keeps its orange layer but
  its second layer changes from teal to violet. The existing GPS route-line motif (`.mui::after`,
  already orange) is unchanged — it already fits the new palette.
- **Fonts:** Barlow Condensed (headings, via the existing `src/style.css` heading-selector list)
  + Barlow (body, via `.mui`'s base `font-family`), replacing Chakra Petch. JetBrains Mono is
  kept for tabular numeric displays (`.mui-mono`, `.mui-rank-value`) — that's a functional
  choice (tabular figures), not part of the heading/body pairing being replaced.
- **Semantic colors unchanged:** green (success/"done"/"aktif" states) keeps its current hue
  family, just adjusted for contrast on glass/dark surfaces — it's status meaning, not part of
  the brand-color overhaul.
- **Chakra Petch font import stays in `index.html` for now** (not removed) — screens not yet
  migrated (Phase 3b/3c) still reference it directly; removing it now would visually regress
  those screens to a system-font fallback before their turn comes.

## Architecture

Two small, cohesive changes:

1. **Global font/fallback (3 tiny files):**
   - `index.html` — add Barlow Condensed + Barlow to the existing Google Fonts `<link>`
     (alongside Chakra Petch + JetBrains Mono, not replacing them yet).
   - `src/style.css` — the two existing heading-selector blocks swap `"Chakra Petch"` →
     `"Barlow Condensed"`.
   - `src/assets/main.css` — `#app`'s fallback `background-color` (shown before the real screen
     mounts, to avoid a flash of the wrong color) changes from `#ece7e2` to `#0f0a2e`.

2. **Shared design system (`src/assets/mobile-ui.css`):** every color-bearing rule recolored for
   the dark glass palette — `.mui` (base background + font), `.mui::before` (stripe recolor),
   `.mui-header`, `.mui-avatar` (unchanged, already orange-on-white-text), `.mui-pill`,
   `.mui-card`, `.mui-tag--*` (all 5 variants), `.mui-toggle`, `.mui-rank`/`.mui-rank-name`/
   `.mui-rank-value`/`.mui-rank-unit`/`.mui-rank-num--normal` (gold/silver/bronze medal gradients
   unchanged — distinctive colors that already read fine on dark), `.mui-skel` (shimmer base +
   sweep opacity tuned for a translucent-dark card instead of a light one), and `.m-tabbar`
   (tinted toward violet instead of pure black, for cohesion — it was already dark+blurred, so
   this is the smallest change in the file).

No component `.vue` files change in this phase — only the 4 CSS/HTML files above. The 15
importing screens get the new look automatically through the shared classes; their own
screen-specific CSS (hardcoded colors outside the `mui-` classes) is unchanged until Phase 3b.

## Data flow

None — pure CSS/font changes, no data or logic touched.

## Error handling / edge cases

- `prefers-reduced-motion` already disables `.mui`'s `bg-drift`/`stripe-pulse`/`route-pulse`
  animations (existing rule in `main.css`, untouched by this phase) — no new animation is added.
- Color contrast: every text-on-glass pairing targets at least 4.5:1 against the darkest point
  of the gradient background (verified visually during implementation, not just by formula,
  since it's a gradient + blur, not a flat color).

## Testing

Manual, consistent with project convention (no test framework):
- Visually check at least 3 of the 15 affected screens after the change (e.g. `/admin`,
  `/peringkat`, `/latihan`) to confirm headers, cards, tags, and the tab bar all render in the
  new dark glass palette with legible text.
- Confirm the 4 screens NOT yet migrated (`HomeScreen`, `WelcomeScreen`, `SignInScreen`,
  `StravaAuthorizeScreen`) still render correctly in their OLD light styling, unaffected by this
  change (they don't import `mobile-ui.css`, or in `HomeScreen`'s case, only uses it for
  `.mui-skel`/`.spin-icon`, not the recolored `.mui`/`.mui-header`/etc. classes) — this phase
  should not visually break screens it doesn't intend to touch yet.
- Confirm `npm run build` succeeds.

## Out of scope for this phase (3a)

- Screen-specific hardcoded styling (Phase 3b — not yet planned/spec'd).
- The 3 standalone screens not importing `mobile-ui.css` (Phase 3c — not yet planned/spec'd).
- Removing the now-partially-unused Chakra Petch font import (deferred until 3b/3c are done).
