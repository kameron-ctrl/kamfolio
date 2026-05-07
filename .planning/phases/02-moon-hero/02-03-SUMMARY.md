---
phase: 02-moon-hero
plan: "03"
subsystem: moon-hero
tags:
  - r3f
  - three.js
  - atmospheric-glow
  - additive-blending
dependency_graph:
  requires:
    - 02-02-PLAN.md
  provides:
    - MoonGlow.tsx (atmospheric glow sphere — BackSide + AdditiveBlending + depthWrite false)
    - MoonScene.tsx (updated — composes MoonGlow as sibling after moon mesh)
  affects:
    - src/components/canvas/MoonGlow.tsx
    - src/components/canvas/MoonScene.tsx
    - src/components/canvas/__tests__/MoonScene.test.tsx
tech_stack:
  added: []
  patterns:
    - "BackSide + AdditiveBlending + depthWrite:false for atmospheric glow without z-fighting"
    - "Pure declarative R3F component — no hooks, no refs, no side effects"
    - "Sibling mesh rendered AFTER moon mesh for correct transparent blending depth order"
key_files:
  created:
    - src/components/canvas/MoonGlow.tsx
  modified:
    - src/components/canvas/MoonScene.tsx
    - src/components/canvas/__tests__/MoonScene.test.tsx
decisions:
  - "Glow sphere radius = moonRadius * MOON_GLOW_RADIUS_MULTIPLIER (1.05) — 5% larger than moon per D-17"
  - "Glow opacity 0.18 — within D-17 band (0.15–0.25), subtle halo not bloom"
  - "MoonGlow stays at z=0 resting position (does not follow moon Z fly-in) — canvas wrapper opacity:0 during entrance makes this invisible"
  - "GLOW_SEGMENTS = 32 — no displacement on glow sphere, 32x32 adequate for uniform halo"
metrics:
  duration: "~4 minutes"
  completed: "2026-05-07"
  tasks_completed: 2
  files_changed: 3
---

# Phase 02 Plan 03: MoonGlow Atmospheric Rim Summary

Atmospheric glow rim rendered as a pure declarative R3F sphere using BackSide + AdditiveBlending + depthWrite:false — closing HERO-03 and completing all Phase 2 visual requirements.

## Tasks Completed

| Task | Name | Commit |
|------|------|--------|
| 1 | Create MoonGlow.tsx — atmospheric glow sphere with BackSide + AdditiveBlending | 7230e73 |
| 2 | Compose MoonGlow into MoonScene.tsx and add module-structure smoke test | 4c11243 |

## MoonGlow.tsx Final Dimensions

| Property | Value | Source |
|----------|-------|--------|
| Glow sphere radius | `moonRadius * 1.05` = `1.575` Three.js units at runtime | D-17, MOON_GLOW_RADIUS_MULTIPLIER |
| Segment count | 32 x 32 | No displacement — 32 is sufficient for a uniform halo |
| Opacity | 0.18 | UI-SPEC locked; within D-17 band 0.15–0.25 |
| Color | `#a0c8ff` | Matches `--color-moon-glow` in `tokens.css` |
| Blending | `THREE.AdditiveBlending` | D-17, HERO-03 |
| Side | `THREE.BackSide` | RESEARCH.md Pattern 5 — inward faces only |
| depthWrite | `false` | RESEARCH.md Pitfall 5 — prevents z-fighting |

## JSX Render Order (RESEARCH Pitfall 5)

`<MoonGlow>` renders AFTER `</mesh>` in MoonScene.tsx JSX. Three.js processes render in JSX order — transparent AdditiveBlending mesh must come after the opaque moon mesh for correct compositing.

Verified: `awk '/<\/mesh>/{m=NR} /<MoonGlow/{g=NR} END{exit !(g>m)}' src/components/canvas/MoonScene.tsx` exits 0.

## Test Results

**14 tests passed** in `src/components/canvas/__tests__/MoonScene.test.tsx`

