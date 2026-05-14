---
plan: 03-03
phase: 03-nebula-system
status: complete
wave: 2
committed: true
---

## Summary

Built `src/components/canvas/NebulaScene.tsx` — the static R3F composition for all 5 nebula particle layers. Turned the Plan 03-01 intentional-RED module-shape test GREEN. Full test suite is now 65/65.

## What Was Built

### NebulaScene.tsx (~305 lines)

A single R3F component rendering 5 `THREE.Points` layers in a React fragment. No animation — refs are ready for Plan 04's `useFrame` loop.

**Layer architecture (all from NEBULA_LAYERS constants):**

| Layer | Name | renderOrder | Geometry | Material |
|-------|------|-------------|----------|----------|
| 0 | stars | 1 | spread (NEBULA_SPREAD_X x NEBULA_SPREAD_Y) | star texture, NEBULA_STAR_COLOR |
| 1 | farNebula | 2 | cluster (3 centers, gaussian scatter) | nebulaBlob, vertexColors |
| 2 | midFog | 3 | spread | nebulaBlob, purple-tinted, low opacity |
| — | moon | 4 | — | — |
| 3 | nearBokeh | 5 | bokeh (spread + 40/40/20 color ratio) | bokeh texture, vertexColors |
| 4 | fgDust | 6 | spread | dustGrain texture, NEBULA_DUST_COLOR |

**Three geometry builders:**
- `buildSpreadGeometry(count)` — uniform scatter across NEBULA_SPREAD_X x NEBULA_SPREAD_Y for stars, midFog, fgDust
- `buildClusterGeometry(perCluster)` — Box-Muller gaussian scatter around 3 NEBULA_CLUSTER_CENTERS with per-vertex colors for farNebula
- `buildBokehGeometry(count)` — spread with 40/40/20 purple/teal/coral vertex color ratio for nearBokeh

**Material flags on all layers:**
- `depthWrite: false` — prevents z-fighting
- `blending: THREE.AdditiveBlending`
- `sizeAttenuation: true`

**Resource lifecycle:**
- `createNebulaTextures()` once via `useMemo([], [])` — textures live for component lifetime
- `useEffect` cleanup disposes all 4 textures and 5 geometry/material pairs

**TypeScript fix (auto-resolved deviation):**
- Exhaustive default uses `const _exhaustive: never = layer.name` — switch narrows the discriminant, not the record type

## Acceptance Criteria

| Check | Status |
|-------|--------|
| NebulaScene.tsx exists | ✓ |
| Starts with "use client"; | ✓ |
| Exports default function | ✓ |
| createNebulaTextures imported | ✓ |
| NEBULA_LAYERS used | ✓ |
| NEBULA_CLUSTER_CENTERS used | ✓ |
| 5x depthWrite: false | ✓ |
| 5x AdditiveBlending | ✓ |
| renderOrder={layer.renderOrder} | ✓ |
| 2x vertexColors: true | ✓ |
| useEffect disposal | ✓ |
| File under 800 lines (305) | ✓ |
| tsc --noEmit exits 0 | ✓ |
| Module-shape RED -> GREEN | ✓ |
| Full suite 65/65 | ✓ |

## Key Files

| File | Change | Exports |
|------|--------|---------|
| `src/components/canvas/NebulaScene.tsx` | Created | `default NebulaScene` |

## Self-Check: PASSED
