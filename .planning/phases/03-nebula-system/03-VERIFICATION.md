---
phase: 03-nebula-system
verified: 2026-05-16T07:25:00Z
status: human_needed
score: 7/7 must-haves verified (automated); 5/5 success criteria pass automated checks
overrides_applied: 0
human_verification:
  - test: "Scroll the page at low speed and observe 5 particle layers plus the CSS gradient background"
    expected: "Deep space gradient is behind everything; stars, far nebula (3-color clusters), mid fog, near bokeh, foreground dust are each distinguishable; far layers move less than near layers; depth illusion holds"
    why_human: "R3F Canvas rendering and per-layer parallax depth separation can only be confirmed visually in a browser"
  - test: "Scroll rapidly downward then stop and observe the nebula reaction"
    expected: "Layers visibly spread apart and scale up (max 1.25x) during fast scroll, then settle back to 1.0 as velocity decays"
    why_human: "Breathe animation driven by displayVelocity is a real-time perceptual effect; cannot be verified without a running browser"
  - test: "Look at the far-nebula layer with naked eye"
    expected: "Three distinguishable color clusters: purple upper-left, teal upper-right, coral lower-right"
    why_human: "Color cluster visibility depends on actual rendered opacity, additive blending, and texture quality — requires visual inspection"
  - test: "Observe star field vs foreground layers while scrolling horizontally"
    expected: "Stars (coefficient 0.05) move noticeably slower than nearBokeh (0.60) and fgDust (0.80) in the horizontal direction"
    why_human: "Parallax rate separation is a perceptual test requiring live interaction"
  - test: "Enable prefers-reduced-motion in OS settings and reload"
    expected: "No scale pulse (breathe locked to 1.0); parallax still present but at 20% of normal strength; no jarring motion"
    why_human: "Reduced-motion behavior requires OS setting change and live browser verification"
---

# Phase 3: nebula-system Verification Report

**Phase Goal:** A 6-layer parallax nebula fills the background and breathes in response to scroll velocity
**Verified:** 2026-05-16T07:25:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Six distinct depth layers exist: CSS gradient (L1) + 5 particle layers (L2-L6) | VERIFIED | `NEBULA_L1_GRADIENT` applied as `background` on wrapper div in `MoonScene.client.tsx:48`; `NEBULA_LAYERS` array has 5 entries (stars, farNebula, midFog, nearBokeh, fgDust); all 5 rendered via `NEBULA_LAYERS.map()` in `NebulaScene.tsx:366-379` |
| 2 | Scroll velocity drives breathe: layers scale up to 1.25x and spread, then settle | VERIFIED | `useFrame` loop at `NebulaScene.tsx:295-347` computes `breathe = 1.0 + (NEBULA_BREATHE_MAX - 1.0) * normalizedVelocity`; `NEBULA_BREATHE_MAX = 1.25`; `points.scale.setScalar(breathe)` called per layer each frame |
| 3 | Purple, teal, and coral clusters are each represented in the nebula | VERIFIED | `NEBULA_CLUSTER_COLORS = ["#7b4fa6", "#2ec4b6", "#ff6b6b"]` in constants.ts; all three converted to `THREE.Color` and applied as per-vertex colors in `buildClusterGeometry()` and `buildBokehGeometry()` |
| 4 | Star field (coefficient 0.05) parallaxes slower than foreground layers (0.60, 0.80) in both axes | VERIFIED | Coefficients strictly monotonically increase: 0.05, 0.15, 0.30, 0.60, 0.80; `effectiveCoeff = layer.coefficient * motionScale` drives both Y and X offsets; horizontal: `-progress * NEBULA_H_PARALLAX_RANGE * effectiveCoeff * breathe` |
| 5 | Each layer moves at a distinctly different rate — coefficients monotonically increase | VERIFIED | stars=0.05, farNebula=0.15, midFog=0.30, nearBokeh=0.60, fgDust=0.80 — all distinct, strictly increasing, confirmed in `NebulaScene.constants.ts:33-37` |
| 6 | Reduced-motion guard is active | VERIFIED | `matchMedia("(prefers-reduced-motion: reduce)")` queried at mount, stored in `reducedMotionRef`; breathe locked to 1.0 and `motionScale = 0.2` when active |
| 7 | NebulaScene mounted inside single Canvas alongside MoonScene; renderOrder correct | VERIFIED | `MoonScene.client.tsx:56-63`: single `<Canvas>`, NebulaScene in first `<Suspense>`; moon mesh at `renderOrder={4}` (`MoonScene.tsx:141`); nebula back layers renderOrder 1-3, front layers 5-6 |

