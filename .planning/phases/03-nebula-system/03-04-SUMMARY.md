---
phase: 03-nebula-system
plan: 04
subsystem: ui
tags: [react-three-fiber, three.js, nebula, parallax, animation, useFrame, zustand, webgl]

# Dependency graph
requires:
  - phase: 03-03
    provides: static NebulaScene.tsx with 5 particle layers and per-layer refs
  - phase: 03-01
    provides: NebulaScene.constants.ts with locked breathe/parallax constants
  - phase: 03-02
    provides: createNebulaTextures() in src/lib/nebula-textures.ts
  - phase: 02-moon
    provides: MoonScene.client.tsx Canvas wrapper and MoonScene.tsx moon mesh

provides:
  - useFrame loop in NebulaScene.tsx driving per-layer parallax and breathe mutation
  - Layer 1 deep-space CSS radial gradient applied on MoonSceneClient wrapper div
  - NebulaScene rendered inside the existing single R3F Canvas alongside MoonScene
  - Moon mesh at renderOrder=4 sitting between back layers (1-3) and front layers (5-6)
  - reduced-motion guard: parallax coefficients at 20%, breathe locked to 1.0
  - Horizontal phase Y-parallax freeze using frozenVerticalScrollY ref

affects: [04-project-cards, 05-personality-sections, polish-responsive]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useScrollStore.getState() inside useFrame (never selector subscription) for 60fps scroll state reads
    - reducedMotionRef set once at mount via matchMedia, read per-frame without re-querying
    - frozenVerticalScrollY pattern for Y-parallax freeze when horizontal phase begins
    - breathe multiplier: 1.0 + (MAX - 1.0) * clamp(|displayVelocity| * scale, 0, 1)
    - Single R3F Canvas hosts all 3D children; CSS gradient on wrapper div provides Layer 1

key-files:
  created: []
  modified:
    - src/components/canvas/NebulaScene.tsx
    - src/components/canvas/MoonScene.client.tsx
    - src/components/canvas/MoonScene.tsx

key-decisions:
  - "useScrollStore.getState() inside useFrame avoids React reconciler overhead at 60fps (D-08)"
  - "frozenVerticalScrollY captures last non-horizontal scrollY so Y-parallax freezes cleanly when horizontal phase begins (RESEARCH Pitfall 1)"
  - "Layer 1 as CSS radial-gradient on wrapper div with Canvas alpha:true lets gradient bleed through (D-10, RESEARCH Pitfall 6)"
  - "Single Canvas constraint: NebulaScene added inside existing Suspense boundary alongside MoonScene (D-17)"
  - "renderOrder=4 on moon mesh ensures correct depth ordering between back (1-3) and front (5-6) nebula layers (D-02)"

patterns-established:
  - "Pattern: useFrame + getState() — per-frame store reads bypass React for perf-critical animation loops"
  - "Pattern: reducedMotionRef — single matchMedia read at mount stored in a ref, read per-frame without DOM queries"
  - "Pattern: frozenVerticalScrollY — phase-switching Y freeze via mutable ref updated only in non-horizontal frames"

requirements-completed: [NEB-01, NEB-02, NEB-04, NEB-05]

# Metrics
duration: 12min
completed: 2026-05-14
---

# Phase 3 Plan 04: Nebula Animation Integration Summary

**per-frame parallax + breathe wired in NebulaScene.tsx via useFrame + getState(), L1 CSS gradient on MoonSceneClient wrapper, NebulaScene rendered inside the existing single Canvas, moon at renderOrder=4**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-14T21:22:00Z
- **Completed:** 2026-05-14T21:34:14Z
- **Tasks:** 2 auto tasks complete; Task 3 is a human-verify checkpoint
- **Files modified:** 3

## Accomplishments

- NebulaScene.tsx now mutates each layer's position.set() and scale.setScalar() per-frame using displayVelocity, scrollY, phase, and progress from the Zustand scroll store via getState()
- Y-parallax freezes at last vertical-zone scrollY when horizontal phase begins; X-parallax activates only in horizontal phase
- breathe multiplier scales 1.0-1.25 with |displayVelocity| * 0.02, clamped to [0,1]; reduced-motion locks breathe to 1.0 and reduces parallax coefficients to 20%
- MoonSceneClient wrapper div carries the Layer 1 deep-space radial CSS gradient (NEBULA_L1_GRADIENT); Canvas alpha:true was already set by prior work
- NebulaScene dynamically imported and rendered inside the existing Suspense boundary alongside MoonScene (single Canvas constraint D-17 maintained)
- Moon mesh stamped with renderOrder=4 for correct depth ordering between back nebula layers (renderOrder 1-3) and front nebula layers (renderOrder 5-6)
- tsc clean, vitest 65/65, next build passes with no SSR errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add useFrame parallax + breathe + reduced-motion** - `5e381ea` (feat)
2. **Task 2: Integrate NebulaScene into MoonSceneClient, apply L1 gradient, update MoonScene** - `8383f9c` (feat)
3. **Task 3: Human verification checkpoint** - awaiting user approval

## Files Created/Modified

- `src/components/canvas/NebulaScene.tsx` — added useFrame loop with per-layer position/scale mutation, reduced-motion detection, frozenVerticalScrollY pattern
- `src/components/canvas/MoonScene.client.tsx` — added NEBULA_L1_GRADIENT import, NebulaScene dynamic import, background gradient on wrapper div, NebulaScene in Suspense
- `src/components/canvas/MoonScene.tsx` — added renderOrder={4} to moon mesh

## Decisions Made

- Canvas already had `gl={{ alpha: true }}` from prior execution work; confirmed and kept
- `<color attach="background">` was already absent from MoonScene.tsx from prior work; no removal needed
- The `grep -c '<Canvas'` acceptance check in Task 2 shows count=2 because the JSDoc comment in the file header also contains `<Canvas>` text; actual JSX has exactly 1 `<Canvas` element

## Deviations from Plan

None — plan executed exactly as written. Two acceptance checks that appeared to potentially fail on inspection were confirmed correct: `alpha: true` was already in place, and `<color attach="background">` was already absent from prior executor work.

## Issues Encountered

None — all changes applied cleanly. tsc, vitest, and next build all passed on first attempt.

## Known Stubs

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The nebula system is fully wired and animation-ready; all code tasks complete
- Human visual verification (Task 3 checkpoint) is required before Phase 3 can be marked complete
- Once the 5 ROADMAP success criteria are confirmed, Phase 3 can be closed and Phase 4 (project cards) can begin
- The single Canvas pattern is locked; Phase 4 should NOT add additional Canvas elements

## Self-Check: PASSED

Commits verified:
- `5e381ea` — feat(03-04): add useFrame parallax + breathe + reduced-motion to NebulaScene
- `8383f9c` — feat(03-04): integrate NebulaScene into single Canvas, apply L1 gradient, renderOrder moon

Files verified:
- src/components/canvas/NebulaScene.tsx — contains useFrame, getState(), frozenVerticalScrollY, matchMedia, prefers-reduced-motion
- src/components/canvas/MoonScene.client.tsx — contains NebulaScene dynamic import, NEBULA_L1_GRADIENT, background gradient, NebulaScene in JSX
- src/components/canvas/MoonScene.tsx — contains renderOrder={4} on moon mesh

---
*Phase: 03-nebula-system*
*Completed: 2026-05-14*
