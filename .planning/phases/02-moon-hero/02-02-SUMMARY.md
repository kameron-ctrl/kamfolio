---
phase: 02-moon-hero
plan: "02"
subsystem: moon-hero
tags:
  - r3f
  - three.js
  - gsap
  - next-dynamic
  - ssr-guard
dependency_graph:
  requires:
    - 02-01-PLAN.md
  provides:
    - MoonScene.constants.ts (8 named exports — single source of truth)
    - MoonScene.tsx (R3F moon mesh — textures, lights, entrance, rotation)
    - MoonScene.client.tsx (next/dynamic wrapper, Canvas, opacity reveal)
    - layout.tsx wiring (MoonSceneClient mounted as Server Component island)
  affects:
    - src/app/layout.tsx
    - src/components/canvas/
tech_stack:
  added:
    - "@react-three/fiber Canvas"
    - "@react-three/drei useTexture"
    - "@gsap/react useGSAP"
    - "next/dynamic with { ssr: false }"
  patterns:
    - "Client island in Server Component layout (no use client on layout.tsx)"
    - "Readonly tuple spread to satisfy mutable Canvas dpr prop type"
    - "useGSAP from @gsap/react (auto-cleanup via gsap.context)"
    - "useFrame for per-tick rotation"
    - "prefers-reduced-motion gate for both tween and rotation"
key_files:
  created:
    - src/components/canvas/MoonScene.constants.ts
    - src/components/canvas/MoonScene.tsx
    - src/components/canvas/MoonScene.client.tsx
  modified:
    - src/app/layout.tsx
    - src/components/canvas/__tests__/MoonScene.test.tsx
decisions:
  - "MOON_DPR_CAP spread to [...MOON_DPR_CAP] on Canvas dpr prop to satisfy mutable tuple type requirement"
  - "Sphere segment count 128x128 to prevent displacement faceting on 4096px maps"
  - "MOON_DISPLACEMENT_SCALE 0.08 — visible craters without jagged silhouette"
  - "SUN_INTENSITY 3.0 with position [-10,5,8] for ~35% shadow on right hemisphere"
  - "layout.tsx children wrapped in z-index:1 div so HTML stacks above canvas z-index:0"
metrics:
  duration: "~10 minutes (continuation from prior agent)"
  completed: "2026-05-06"
  tasks_completed: 3
  files_changed: 5
---

# Phase 02 Plan 02: Moon Scene Core Build Summary

Photorealistic moon hero with NASA textures, GSAP Z fly-in, DPR-capped Canvas, and Server Component layout wiring — completing HERO-01, HERO-02, HERO-04, HERO-05, QUAL-04.

## Tasks Completed

| Task | Name | Commit |
|------|------|--------|
| 1 | Populate MoonScene.constants.ts (10 RED to GREEN) | 8efc6a1 |
| 2 | Build MoonScene.tsx (R3F mesh, textures, GSAP, useFrame) | 0d965db |
| 3 | Build MoonScene.client.tsx and mount in layout.tsx | fbc6d62 |

## Final Constants (MoonScene.constants.ts)

All 8 named exports — exact values locked by REQUIREMENTS.md and CONTEXT.md:

| Constant | Value | Source |
|----------|-------|--------|
| `MOON_DPR_CAP` | `[1, 1.5] as const` | QUAL-04, D-03 |
| `MOON_ENTRANCE_DURATION` | `2.5` | HERO-04, UI-SPEC |
| `MOON_ENTRANCE_EASE` | `"power3.out"` | D-13, UI-SPEC |
| `MOON_ENTRANCE_START_Z` | `-15` | D-11 |
| `MOON_ENTRANCE_END_Z` | `0` | D-11 |
| `MOON_ROTATION_PER_FRAME` | `0.0005` | HERO-05, D-18 |
| `MOON_X_OFFSET` | `2.0` | D-04, D-05 |
| `MOON_GLOW_RADIUS_MULTIPLIER` | `1.05` | D-17 |

## Test Results

