---
phase: 03-nebula-system
plan: 01
subsystem: ui
tags: [three.js, r3f, nebula, particles, constants, css-tokens, tdd]

requires:
  - phase: 02-moon-hero
    provides: MoonScene.constants.ts pattern (JSDoc + as const), MOON_DPR_CAP already fixed to [1,1.5]

provides:
  - NebulaScene.constants.ts — single source of truth for all 5 particle layer definitions, breathe, parallax, colors
  - CSS tokens --color-star-field and --color-fg-dust appended to tokens.css
  - nebula-textures.ts typed stub with correct function signature for Plan 02 to fill
  - Wave 0 RED test files: NebulaScene.test.tsx (20 passing constants assertions, 1 RED module-shape), nebula-textures.test.ts (2 passing module-shape)

affects: [03-02-textures, 03-03-nebulascene, 03-04-animation]

tech-stack:
  added: []
  patterns:
    - "Constants-first with as const + readonly tuples — exhaustive typed layer definitions Plans 02-04 import"
    - "Wave 0 RED tests: constants assertions pass immediately; module-shape test RED until component exists"

key-files:
  created:
    - src/components/canvas/NebulaScene.constants.ts
    - src/components/canvas/__tests__/NebulaScene.test.tsx
    - src/lib/nebula-textures.ts
    - src/lib/__tests__/nebula-textures.test.ts
  modified:
    - src/styles/tokens.css (two tokens appended)

key-decisions:
  - "MOON_DPR_CAP was already [1,1.5] in HEAD (fixed in Phase 2 feat(02-02)) — verified correct, no change needed"
  - "NEBULA_LAYERS renderOrder: stars=1, farNebula=2, midFog=3, nearBokeh=5, fgDust=6 (moon occupies 4)"
  - "NEBULA_SPREAD_X=18, NEBULA_SPREAD_Y=14 — wide enough that 1.25x breathe and 12-unit horizontal parallax never expose edges"

patterns-established:
  - "All nebula numeric/color constants live in NebulaScene.constants.ts; Plans 02-04 import only from here"
  - "nebula-textures.ts is SSR-safe: document.createElement only inside createNebulaTextures(), never at module scope"

requirements-completed:
  - NEB-01
  - NEB-02
  - NEB-03
  - NEB-04
  - NEB-05

duration: ~7min
completed: 2026-05-14
---

# Phase 3 Plan 01: Nebula Foundation Summary

**NebulaScene.constants.ts fully populated (5 layers, 3 cluster colors, breathe + parallax constants), CSS tokens appended, nebula-textures.ts stub typed, and Wave 0 RED tests in place covering NEB-01–05**

## Performance

- **Duration:** ~7 min
- **Completed:** 2026-05-14
- **Tasks:** 3
- **Files modified:** 5 (2 new test files, 1 new constants, 1 new stub, 1 modified tokens.css)

## Accomplishments

- `NebulaScene.constants.ts` created with all locked values: 5-entry `NEBULA_LAYERS` array, `NEBULA_CLUSTER_COLORS`, particle counts (desktop 2500 stars / mobile 1000), breathe range (`NEBULA_BREATHE_MAX=1.25`), horizontal parallax (`NEBULA_H_PARALLAX_RANGE=12`), L1 gradient CSS string, and reduced-motion scale
- CSS tokens `--color-star-field: #c8d8ff` and `--color-fg-dust: #d0e0ff` appended to tokens.css without modifying existing values
- `nebula-textures.ts` typed stub created with `createNebulaTextures(): NebulaTextures` signature — Plan 02 replaces the stub bodies with real radial-gradient draws
- Wave 0 RED test state confirmed: 20 NebulaScene constants assertions pass; 1 module-shape test fails (RED, as designed) pending Plan 03's NebulaScene.tsx; 2 nebula-textures module-shape tests pass

## Task Commits

1. **Task 1: CSS tokens + DPR cap verification** — `355a773` (feat)
2. **Task 2: NebulaScene.constants.ts** — `b18387f` (feat)
3. **Task 3: nebula-textures stub + Wave 0 RED tests** — `8538de6` (test)

## Files Created/Modified

- `src/components/canvas/NebulaScene.constants.ts` — all Phase 3 layer/breathe/parallax/color constants
- `src/styles/tokens.css` — `--color-star-field` and `--color-fg-dust` appended
- `src/lib/nebula-textures.ts` — typed stub: `createNebulaTextures()` + `NebulaTextures` interface
- `src/components/canvas/__tests__/NebulaScene.test.tsx` — 8 describe blocks, 21 tests (20 pass, 1 RED)
- `src/lib/__tests__/nebula-textures.test.ts` — 2 module-shape tests (both pass)

## Decisions Made

- `MOON_DPR_CAP` was already fixed to `[1, 1.5]` in Phase 2 (`feat(02-02)` commit). Task 1 verified correctness rather than modifying the file.
- `NEBULA_REDUCED_MOTION_PARALLAX_SCALE = 0.2` per UI-SPEC reduced motion contract.
- `NEBULA_BREATHE_VELOCITY_SCALE = 0.02` — multiply `|displayVelocity|` by this and clamp to `[0,1]` for the breathe ramp input.

## Deviations from Plan

None — plan executed as specified. MOON_DPR_CAP was already correct in HEAD; the fix task became a verification task, within the plan's stated intent.

## Issues Encountered

None. TypeScript compiles clean (`tsc --noEmit` exits 0).

## Next Phase Readiness

- Plan 02 can import `createNebulaTextures` from `src/lib/nebula-textures.ts` and replace stub canvas-draw bodies with real radial gradients
- Plans 03 and 04 have all constants available from `NebulaScene.constants.ts`
- The one RED test (`NebulaScene module shape`) will turn green when Plan 03 creates `NebulaScene.tsx`

---
*Phase: 03-nebula-system*
*Completed: 2026-05-14*
