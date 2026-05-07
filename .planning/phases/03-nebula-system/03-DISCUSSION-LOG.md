# Phase 3: Nebula System — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 03-nebula-system
**Areas discussed:** Moon-nebula depth relationship, Velocity breathe intensity, Horizontal zone parallax driver, Layer rendering technique

---

## Moon-Nebula Depth Relationship

| Option | Description | Selected |
|--------|-------------|----------|
| A — Moon always in front | All nebula layers render behind the moon. Clean read, moon always fully visible. | |
| B — Moon embedded mid-stack | Layers 1–4 behind moon, layers 5–6 (near bokeh + foreground dust) in front. Moon feels inside the nebula. | ✓ |
| C — You decide | Claude picks whichever reads best visually. | |

**User's choice:** B — Moon embedded mid-stack
**Notes:** Near-bokeh and foreground dust motes render in front of the moon. Foreground layers (5–6) use `renderOrder` values above the moon mesh; all particle layers use `depthWrite: false`.

---

## Velocity Breathe Intensity

| Option | Description | Selected |
|--------|-------------|----------|
| A — Subtle atmospheric shimmer | ~5–10% spread, ~1.05× scale, ~0.3s decay. Barely perceptible. | |
| B — Visible cinematic pulse | ~20–30% spread, ~1.15–1.2× scale, ~0.6–0.8s decay. Clearly visible. | ✓ |
| C — Dramatic surge | 40%+ spread, ~1.3× scale. High energy, potentially distracting. | |
| D — You decide | Claude tunes during implementation. | |

**User's choice:** B — Visible cinematic pulse
**Notes:** At peak `displayVelocity`, layers visibly inhale then settle. Decay ~0.6–0.8s. Breathe applied as a multiplier to the parallax offset calculation.

---

## Horizontal Zone Parallax Driver

| Option | Description | Selected |
|--------|-------------|----------|
| A — Horizontal scroll progress drives X offset | X parallax engages based on card-track scroll progress. | |
| B — Velocity only in horizontal zone | No positional parallax in horizontal zone; only velocity breathe active. | |
| C — Both axes active | Y freezes at final vertical value; X engages with horizontal progress simultaneously. | ✓ |

**User's choice:** C — Both axes active
**Notes:** When `phase` transitions to `"horizontal"`, Y offset freezes at its last vertical value and X offset begins responding to `progress` within the horizontal zone.

---

## Layer Rendering Technique

| Option | Description | Selected |
|--------|-------------|----------|
| A — Three.js Points throughout | All layers use `THREE.Points` with `PointsMaterial`. Simple, consistent, sharp particles. | |
| B — Points with per-layer sprite textures | `THREE.Points` + canvas-generated texture per layer type. Best visual quality, each layer feels distinct. | ✓ |
| C — You decide | Claude picks the technique. | |

**User's choice:** B with C discretion on specifics — per-layer sprite textures, implementation details at Claude's discretion
**Notes:** Stars: sharp circle. Nebula clusters: soft gaussian blob. Near bokeh: large soft circle. Foreground dust: tiny grain. Textures generated at runtime via canvas utility, not loaded from `/public`.

---

## Claude's Discretion

- Exact parallax coefficient per layer within 0.05×–0.8× range
- Z-position of each layer plane in 3D space
- Breathe multiplier peak value (tune within 1.2–1.3 range)
- Canvas texture generation approach (`OffscreenCanvas` vs. regular canvas)
- Layer 1 (deep space gradient): CSS vs. PlaneGeometry
- Suspense grouping for NebulaScene vs. MoonScene

## Deferred Ideas

None — discussion stayed within phase scope.