**Score:** 7/7 truths verified (automated)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/canvas/NebulaScene.constants.ts` | Layer constants, color tokens, breathe/parallax math constants | VERIFIED | 143 lines; exports `NEBULA_LAYERS`, `NEBULA_CLUSTER_COLORS`, `NEBULA_BREATHE_MAX`, `NEBULA_BREATHE_VELOCITY_SCALE`, `NEBULA_REDUCED_MOTION_PARALLAX_SCALE`, and 9 other constants |
| `src/components/canvas/NebulaScene.tsx` | 5-layer particle system with useFrame parallax + breathe | VERIFIED | 382 lines; full implementation — geometry builders, per-layer refs, useFrame loop, reduced-motion guard, disposal on unmount |
| `src/components/canvas/MoonScene.client.tsx` | Layer 1 CSS gradient on wrapper; NebulaScene mounted in Canvas | VERIFIED | `NEBULA_L1_GRADIENT` applied as `background` style at line 47; `NebulaScene` dynamically imported and rendered in single `<Canvas>` |
| `src/components/canvas/MoonScene.tsx` | Moon mesh at renderOrder=4 | VERIFIED | `<mesh ref={meshRef} renderOrder={4}>` at line 141 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `NebulaScene.tsx` | `useScrollStore` | `useScrollStore.getState()` inside useFrame | VERIFIED | line 296 reads `scrollY`, `displayVelocity`, `phase`, `progress` |
| `NebulaScene.tsx` | `NebulaScene.constants.ts` | named imports | VERIFIED | 13 named imports at lines 27-45 |
| `MoonScene.client.tsx` | `NebulaScene.tsx` | dynamic import + JSX | VERIFIED | `dynamic(() => import("./NebulaScene"), { ssr: false })` at line 28; `<NebulaScene />` at line 57 |
| `MoonScene.client.tsx` | `NEBULA_L1_GRADIENT` | import + inline style | VERIFIED | imported line 25; applied `background: NEBULA_L1_GRADIENT` at line 47 |
| `NebulaScene.tsx` | `createNebulaTextures()` | import + useMemo | VERIFIED | imported line 47; called in `useMemo(() => createNebulaTextures(), [])` at line 270 |
| `useFrame` breathe | `points.scale.setScalar(breathe)` | per-layer mutation | VERIFIED | line 346 inside loop over all 5 layers |
| `useFrame` parallax | `points.position.set(xOffset, yOffset, layer.z)` | per-layer mutation | VERIFIED | line 345 inside loop over all 5 layers |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 34 nebula unit tests pass | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx src/lib/__tests__/nebula-textures.test.ts` | 34/34 passed in 5.73s | PASS |
| Production build succeeds | `npm run build` | Compiled successfully; tsc clean; 4/4 static pages generated | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| NEB-01 | 03-04 | 6 depth layers visible | SATISFIED | L1 CSS gradient + 5 GL particle layers implemented and wired |
| NEB-02 | 03-04 | Breathe animation on scroll velocity | SATISFIED | useFrame breathe formula verified; scale range 1.0-1.25 confirmed |
| NEB-03 | 03-01 | 3 distinguishable color clusters | SATISFIED | `#7b4fa6`, `#2ec4b6`, `#ff6b6b` used as per-vertex colors in farNebula and bokeh geometries |
| NEB-04 | 03-04 | Star field parallaxes slower than foreground | SATISFIED | Coefficient ordering 0.05 < 0.15 < 0.30 < 0.60 < 0.80 confirmed; both axes scaled by coefficient |
| NEB-05 | 03-04 | Each layer moves at distinctly different rate | SATISFIED | 5 unique coefficients confirmed monotonically increasing |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No stubs, TODOs, TBDs, FIXMEs, or empty returns found in phase 3 files |

### Human Verification Required

#### 1. Six-layer depth composition is visible

**Test:** Load the portfolio in a browser and observe the background behind the moon
**Expected:** CSS gradient (deep space) is behind everything; five distinct particle layers are visible — stars (fine white points), far nebula (three color clusters), mid fog (diffuse tint), near bokeh (large soft blobs), foreground dust (fine grain in front of moon)
**Why human:** WebGL rendering and visual layer distinguishability cannot be verified programmatically

#### 2. Breathe animation responds to scroll velocity

**Test:** Scroll the page rapidly in the vertical zone, then stop
**Expected:** During fast scroll the nebula visibly scales up (up to 1.25x) and layers spread apart; after stopping, scale settles back to 1.0
**Why human:** Velocity-driven animation is a perceptual real-time effect requiring live browser interaction

#### 3. Three nebula cluster colors are distinguishable

**Test:** Look at the far-nebula layer (mid-distance, behind the moon)
**Expected:** Three distinct color clouds visible — purple cluster upper-left, teal upper-right, coral lower-right — each recognizable through additive blending
**Why human:** Color visibility at configured opacity levels requires actual rendering to assess

#### 4. Star field parallaxes slower than foreground in horizontal zone

**Test:** Scroll into the horizontal zone and move left/right slowly
**Expected:** Stars barely drift; near bokeh and foreground dust move significantly more per unit of horizontal progress; depth illusion is clear at slow speed
**Why human:** Perceptual separation of parallax rates requires live interaction

#### 5. Reduced-motion guard works correctly

**Test:** Enable "Reduce Motion" in OS accessibility settings, reload page, and scroll
**Expected:** No breathe pulse; parallax still present but subtle (20% of normal); no jarring scale jumps
**Why human:** Requires OS setting change and live browser verification

### Gaps Summary

No automated gaps found. All 7 observable truths are VERIFIED by codebase evidence. The implementation is substantive and fully wired — no stubs, no orphaned code, no disconnected data flows.

The `human_needed` status reflects that all 5 ROADMAP success criteria are perceptual visual/interactive behaviors that cannot be confirmed without a running browser. The automated layer is complete: constants, particle geometry builders, useFrame loop with correct breathe math, reduced-motion guard, Canvas integration, renderOrder ordering, 34 unit tests passing, and a clean production build.

---

_Verified: 2026-05-16T07:25:00Z_
_Verifier: Claude (gsd-verifier)_
