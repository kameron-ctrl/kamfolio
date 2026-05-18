---
phase: 04-hero-section
plan: 03
subsystem: hero-overlay-component
tags: [HeroOverlay, GSAP, typewriter, cursor-fade, reduced-motion, page-mount, hero, film-grain]

# Dependency graph
requires:
  - phase: 04-02
    provides: useTypewriter hook, Geist font CSS vars, film grain in globals.css, content wrapper at zIndex 2
  - phase: 04-01
    provides: HeroOverlay.constants.test.ts Wave 0 stubs, geist installed, transpilePackages configured
provides:
  - src/components/hero/HeroOverlay.tsx — name fade (GSAP), subtitle typewriter, cursor fade, bottom-left fixed overlay
  - src/app/page.tsx — HeroOverlay mounted as Client island inside Server Component
  - .planning/ROADMAP.md — Phase 4 listed as 3/3 Complete
affects: [05-project-cards]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useGSAP onComplete gates useTypewriter startSignal — no competing parallel timers
    - Initial opacity in style prop prevents flash between React render and GSAP initialization
    - prefersReducedMotion() with typeof window SSR guard — follows MoonScene.tsx pattern
    - calc(var(--motion-ok) * 0.6s) on cursor fade transition — collapses to 0s under reduced-motion
    - Client Component island in Server Component page — HeroOverlay carries its own "use client"

key-files:
  created:
    - src/components/hero/HeroOverlay.tsx
  modified:
    - src/app/page.tsx
    - .planning/ROADMAP.md

key-decisions:
  - "useGSAP onComplete fires setTypewriterReady(true) — gates typewriter startSignal without a parallel setTimeout race"
  - "opacity: reducedMotion ? 1 : 0 in h1 style prop — initial state before GSAP runs, prevents content flash (Pitfall 4 in RESEARCH.md)"
  - "GRAIN_OPACITY exported from HeroOverlay.tsx (not a separate .constants.ts) — constants are HeroOverlay-specific, following the pattern established by MoonScene.constants.ts"
  - "Cursor span renders only when typewriterReady=true — prevents visible cursor before name fades in"

patterns-established:
  - "onComplete-gated state: useGSAP + setTypewriterReady(true) in onComplete cleanly sequences name fade → typewriter without extra effects"
  - "Client island in Server route: HeroOverlay with 'use client' mounted inside page.tsx (Server Component) — same pattern as MoonSceneClient in layout.tsx"

requirements-completed: [HERO-06, HERO-07, HERO-08, QUAL-03]

# Metrics
duration: ~3min
completed: 2026-05-18
---

# Phase 4 Plan 3: HeroOverlay component and page.tsx mount Summary

**HeroOverlay.tsx with GSAP name fade, useTypewriter subtitle, cursor fade, and bottom-left fixed overlay — mounted as Client island in page.tsx to complete the hero section end-to-end**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-18T01:21:46Z
- **Completed:** 2026-05-18T01:24:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `src/components/hero/HeroOverlay.tsx` with all exported constants in spec ranges: NAME_FADE_DELAY=1.3, NAME_FADE_DURATION=1.8, GRAIN_OPACITY=0.05, CURSOR_FADE_DELAY_MS=2000
- GSAP `fromTo` animation fades name from opacity 0 to 1 with delay 1.3s, duration 1.8s, power2.out; `onComplete` fires `setTypewriterReady(true)` to gate the typewriter
- `useTypewriter("Full-stack developer & creative technologist", 60, typewriterReady)` types subtitle only after name is fully visible
- Cursor `|` renders only when `typewriterReady=true`, fades out after 2s via `calc(var(--motion-ok) * 0.6s)` CSS transition
- `prefersReducedMotion()` helper with `typeof window` SSR guard: reduced-motion path sets opacity 1 directly in style prop and calls `setTypewriterReady(true)` immediately
- Fixed bottom-left layout: `position: fixed`, `bottom: clamp(2rem, 4vh, 4rem)`, `left: clamp(1.5rem, 4vw, 4rem)`, `zIndex: 2`, `pointerEvents: none`
- Added `import HeroOverlay from "@/components/hero/HeroOverlay"` to page.tsx; converted vertical-zone `<section>` from self-closing to open element wrapping `<HeroOverlay />`
- page.tsx remains a Server Component (no `"use client"`) — HeroOverlay carries its own directive
- All 3 Wave 0 HeroOverlay.constants.test.ts tests pass; all 7 Phase 4 tests pass (3 constants + 4 useTypewriter)
- ROADMAP.md Phase 4 updated to 3/3 Complete with all 3 plan files listed

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement HeroOverlay.tsx** — `49de0d9` (feat)
2. **Task 2: Mount HeroOverlay in page.tsx and update ROADMAP** — `7d5e674` (feat)