**12 tests passed** in `src/components/canvas/__tests__/MoonScene.test.tsx`

- 10 constants tests from Plan 01 (Wave 0): were RED, now GREEN
- 2 new module-structure smoke tests (Task 3): both GREEN

Phase 1 regression: **17 tests passed** in `src/lib/__tests__/scroll-store.test.ts` — no regression.

## Build Output

`npm run build` exits 0. No SSR crash, no TypeScript errors, no ReferenceError.

```
Route (app)                              Size     First Load JS
┌ ○ /                                    959 B           116 kB
└ ○ /_not-found                          871 B          88.2 kB
+ First Load JS shared by all            87.4 kB
```

First Load JS for the layout route: **116 kB** (well within the 300 kB app page budget from CLAUDE.md).

## Tuning Notes (Claude's Discretion Values)

- **Segment count**: 128x128 — prevents displacement map faceting on 4096px source textures (RESEARCH.md Pitfall 4)
- **`MOON_DISPLACEMENT_SCALE`**: 0.08 — readable crater depth without jagged silhouette; matches RESEARCH.md Pattern 4 default
- **`SUN_INTENSITY`**: 3.0 with `PointLight` at `[-10, 5, 8]` — produces ~35% shadow on the right hemisphere per UI-SPEC lighting table
- **`AMBIENT_INTENSITY`**: 0.05 — prevents fully black shadow side while preserving dramatic lit/dark contrast
- **Moon radius**: 1.5 Three.js units (local constant in MoonScene.tsx) — fills ~50% viewport height given camera fov=50 + camera.z=6

## layout.tsx: Server Component Status Confirmed

`layout.tsx` does NOT contain `"use client"`. It retains `export const metadata` so OG/SEO metadata continues to work through all future phases.

`MoonSceneClient` is imported as a regular module reference — Next.js App Router handles the client boundary automatically. The island pattern matches RESEARCH.md Pattern 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Readonly tuple not assignable to mutable Canvas dpr prop**
- **Found during:** Task 3 — `npm run build` TypeScript error
- **Issue:** `MOON_DPR_CAP` is `readonly [1, 1.5]` (typed `as const`). R3F's `Canvas` `dpr` prop expects a mutable `[min: number, max: number]`. TypeScript rejected the assignment.
- **Fix:** Changed `dpr={MOON_DPR_CAP}` to `dpr={[...MOON_DPR_CAP]}` — spread creates a mutable copy with identical runtime values. The DPR cap [1, 1.5] is fully preserved at runtime; QUAL-04 enforcement is unchanged.
- **Files modified:** `src/components/canvas/MoonScene.client.tsx`
- **Commit:** fbc6d62

## Plan 03 Handoff

`MoonScene.tsx` renders one mesh inside a fragment:

```tsx
return (
  <>
    <ambientLight ... />
    <pointLight ... />
    <mesh ref={meshRef}>
      <sphereGeometry ... />
      <meshStandardMaterial ... />
    </mesh>
  </>
);
```

Plan 03 (MoonGlow) adds a sibling `<MoonGlow />` component after the existing `</mesh>` tag, inside the same fragment. The glow component will import `MOON_GLOW_RADIUS_MULTIPLIER` (1.05) from `MoonScene.constants.ts` and accept the moon radius (1.5) to compute its sphere size.

## Self-Check: PASSED

- [x] `src/components/canvas/MoonScene.constants.ts` — exists, 8 exports
- [x] `src/components/canvas/MoonScene.tsx` — exists, "use client", no registerPlugin, no console.log
- [x] `src/components/canvas/MoonScene.client.tsx` — exists, dynamic ssr:false, Canvas dpr spread, opacity reveal
- [x] `src/app/layout.tsx` — MoonSceneClient mounted, no "use client", metadata exported
- [x] Commits: 8efc6a1, 0d965db, fbc6d62 — all present in git log
- [x] 12 tests pass, 0 failures
- [x] `npm run build` exits 0, First Load JS 116 kB
