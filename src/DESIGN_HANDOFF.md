# Campus Clash — Design System Notes

Read this before implementing any screen. It exists so every screen matches
the rest of the app instead of drifting into its own style.

> Source of truth: this doc reflects the actual adopted tokens after the
> "Gold Standard Esports" rebrand. If it ever disagrees with a raw Stitch
> export's `DESIGN.md`, **this file wins** — the Stitch one is a starting
> point per-screen, this one is what's actually live in the app.

## Theme

- **Brand:** "prestige-at-war" — collegiate-honor meets competitive-gaming
  edge. Elite, competitive, uncompromising. Every interaction should feel
  heavy and rewarded, like a trophy being claimed.
- **Background:** warm near-black `#08070a` (`--bg-dark`). Not a cool
  navy-black — the whole palette is warm/gold-tinted, not blue-tinted.
- **Colors** — all in `src/index.css`, always reuse the variables below,
  never hardcode a hex value in a component:
  - `var(--purple)` (`#d4af37`) / `var(--purple-light)` (`#f2ca50`) /
    `var(--purple-glow)` → **Metallic Gold**, the primary accent. Reserved
    for brand moments, primary CTAs, championship-level info. Variable is
    still named "purple" for historical reasons — don't rename it.
  - `var(--cyan)` (`#f9a825`) / `var(--cyan-light)` (`#ffb957`) /
    `var(--cyan-glow)` → **BGMI Yellow-Gold**, the secondary accent (this
    app's primary game is BGMI). Variable still named "cyan" — don't rename.
  - `var(--gold)` (`#f59e0b`, amber) → separate token, used specifically
    for money/prize-pool figures. Don't repurpose for the brand gold above.
  - Status colors unchanged: `var(--green)`, `var(--yellow)`, `var(--red)`.
  - Text: `var(--text-primary)` (`#eae1d4` warm off-white),
    `var(--text-secondary)` (`#d0c5af`), `var(--text-muted)` (`#99907c`).
  - `var(--border)` (`#4d4635`) for default borders, `var(--border-glow)`
    for the gold-tinted glow border on active/focused elements.
- **Game-specific accents** (use only when a screen is explicitly about a
  specific game, e.g. a game filter chip or a game-branded tournament card —
  not as general-purpose colors):
  - BGMI: Yellow-Gold `#F9A825` (same as `--cyan`)
  - Free Fire: Orange-Red `#FF3E00`
  - Valorant: Red-Black `#BD0F15`
- **Fonts** (all loaded via `@import` in `src/index.css`):
  - `var(--font-display)` → **Montserrat**, heavy weight (700–900),
    **uppercase** for headlines. This is a change from the old Rajdhani.
  - `var(--font-body)` → **Hanken Grotesk**. Was Inter.
  - `var(--font-label)` → **Space Grotesk**, for uppercase-tracked
    labels/badges/metadata (e.g. "ENTRY FEE", "LIVE"). This is a *new*
    variable — use it instead of `--font-body` for small uppercase labels.
  - `var(--font-mono)` → **JetBrains Mono**, unchanged. Kept specifically
    for room codes and countdown timers where true monospace digit
    alignment matters — this is a deliberate functional exception to the
    Stitch export (which suggests Space Grotesk for everything label-like).
- **Animation/utility classes already exist — reuse, don't reinvent:**
  - `.reveal` / `.reveal-up` / `.reveal-visible` / `.animate-in` — entrance
    animations.
  - `.shimmer-wrap` — metallic shine sweep (equivalent to Stitch's
    "metallic-shine"). Use on primary CTA buttons.
  - `.hover-lift` — lift-on-hover for cards.
  - `.glass-panel` *(new)* — semi-transparent blurred surface with a subtle
    gold edge. Use for secondary/alternate action cards.
  - `.chamfer` / `.chamfer-sm` *(new)* — clip-path "snipped corner" shape
    instead of rounded corners, for an armored/technical look. **Don't**
    combine with `border-radius` on the same element. Use `.chamfer` on
    larger containers, `.chamfer-sm` on small chips/buttons.
  - `.tilt-card` *(new)* — subtle 3D tilt that flattens on hover, for
    featured/game-selection cards.
  - `.ghost-input` *(new)* — bottom-border-only input that lights up gold
    on focus. Pair with `.uppercase-label` for the field label above it.
- **Shape language:** primary corner radius stays soft (`0.25rem`-ish) for
  normal cards — we're not switching every rounded corner to a chamfer.
  Chamfers (`.chamfer`) are for *featured/hero* containers where the
  Stitch mockup explicitly shows a cut corner — apply per-screen, don't
  blanket-replace every `border-radius` in the app.
- **Elevation:** light-and-glass, not drop-shadows. Level 0 = pure black bg,
  no texture. Level 1 = `.glass-panel`. Level 2 (active/selected) = 1px
  gold-gradient border. Focus/high-priority = soft colored glow (`box-shadow`
  with 0 spread, large blur) in the relevant accent color.

## Stitch Project

- Project ID: `3114968463887607450`
- Project URL: https://stitch.withgoogle.com/projects/3114968463887607450
- If pulling via MCP, always fetch the **latest** version of a screen before
  implementing.
- If working from a manual export (`code.html` + `screen.png` per screen),
  treat the HTML as a *visual reference only* — it's static Tailwind-CDN
  markup with placeholder data and, sometimes, decorative WebGL shaders.
  Re-implement as a real React component; don't copy the HTML/JS wholesale
  (see rules below).

## Rules for implementing any new screen

1. **Frontend only.** Never touch `backend/`, API routes, or controllers.
   If a screen needs data the API doesn't return yet, stop and flag it
   instead of inventing an endpoint.
2. **No hardcoded placeholder data.** Names, stats, prize pools, avatars,
   etc. from the Stitch mockup are for layout reference only — always wire
   the real value from state/API. Check sibling pages for how the same
   data is already fetched if unsure of a field name.
3. **No fake functionality.** If the mockup shows something the backend
   doesn't support (e.g. "Sign in with Google/Discord" buttons), leave it
   out rather than shipping a button that does nothing. If there's a
   genuinely client-side-only way to deliver the same value (e.g. "remember
   this device" via localStorage), that's fine — just don't imply a backend
   capability that isn't there.
4. **Match the existing folder structure:**
   - Full pages/routes → `src/pages/`
   - Shared/reusable UI → `src/components/`
   - Page-specific styles → a co-located `.css` file next to the page.
5. **Heavy decorative elements from Stitch exports (WebGL shaders, huge
   inline `<script>` blocks) should be simplified to CSS/lightweight
   equivalents** unless there's a specific reason to keep them — they're
   expensive and fragile to port faithfully.
6. **Test empty states, not just the happy path.** Loading, zero items, one
   item, and error states all need a real look — this app already has
   empty-state patterns (e.g. "Waiting for admin to release room") to stay
   consistent with.

## Rollout status

- ✅ Global tokens (colors, fonts, new utility classes) — applied app-wide.
- ✅ Login (`Login.jsx` / `Login.css`) — rebuilt as the pilot screen.
- ⏳ Remaining Stitch screens to port: landing page, sign up, tournaments,
  leaderboard, profile, admin dashboard, and a new "dashboard" screen
  (doesn't map to an existing page yet — needs a route + nav entry).
- Older, not-yet-touched pages still use the old color *values* only where
  they hadn't been rebranded — but since the CSS variables are global,
  everything already renders in the new gold/black palette. Fonts, chamfers,
  and glass panels are being retrofitted screen-by-screen as each one gets
  rebuilt, not blanket-applied, to avoid breaking layouts without a visual
  review pass.