- 10 constants tests from Plan 01 (Wave 0)
- 2 module-structure smoke tests from Plan 02 Task 3
- 2 new MoonGlow module-structure smoke tests (Plan 03 Task 2)

Phase 1 regression: **17 tests passed** in `src/lib/__tests__/scroll-store.test.ts` — no regression.

## Build Output

`npm run build` exits 0. `npx tsc --noEmit` exits 0.

```
Route (app)                              Size     First Load JS
┌ ○ /                                    959 B           116 kB
└ ○ /_not-found                          871 B          88.2 kB
+ First Load JS shared by all            87.4 kB
```

First Load JS: **116 kB** — no change from Plan 02 (MoonGlow.tsx is inside the dynamic R3F bundle; no impact on initial page JS).

## Phase 2 Closure

All 6 Phase 2 requirements are now implementation-complete:

| Req ID | Description | Plan |
|--------|-------------|------|
| HERO-01 | NASA displacement + normal maps — photorealistic craters | 02-02 |
| HERO-02 | PointLight sun — realistic lit/dark hemisphere | 02-02 |
| HERO-03 | Atmospheric glow rim — AdditiveBlending second sphere | 02-03 |
| HERO-04 | Z fly-in entrance animation over 2.5s | 02-02 |
| HERO-05 | Y-axis self-rotation 0.0005 rad/frame | 02-02 |
| QUAL-04 | DPR cap [1, 1.5] on Canvas | 02-02 |

Phase 2 is ready for `/gsd-verify-work` and visual UAT.

## Phase 3 Handoff

`MoonGlow.tsx` is currently a pure static component — no scroll reactivity, no animation of its own. The glow stays at z=0 (resting position) regardless of the moon's Z fly-in entrance. This is intentional: the canvas wrapper is at `opacity:0` until both moon and glow are settled, so users never see the glow isolated.

Phase 3 (nebula/scroll) may later add scroll-velocity scaling to MoonGlow (NEB-04 "breathe" pattern) by wrapping or extending this component. Phase 2 deliberately leaves it pure declarative so Phase 3 can add reactivity in isolation.

## Deviations from Plan

None — plan executed exactly as written. The `dpr={[...MOON_DPR_CAP]}` spread form in `MoonScene.client.tsx` (vs. `dpr={MOON_DPR_CAP}`) was a pre-existing deviation documented in 02-02-SUMMARY.md; Plan 03 did not touch that file.

## Known Stubs

None — MoonGlow.tsx is a fully wired component. The glow color `#a0c8ff` exactly matches `--color-moon-glow` in `tokens.css`. No placeholder values, no hardcoded empty arrays, no TODO comments in shipped code.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. MoonGlow.tsx is a pure client-side Three.js mesh — no trust boundary crossed. All STRIDE mitigations from the plan threat model are satisfied:

- T-02-03-01: `depthWrite={false}` present + MoonGlow renders after moon mesh
- T-02-03-02: `"#a0c8ff"` literal matches `tokens.css`
- T-02-03-03: No `console.log` in MoonGlow.tsx
- T-02-03-04: No hooks (useState|useEffect|useFrame|useGSAP|useScrollStore = 0)
- T-02-03-05: 32x32 segments (not 128x128) on glow sphere
- T-02-03-06: Accepted — canvas `pointer-events:none` unchanged

## Self-Check: PASSED

- [x] `src/components/canvas/MoonGlow.tsx` — exists, "use client", BackSide + AdditiveBlending + depthWrite:false + opacity 0.18 + color #a0c8ff
- [x] `src/components/canvas/MoonScene.tsx` — imports MoonGlow, renders after moon mesh
- [x] `src/components/canvas/__tests__/MoonScene.test.tsx` — 14 tests, MoonGlow describe block present
- [x] Commits: 7230e73 (MoonGlow.tsx), 4c11243 (MoonScene + tests) — both present in git log
- [x] 14 tests pass, 0 failures
- [x] `npm run build` exits 0, First Load JS 116 kB
- [x] `npx tsc --noEmit` exits 0
- [x] Phase 1 regression: 17 tests pass
