---
phase: 01-scroll-foundation
plan: "03"
subsystem: ui
tags: [lenis, gsap, scroll-trigger, zustand, ssr, layout, dev-hud, next-js]

# Dependency graph
requires:
  - phase: 01-scroll-foundation/01-01
    provides: Next.js scaffold, dependencies installed, Zustand scroll store
  - phase: 01-scroll-foundation/01-02
    provides: src/lib/gsap.ts (single plugin registration site), src/lib/scroll-store.ts (computePhase, useScrollStore)
provides:
  - LenisProvider client component with 5-step Lenis+GSAP init order (D-06)
  - ScrollDebugHUD dev-only overlay showing live scroll state (D-14)
  - Root layout mounting LenisProvider as sole client wrapper (D-04)
  - lenis.on('scroll', ScrollTrigger.update) bridge — ScrollTrigger locked to Lenis position
  - Zustand store receives scrollY, velocity, phase, progress on every Lenis tick
affects:
  - 01-scroll-foundation/01-04 (HorizontalTrack — uses LenisProvider context and the scroll bridge)
  - all downstream phases that read from Zustand scroll store

# Tech tracking
tech-stack:
  added: []
  patterns:
    - LenisProvider as single Lenis+GSAP wiring hub mounted in root layout
    - 5-step Lenis+GSAP init order enforced in useLayoutEffect with full cleanup
    - useScrollStore.getState().set() for non-React scroll state writes (60fps safe)
    - process.env.NODE_ENV dev guard placed AFTER hook calls to satisfy Rules of Hooks

key-files:
  created:
    - src/components/lenis-provider/LenisProvider.tsx
    - src/components/debug/ScrollDebugHUD.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "lenis/dist/lenis.css exists in lenis@1.3.23 — imported to prevent native scrollbar flash during init (Open Question 3 resolved: CSS_EXISTS)"
  - "Rules of Hooks requires all useScrollStore hooks to be called before early return — process.env.NODE_ENV check moved after hook calls, not before"
  - "layout.tsx stays a Server Component — LenisProvider and ScrollDebugHUD imported as client components, safe per Next.js boundary rules"

patterns-established:
  - "Pattern: All Lenis+GSAP wiring in single useLayoutEffect with cleanup (ticker remove + lenis.destroy)"
  - "Pattern: Zustand store writes via getState().set() never via React state (safe at 60fps)"
  - "Pattern: Dev-only overlays call hooks unconditionally, guard render with env check after hooks"

requirements-completed:
  - FOUND-01
  - FOUND-02
  - FOUND-04

# Metrics
duration: ~20min
completed: 2026-05-06
---

# Phase 01 Plan 03: Scroll Pipeline Wiring Summary

**Lenis+GSAP wired end-to-end via 5-step init order in LenisProvider, Zustand store updated on every scroll tick, dev HUD showing live scrollY/velocity/phase/progress, root layout stays a Server Component**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-05-06T00:34:00Z
- **Completed:** 2026-05-06T00:54:30Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- LenisProvider (`src/components/lenis-provider/LenisProvider.tsx`) implements the full 5-step Lenis+GSAP init order with `autoRaf: false`, ticker-driven RAF loop, `ScrollTrigger.update` bridge, and Zustand store writes on every scroll event
- ScrollDebugHUD (`src/components/debug/ScrollDebugHUD.tsx`) renders live scrollY, velocity, displayVelocity, phase, and progress in dev only — tree-shaken in production
- Root layout (`src/app/layout.tsx`) mounts LenisProvider as sole client wrapper while remaining a Server Component — SSR boundary respected per D-04
- `npm run build` exits 0 with zero SSR/type errors; dev server reaches Ready in ~2s

## Task Commits

Each task was committed atomically:

1. **Task 1: Build LenisProvider with 5-step init order** - `d126305` (feat)
2. **Task 2: Build dev-only ScrollDebugHUD overlay** - `841569f` (feat)
3. **Task 3: Mount LenisProvider + HUD in root layout + Rules of Hooks fix** - `3916f1a` (feat + fix)

## Files Created/Modified

- `src/components/lenis-provider/LenisProvider.tsx` — Lenis+GSAP wiring hub: `new Lenis({ autoRaf: false })`, bridge, ticker, lagSmoothing, Zustand writes
- `src/components/debug/ScrollDebugHUD.tsx` — Dev-only fixed-position HUD subscribing to all 5 scroll store fields
- `src/app/layout.tsx` — Root Server Component now wraps children with `<LenisProvider>` and renders `<ScrollDebugHUD />`