## Files Created/Modified

- `src/components/hero/HeroOverlay.tsx` — Created: "use client" component, 4 exported constants, GSAP name fade with onComplete typewriter gate, cursor fade, reduced-motion path, bottom-left fixed layout
- `src/app/page.tsx` — Modified: added HeroOverlay import, converted vertical-zone section to open element wrapping HeroOverlay
- `.planning/ROADMAP.md` — Modified: Phase 4 plan list marked 3/3 complete, progress table updated

## Decisions Made

- `useGSAP onComplete` fires `setTypewriterReady(true)` — the cleanest way to gate the typewriter after the name animation without a parallel `setTimeout` that could drift from the actual animation completion
- Initial `opacity: reducedMotion ? 1 : 0` in the h1 style prop — prevents the flash between React render and GSAP initialization (RESEARCH.md Anti-Patterns, Pitfall 4); GSAP reads this initial value via `fromTo`
- `GRAIN_OPACITY` exported from HeroOverlay.tsx (not a separate `.constants.ts`) — the constant is small and HeroOverlay-specific; matches the pattern described in PATTERNS.md for this component

## Deviations from Plan

None — plan executed exactly as written.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|-----------|
| T-04-03 | `pointerEvents: "none"` on outer HeroOverlay container div — cannot intercept clicks or hover events |
| T-04-04 | `typeof window === "undefined"` guard in `prefersReducedMotion()` — safe SSR return of `false` |
| T-04-05 | `useGSAP` wraps `gsap.context()` — automatic cleanup on unmount, no GSAP tween memory leak |

## Known Stubs

None — all functionality is fully wired:
- Name fades in via GSAP with exact delay/duration constants
- Subtitle types character by character after name completes
- Cursor appears and fades after 2s
- Reduced-motion path collapses all animation to static state
- Film grain layer is live (implemented in Plan 02 via globals.css)

## Threat Flags

None — no new security-relevant surface introduced beyond the threat model. HeroOverlay renders only static string literals. The `pointerEvents: none` container and SSR guard are both in place.

## Self-Check: PASSED

- `src/components/hero/HeroOverlay.tsx` exists: FOUND
- `head -1 src/components/hero/HeroOverlay.tsx` outputs `"use client";`: PASSED
- `grep "export const NAME_FADE_DELAY = 1.3"` returns match: FOUND
- `grep "export const NAME_FADE_DURATION = 1.8"` returns match: FOUND
- `grep "export const GRAIN_OPACITY = 0.05"` returns match: FOUND
- `grep "@/lib/gsap"` returns match (barrel import): FOUND
- `grep "calc(var(--motion-ok)"` returns match: FOUND
- `grep "typeof window"` returns match: FOUND
- `grep "registerPlugin"` returns no match: PASSED
- `grep "useScrollStore|scroll-store"` returns no match: PASSED
- `grep -c "HeroOverlay" src/app/page.tsx` returns 2: PASSED
- `grep -c '"use client"' src/app/page.tsx` returns 0: PASSED
- `grep "04-01-PLAN.md"` in ROADMAP returns match: FOUND
- `grep "04-02-PLAN.md"` in ROADMAP returns match: FOUND
- `grep "04-03-PLAN.md"` in ROADMAP returns match: FOUND
- All 3 HeroOverlay.constants tests pass: PASSED
- All 7 Phase 4 tests pass: PASSED
- Commit `49de0d9` exists (HeroOverlay.tsx): FOUND
- Commit `7d5e674` exists (page.tsx + ROADMAP): FOUND
