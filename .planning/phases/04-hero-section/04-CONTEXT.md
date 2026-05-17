# Phase 4: Hero Section — Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Add the HTML overlay that completes the hero: Kameron's name fades in over the moon, a subtitle types itself out, a full-page animated film grain renders via CSS `::after`, and all animations respect `prefers-reduced-motion`. This is a pure HTML/CSS/JS layer — no new R3F or canvas elements.

Does NOT include: any changes to the moon, nebula, or canvas (Phases 2–3). Project cards, personality sections, and timeline are later phases (5–6).

</domain>

<decisions>
## Implementation Decisions

### Typography
- **D-01:** Name typeface: **Geist** (geometric sans), loaded via `next/font/google`. Weight 200–300 (ExtraLight or Light) — thin enough to feel airy and elegant at large display size, bold enough to hold against the moon/nebula background.
- **D-02:** Subtitle typeface: **Geist Mono** — loaded alongside Geist as a paired variable font. The proportional/monospace pairing (name vs. subtitle) reinforces the developer identity and looks natural with the typing animation.
- **D-03:** Both fonts loaded with `next/font/google` for zero-layout-shift font delivery. CSS variables exposed (e.g., `--font-geist`, `--font-geist-mono`) and applied to the overlay component.

### Layout and Positioning
- **D-04:** Name and subtitle anchor **bottom-left** of the viewport — as prescribed in Phase 2 (D-06). This leaves the right half of the viewport clear for the moon.

### Animation Sequencing
- **D-05:** Name fade-in starts at **~1.2–1.5s after mount** — overlapping with the moon's 2.5s entrance. Both elements arrive together around the 2.5s mark. The visitor sees the moon approaching while the name simultaneously materializes.
- **D-06:** Name fade duration: **~1.5–2s**. Name finishes fading at roughly 3–3.5s after mount.
- **D-07:** Subtitle typing starts **after the name is fully visible** (opacity = 1). Sequential reveal — name is established, then the subtitle expands on it. No competing motion.
- **D-08:** Overlay is **static during scroll** — name and subtitle stay visible in the bottom-left throughout the entire vertical zone. No scroll-driven exit or parallax on the text.

### Subtitle Content and Typing Behavior
- **D-09:** Subtitle text: **"Full-stack developer & creative technologist"**
- **D-10:** Typing speed: **~50–70ms per character**. At 44 characters, the full phrase takes roughly 2.5–3s to complete.
- **D-11:** Post-type behavior: a cursor character (`|` or `_`) appears at the end of the text and then **fades out after ~2s**. The final state is the text alone with no cursor.
- **D-12:** Implementation: **custom `useTypewriter` hook** (`src/hooks/useTypewriter.ts`). Accepts `(text, charDelayMs, startSignal)` — `startSignal` gates typing until name fade-in completes.

### Grain Overlay
- **D-13:** Character: **animated film grain** — grain texture shifts every ~80–120ms via CSS `@keyframes` stepping through background-positions on a noise layer.
- **D-14:** Prominence: **subtle** — opacity ~0.04–0.07. Felt rather than seen. Adds texture without competing with the moon or degrading text legibility.
- **D-15:** Scope: **full page** — fixed-position `::after` on `body` (or a fixed wrapper div). Consistent atmosphere throughout the entire scroll journey including the horizontal card zone.
- **D-16:** Implementation: **inline SVG `feTurbulence`** as a `data:` URI in `background-image`. No external file, no network request, turbulence `baseFrequency` tuned in CSS for the exact grain character.
- **D-17:** The grain `::after` must have `pointer-events: none` and `z-index` below the text overlay but above the canvas (z-index 0).

### Reduced-Motion Fallback (QUAL-03)
- **D-18:** `--motion-ok: 1` is already declared in `tokens.css` with `prefers-reduced-motion` media query. Phase 4 **fully consumes** this token. When `--motion-ok = 0`: name appears immediately at full opacity (no fade); subtitle appears immediately as full text (no typing, no cursor); grain layer present but static (no `@keyframes` animation).
- **D-19:** Implementation: `calc(var(--motion-ok) * Xs)` for CSS animation durations, and `useTypewriter` reads `window.matchMedia('(prefers-reduced-motion: reduce)')` to skip the typing animation.