## Decisions Made

- **lenis/dist/lenis.css confirmed present** in lenis@1.3.23 — imported in LenisProvider to prevent native scrollbar flash during Lenis init (Open Question 3 from RESEARCH.md: CSS_EXISTS)
- **layout.tsx remains a Server Component** — Next.js boundary rules allow server components to render client components. The chain `layout.tsx (server) → LenisProvider (client) → @/lib/gsap (client-only)` is safe and keeps SSR clean
- **useLayoutEffect chosen over useEffect** for Lenis init — runs synchronously before paint, prevents scroll state mismatch on first render; StrictMode-safe via full cleanup (ticker remove + lenis.destroy)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Moved useScrollStore hooks above early-return guard in ScrollDebugHUD**
- **Found during:** Task 3 (npm run build lint pass)
- **Issue:** Plan specified `if (process.env.NODE_ENV !== "development") return null;` as the first line of ScrollDebugHUD body, followed by hook calls. ESLint `react-hooks/rules-of-hooks` treats this as hooks called conditionally, which fails the Next.js build lint pass.
- **Fix:** Moved all five `useScrollStore` selector calls above the env check. The env check still guards render output — Next.js still dead-code-eliminates the rendered JSX in production. The hooks themselves have negligible cost and do not introduce info leakage.
- **Files modified:** `src/components/debug/ScrollDebugHUD.tsx`
- **Verification:** `npm run build` exits 0 with no lint errors after the fix
- **Committed in:** `3916f1a` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in hook ordering relative to early return)
**Impact on plan:** Necessary for correctness. Plan's stated behavior (dev-only rendering) is fully preserved — only hook call ordering changed to satisfy React Rules of Hooks.

## Issues Encountered

- `timeout` command not available in the macOS zsh shell used for dev-server smoke test — used background process with `sleep` instead. Dev server confirmed Ready in output log.

## Open Question Resolution

**Open Question 3 (RESEARCH.md):** `lenis/dist/lenis.css` — does it exist in the installed package?
**Answer: YES** — confirmed present in `node_modules/lenis/dist/lenis.css` for lenis@1.3.23. Import included in LenisProvider.

## Manual Verification Steps (before Plan 04 starts)

Run these to confirm the scroll pipeline is live:

1. Add scrollable content: in `src/app/page.tsx`, add a tall element — e.g. `<div style={{ height: '400vh', background: 'linear-gradient(to bottom, #000, #111)' }} />`
2. `cd /Users/kameronbenjamin/portfolio && npm run dev`
3. Open `http://localhost:3000` in browser
4. Scroll the page — confirm the HUD in the top-right corner shows `scrollY`, `velocity`, `displayVelocity`, `phase`, and `progress` updating in real time
5. Open browser DevTools console — confirm zero "GSAP plugin already registered" warnings (FOUND-05)
6. In a separate terminal: `npm run build` — confirm HUD is absent from the production bundle output (tree-shaken)

## Next Phase Readiness

- **Plan 04 (HorizontalTrack)** can now import from `@/components/lenis-provider/LenisProvider` as a parent context — the `lenis.on('scroll', ScrollTrigger.update)` bridge is wired, so any ScrollTriggers registered in Plan 04 will fire at Lenis-driven positions (not native scrollY)
- **All downstream phases** can read scroll state from `useScrollStore` (React) or `useScrollStore.getState()` (R3F/60fps contexts)
- No blockers for Plan 04

## Known Stubs

None — all wiring is functional. Scroll pipeline is live but the page has no scrollable content yet (that comes in Plans 04+). The HUD will show `scrollY: 0.0` until scrollable content exists, which is expected at this stage.

## Self-Check: PASSED

- `src/components/lenis-provider/LenisProvider.tsx` — FOUND
- `src/components/debug/ScrollDebugHUD.tsx` — FOUND
- `src/app/layout.tsx` — FOUND (modified)
- Commit `d126305` — FOUND (feat: LenisProvider)
- Commit `841569f` — FOUND (feat: ScrollDebugHUD)
- Commit `3916f1a` — FOUND (feat: layout + fix)
- `npm run build` — PASSED (exit 0, zero SSR errors)
- `npx tsc --noEmit` — PASSED (exit 0)

---
*Phase: 01-scroll-foundation*
*Completed: 2026-05-06*
