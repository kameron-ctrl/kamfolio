---
phase: 03-nebula-system
plan: 02
subsystem: nebula-textures
tags: [three.js, canvas-2d, textures, particles, tdd, testing]
dependency_graph:
  requires:
    - 03-01
  provides:
    - createNebulaTextures()
  affects:
    - 03-03
tech_stack:
  added:
    - canvas@^2.11.2
  patterns:
    - canvas-2d radial gradient for particle sprite generation
    - vitest forks pool for native module isolation
key_files:
  created: []
  modified:
    - src/lib/nebula-textures.ts
    - src/lib/__tests__/nebula-textures.test.ts
    - vitest.config.ts
    - package.json
decisions:
  - "vitest pool=forks: required so canvas (native Node module) resolves in all workers"
  - "SRGBColorSpace on all textures: correct alpha compositing under AdditiveBlending"
  - "makeBokehTexture separate function: 4-stop gradient plus ring stroke vs 3-stop circle"
metrics:
  duration: "~7 minutes"
  completed: "2026-05-14T15:16:00Z"
  tasks: 1
  files: 4
---

# Phase 3 Plan 02: Nebula Texture Draw Implementation Summary

Real canvas-2d radial gradient draw for four nebula sprite types with 13 tests asserting pixel-presence, dimensions, gradient falloff, and sRGB color space.

## What Was Built

`createNebulaTextures()` now draws four distinct `THREE.CanvasTexture` sprites using the HTML Canvas 2D API.

**makeCircleTexture(size, blur)** — three-stop radial gradient:
- Stop 0: `rgba(255,255,255,1)` (white center, full opacity)
- Stop `blur`: `rgba(255,255,255,0.4)` (inner-falloff control point)
- Stop 1: `rgba(255,255,255,0)` (transparent edge)

Sprites produced by makeCircleTexture:

| Sprite | Size | Blur stop | Character |
|--------|------|-----------|-----------|
| star | 16x16 | 0.1 | Sharp disc, very hard edge |
| nebulaBlob | 32x32 | 0.5 | Soft gaussian blob |
| dustGrain | 8x8 | 0.2 | Sharp but slightly soft |

**makeBokehTexture(64x64, blur=0.3)** — four-stop gradient plus ring:
- Stop 0: `rgba(255,255,255,0.85)` (slightly dimmed center — classic lens bokeh reads slightly hollow)
- Stop 0.3: `rgba(255,255,255,0.5)` (inner falloff)
- Stop 0.85: `rgba(255,255,255,0.2)` (dim halo at disc edge)
- Stop 1: `rgba(255,255,255,0)` (fully transparent)
- Ring: `ctx.arc()` at radius * 0.78, stroke `rgba(255,255,255,0.18)`, lineWidth = max(1, size * 0.025) — faint lens-aperture suggestion

All four textures set `texture.colorSpace = THREE.SRGBColorSpace` and `texture.needsUpdate = true`.

## SSR Safety

`document.createElement("canvas")` lives strictly inside `makeCircleTexture` and `makeBokehTexture`. No module-level `document` access. Confirmed: `grep -nE "^\s*document\." src/lib/nebula-textures.ts` returns no results.

## Test Coverage

13 tests across 4 describe blocks:

| Block | Tests | Behavior Verified |
|-------|-------|-------------------|
| Module shape | 2 | exports function, returns 4-key object |
| Sprite dimensions | 4 | 16x16, 32x32, 64x64, 8x8 |
| Pixel draw | 6 | center alpha > 0 (x4), corner < center alpha (x2) |
| sRGB color space | 1 | all 4 textures declare SRGBColorSpace |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] canvas npm package not installed**
- **Found during:** Task 1 TDD RED phase — jsdom `getContext("2d")` returned null/threw
- **Issue:** Plan test spec assumed `canvas` was installed; it was not in devDependencies
- **Fix:** `npm install --save-dev canvas@^2.11.2`, added to `package.json` devDependencies
- **Files modified:** `package.json`
- **Commit:** 0ee868c

**2. [Rule 2 - Missing Critical Functionality] vitest worker threads isolated canvas native module**
- **Found during:** Task 1 — full suite failed after single-file run passed
- **Issue:** vitest default `threads` pool prevents native Node `.node` modules from resolving correctly in worker threads. Single-file run passed; full suite had 7 failures.
- **Fix:** Added `pool: "forks"` to `vitest.config.ts` — child process workers resolve native modules correctly
- **Files modified:** `vitest.config.ts`
- **Commit:** 0ee868c

## Known Stubs

None. All four textures draw real pixel data verified by test assertions.

## Threat Flags

None. All canvas draw inputs are static literals. No user data flows into the canvas. Textures upload to local GPU only.

## Self-Check: PASSED

- `src/lib/nebula-textures.ts` exists with `ctx.createRadialGradient`, `addColorStop`, `makeBokehTexture`, `SRGBColorSpace`
- `src/lib/__tests__/nebula-textures.test.ts` exists with 13 `it()` blocks
- `vitest.config.ts` exists with `pool: "forks"`
- `package.json` exists with `canvas: "^2.11.2"` in devDependencies
- Commit 0ee868c exists
- 13/13 tests passing, 0 TypeScript errors
- Full suite: 64 passed, 1 intentional RED (NebulaScene module shape — Plan 03)
