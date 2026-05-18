---
phase: 04-hero-section
plan: 02
subsystem: hero-overlay-foundation
tags: [useTypewriter, geist, film-grain, layout, reduced-motion, fonts, css-animation]

# Dependency graph
requires:
  - phase: 04-01
    provides: geist@1.7.0 installed, transpilePackages configured, Wave 0 test stubs
  - phase: 03-nebula-and-glow
    provides: Vitest + testing-library infrastructure, matchMedia setup in vitest.setup.ts
provides:
  - src/hooks/useTypewriter.ts — named hook with SSR guard and reduced-motion fast-path
  - GeistSans.variable + GeistMono.variable on <html> — exposes --font-geist-sans and --font-geist-mono globally
  - body::after grain layer at z-index 1 with SVG feTurbulence data URI and calc(var(--motion-ok)) animation
  - Content wrapper bumped to zIndex: 2 — z-index stack: canvas(0) grain(1) content(2)
affects: [04-03-plan]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SSR-guarded matchMedia read inside useEffect body — typeof window guard prevents server crash
    - indexRef reset + setDisplayed("") before interval start — prevents Strict Mode double-invoke mid-string artifact
    - calc(var(--motion-ok) * Xs) animation-duration — collapses to 0s under reduced-motion, freezes grain
    - SVG feTurbulence data URI via body::after — no network request, compositor-only transform animation

key-files:
  created:
    - src/hooks/useTypewriter.ts
  modified:
    - src/app/layout.tsx
    - src/app/globals.css

key-decisions:
  - "reducedMotion read inside useEffect (not at module scope) — SSR guard; matches established project pattern from MoonScene.tsx and NebulaScene.tsx"
  - "animation-duration: calc(var(--motion-ok) * 0.6s) on grain — grain remains visible but static under reduced-motion (D-18)"
  - "indexRef.current = 0 + setDisplayed('') reset on every startSignal/text change — handles React 18 Strict Mode double-invoke safely"
  - "transform: translate() in @keyframes grain — compositor-only, no repaint (background-position rejected per anti-patterns)"

# Metrics
duration: ~2min
completed: 2026-05-18
---

# Phase 4 Plan 2: useTypewriter hook, Geist fonts, and film grain Summary

**useTypewriter hook with SSR guard and reduced-motion fast-path, plus Geist font CSS variables and SVG feTurbulence film grain wired into global layout**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-18T01:17:01Z
- **Completed:** 2026-05-18T01:19:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Created `src/hooks/useTypewriter.ts` — named export implementing the exact signature locked by Wave 0 test stubs (text, charDelayMs, startSignal): string
- All 4 Wave 0 useTypewriter test stubs now pass green (3 in useTypewriter.test.ts, 1 in useTypewriter.reduced-motion.test.ts)
- Added GeistSans and GeistMono imports to layout.tsx, applied both `.variable` classes to `<html>` — exposes `--font-geist-sans` and `--font-geist-mono` globally for HeroOverlay (Plan 03)
- Updated content wrapper `zIndex: 1` to `zIndex: 2` to establish correct z-index layering for grain
- Appended `body::after` grain rule to globals.css with SVG feTurbulence data URI, `z-index: 1`, `pointer-events: none`, and `animation: grain calc(var(--motion-ok) * 0.6s) steps(6) infinite`
- Appended `@keyframes grain` using only `transform: translate()` values — compositor-friendly, no repaint

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement useTypewriter hook** — `4e6f6d2` (feat)
2. **Task 2: Wire Geist fonts and film grain into layout/globals** — `c551c40` (feat)

## Files Created/Modified

- `src/hooks/useTypewriter.ts` — Created: useTypewriter hook with SSR guard, interval-based char stepping, reduced-motion fast-path
- `src/app/layout.tsx` — Modified: GeistSans/GeistMono imports + className on html, zIndex 1 to 2 on content wrapper
- `src/app/globals.css` — Modified: Appended body::after grain rule and @keyframes grain

## Decisions Made

- `reducedMotion` read inside `useEffect` body (not at module scope) — follows established project SSR guard pattern from `MoonScene.tsx` and `NebulaScene.tsx`
- `indexRef.current = 0` + `setDisplayed("")` reset before each interval start — prevents React 18 Strict Mode double-invoke from continuing mid-string on the second run
- `animation-duration: calc(var(--motion-ok) * 0.6s)` on grain — when `--motion-ok: 0`, duration resolves to 0s and grain freezes at first keyframe position (texture visible, not animated — satisfies D-18)
- `transform: translate()` only in `@keyframes grain` — compositor-only, no layout/paint triggers; `background-position` explicitly rejected per anti-patterns in RESEARCH.md

## Deviations from Plan

None — plan executed exactly as written.

## Threat Mitigations Applied

| Threat ID | Mitigation |
|-----------|-----------|
| T-04-01 | `pointer-events: none` on `body::after` — prevents grain intercepting clicks/hovers |
| T-04-02 | `typeof window !== "undefined"` guard inside `useEffect` — prevents server crash on SSR |

## Known Stubs

None — all functionality is fully wired. The `useTypewriter` hook is complete and its 4 tests pass. Font CSS variables are globally available. Grain layer is active.

Note: HeroOverlay.constants.test.ts remains failing on "Cannot find module @/components/hero/HeroOverlay" — this is an expected Wave 0 stub state; Plan 03 delivers the HeroOverlay implementation.

## Threat Flags

None — no new security-relevant surface introduced. The SVG feTurbulence data URI has no user-controlled parameters. `useTypewriter` text is a string literal constant consumed in HeroOverlay.

## Self-Check: PASSED

- `src/hooks/useTypewriter.ts` exists: FOUND
- `src/app/layout.tsx` contains `GeistSans.variable` and `GeistMono.variable`: FOUND
- `src/app/layout.tsx` content wrapper has `zIndex: 2` (not 1): FOUND
- `src/app/globals.css` contains `body::after` with grain rule: FOUND
- `src/app/globals.css` contains `animation: grain calc(var(--motion-ok)`: FOUND
- `grep -c "background-position" src/app/globals.css` returns 0: PASSED
- Commit `4e6f6d2` exists (useTypewriter hook): FOUND
- Commit `c551c40` exists (layout + globals grain): FOUND
- All 4 useTypewriter tests pass: PASSED
