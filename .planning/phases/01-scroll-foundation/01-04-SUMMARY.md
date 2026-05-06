---
phase: 01-scroll-foundation
plan: "04"
subsystem: scroll
tags: [gsap, scrolltrigger, pin, horizontal-track, page-content, lenis]
dependency_graph:
  requires:
    - 01-01  # Next.js scaffold + packages (@gsap/react, gsap, lenis installed)
    - 01-02  # @/lib/gsap.ts single registration site
    - 01-03  # LenisProvider with lenis.on('scroll', ScrollTrigger.update) bridge
  provides:
    - HorizontalTrack component (D-11, D-12) — GSAP pin+scrub, Phase 5 consumes
    - page.tsx Phase 1 demo page with vertical spacer + placeholder slots (D-13)
  affects:
    - src/app/page.tsx — root route now has real scroll-interactive content
    - Phase 5 — HorizontalTrack is the mounting point for real project cards
tech_stack:
  added: []
  patterns:
    - GSAP pin+scrub with outer-pin / inner-animate separation (Pattern 4)
    - useGSAP from @gsap/react for StrictMode-safe ScrollTrigger registration (D-05)
    - Server Component page importing Client Component HorizontalTrack (App Router boundary)
key_files:
  created:
    - src/components/horizontal-track/HorizontalTrack.tsx
  modified:
    - src/app/page.tsx
decisions:
  - "scrub: 1 retained at default — 1s catch-up matches Lenis 1.2s duration smoothing (A2)"
  - "anticipatePin: 1 retained — reduces visual jitter at pin entry without side effects (A4)"
  - "markers: process.env.NODE_ENV === 'development' — dev-only debug overlay, tree-shaken in prod (T-01-08)"
  - "250vh vertical spacer chosen to align pin at ~55% scroll depth per D-09 geometry"
metrics:
  duration: ~15 minutes
  completed: "2026-05-05"
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 1 Plan 04: HorizontalTrack + Page Demo Summary

**One-liner:** GSAP pin+scrub horizontal track using outer-section-pin / inner-track-animate pattern, wired into a 450vh demo page with 250vh vertical spacer aligning the pin trigger to the D-09 55% horizontal phase boundary.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build HorizontalTrack component | c6f4857 | src/components/horizontal-track/HorizontalTrack.tsx (created) |
| 2 | Wire page.tsx with vertical spacer + placeholder slots | 4cacc49 | src/app/page.tsx (modified) |

## What Was Built

### Task 1: HorizontalTrack (`src/components/horizontal-track/HorizontalTrack.tsx`)

Implements D-11 (full pin+translateX end-to-end), D-12 (file location), FOUND-02 (correct horizontal pin), and FOUND-04 (ScrollTrigger locked to Lenis position).

Key implementation details:
- **Pattern 4 compliance:** Outer `<section>` is pinned; inner `<div>` (track) is animated with `x`. These are separate refs on separate elements — the GSAP docs warning "don't animate the pinned element" is fully honored.
- **StrictMode safety (D-05, Pitfall 3):** `useGSAP` from `@gsap/react` wraps `gsap.context()` and auto-reverts on the second StrictMode invoke without leaking triggers.
- **Lenis sync (FOUND-04):** Trigger registers after `LenisProvider`'s `useLayoutEffect` has wired `lenis.on('scroll', ScrollTrigger.update)`. This means trigger start/end fire at Lenis's `animatedScroll` offsets, not native `window.scrollY`.
- **Import discipline (D-15):** Only imports from `@/lib/gsap` — never from `gsap/ScrollTrigger` directly.

ScrollTrigger config:

| Parameter | Value | Tunable? | Note |
|-----------|-------|----------|------|
| `ease` | `"none"` | No | Required for scrub |
| `pin` | `true` | No | Core feature |
| `scrub` | `1` | A2 — yes | 1s catch-up matches Lenis 1.2s duration |
| `anticipatePin` | `1` | A4 — yes | Remove if jitter misbehaves |
| `invalidateOnRefresh` | `true` | No | Required for resize correctness |
| `markers` | `process.env.NODE_ENV === "development"` | No | Dev-only, tree-shaken in prod |
| `start` | `"top top"` | Yes | Standard pin start |
| `end` | `() => "+=" + (track.scrollWidth - window.innerWidth)` | No | Function form re-evaluates on refresh |

### Task 2: page.tsx (`src/app/page.tsx`)

Implements D-13 (visible placeholder band) and aligns document geometry with D-09 phase boundaries.

**Document geometry:**
- Vertical spacer: `250vh` (future hero + nebula zone)
- HorizontalTrack: 3 slots x `100vw` each = `300vw` inner width, `200vw` horizontal travel
- GSAP pinSpacer: `200vh` equivalent added automatically by ScrollTrigger
- Total scroll distance: `~450vh`
- Pin engages at: `250vh / 450vh = ~55%` — matches D-09 horizontal phase boundary

`page.tsx` remains a Server Component (no `"use client"`). App Router boundary correctly enforced by `"use client"` on `HorizontalTrack.tsx` only.

## Build and Test Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0 — no type errors |
| `npm run build` | Exit 0 — 953B route, no SSR errors |
| `npm test -- --run` | Exit 0 — 17/17 scroll-store tests pass |

## Manual Verification Checklist

The following items require `npm run dev` + browser scroll-through:

- [ ] 1. ScrollDebugHUD shows `phase: vertical` and `velocity` updating on scroll
- [ ] 2. At ~40% scroll depth — HUD `phase` changes to `transition`
- [ ] 3. At ~55% scroll depth — HUD `phase` changes to `horizontal`, page pins, inner track slides leftward
- [ ] 4. Past the pin — page resumes vertical scrolling into trailing spacer
- [ ] 5. No visual jump or stutter at pin entry/exit
- [ ] 6. Devtools console: zero "GSAP plugin already registered" warnings (FOUND-05)
- [ ] 7. ScrollTrigger markers show pin start/end aligned with section visual boundaries (FOUND-04)
- [ ] 8. Track translates leftward by `track.scrollWidth - window.innerWidth` total (2 viewport widths for 3 slots)

## Deviations from Plan

None — plan executed exactly as written.

Note: The `data-testid` acceptance criterion for "3 distinct attributes for N in 0,1,2" is satisfied via the dynamic JSX pattern `data-testid={\`horizontal-slot-${i}\`}` inside `.map()`, which renders `horizontal-slot-0`, `horizontal-slot-1`, `horizontal-slot-2` at runtime. This is the correct approach for mapped arrays.

## Phase 5 Notes

- **Pitfall 6:** When Phase 5 conditionally remounts cards, any killed pin trigger must be followed by `ScrollTrigger.refresh()` to clear the pinSpacer blank-space artifact.
- **Slot width contract:** Phase 5 card children must set `width: 100vw` and `flexShrink: 0`.
- **A2 tuning:** `scrub: 1` may need adjustment if Lenis `duration` changes from 1.2s — keep them correlated.
- **A4 tuning:** Remove `anticipatePin: 1` if it causes layout shifts with real card content.

## Known Stubs

- Three placeholder slots (`Placeholder 1`, `Placeholder 2`, `Placeholder 3`) in `page.tsx` — intentional Phase 1 scaffolding per D-13. Real project card content arrives in Phase 5.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or schema changes introduced. The `markers` flag is gated to `process.env.NODE_ENV === "development"` (T-01-08 mitigated).

## Self-Check: PASSED

- `src/components/horizontal-track/HorizontalTrack.tsx` — FOUND
- `src/app/page.tsx` — FOUND (modified)
- Commit `c6f4857` — FOUND
- Commit `4cacc49` — FOUND