### Component Architecture
- **D-20:** Hero overlay component: `src/components/hero/HeroOverlay.tsx`. Rendered in `app/page.tsx`, positioned fixed over the canvas. Uses `"use client"` since it has mount-time animations.
- **D-21:** `useTypewriter` hook: `src/hooks/useTypewriter.ts`.

### Claude's Discretion
- Exact letter-spacing value for the name (targeting wide, airy — e.g., `0.15em`–`0.25em`)
- Exact font size for the name (targeting dominant but not viewport-filling — roughly `clamp(3rem, 5vw, 7rem)`)
- Exact `feTurbulence` baseFrequency for grain texture character
- Cursor character shape (`|` vs `_`) and blink behavior before fade-out
- Whether name fade uses CSS transition or GSAP (`gsap.to` from `src/lib/gsap.ts`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and Roadmap
- `.planning/REQUIREMENTS.md` — HERO-06, HERO-07, HERO-08, QUAL-03 (authoritative acceptance criteria for this phase)
- `.planning/ROADMAP.md` Phase 4 section — success criteria checklist (4 items)

### Prior Phase Context
- `.planning/phases/02-moon-hero/02-CONTEXT.md` — D-06 (text anchors bottom-left), D-11/D-12 (moon entrance timing ~2.5s), Canvas architecture (fixed, z-index 0)
- `.planning/phases/03-nebula-system/03-CONTEXT.md` — D-16/D-17 (component architecture pattern — `ComponentName.tsx` + `ComponentName.client.tsx`)

### Existing Codebase Integration Points
- `src/styles/tokens.css` — `--motion-ok` token (already declared), `--ease-out-expo`, duration variables. Phase 4 adds font CSS variables and any new tokens here.
- `src/app/globals.css` — global CSS import; grain `::after` on `body` goes here or in a new `hero.css`
- `src/app/layout.tsx` — current HTML structure; `MoonSceneClient` (canvas, fixed z-index 0) + content div (z-index 1). `HeroOverlay` mounts inside the z-index 1 div.
- `src/app/page.tsx` — render point for `<HeroOverlay />`

### Design Reference
- `.planning/PROJECT.md` "Context" section — "Cinematic feel inspired by Shalon's site; intentional scanline/grain texture"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/gsap.ts` — single GSAP import site; if name fade-in uses GSAP, import from here only
- `src/styles/tokens.css` — `--ease-out-expo` and `--motion-ok` available for overlay animations

### Established Patterns
- `"use client"` directly on HeroOverlay (it's HTML, not R3F — no `next/dynamic ssr:false` needed)
- `next/font/google` with CSS variable exposure — no fonts loaded yet; Phase 4 introduces the first font load
- HeroOverlay does NOT read from the Zustand scroll store (overlay is static during scroll per D-08)

### Integration Points
- `app/layout.tsx` — apply font CSS variables at `body` level
- `app/page.tsx` — add `<HeroOverlay />` inside the existing `<main>`
- `src/styles/tokens.css` or `src/app/globals.css` — add grain `::after` and font CSS variables

</code_context>

<specifics>
## Specific Ideas

- Geist + Geist Mono pairing is an explicit choice — they are sibling fonts, making the proportional/mono contrast feel intentional rather than arbitrary.
- The grain "barely there" direction is intentional — this is a cinematic portfolio, not a retro site. The grain should be something a visitor feels rather than consciously notices.
- `useTypewriter` hook must return empty string until `startSignal` fires — no flash of pre-rendered text.
- PROJECT.md cites Shalon's site as the cinematic grain reference — grain character and text treatment should pull from that direction.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-hero-section*
*Context gathered: 2026-05-17*
