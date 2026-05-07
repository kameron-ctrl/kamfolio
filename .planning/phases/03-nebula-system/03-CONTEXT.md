# Phase 3: Nebula System — Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a 6-layer parallax nebula inside the existing global R3F Canvas — deep space gradient through foreground dust motes — that responds to scroll position (parallax) and scroll velocity (breathe). The nebula is the permanent atmospheric backdrop; it wraps both the vertical hero zone and the horizontal project zone.

Does NOT include: hero text overlay (Phase 4), project cards (Phase 5), any non-nebula canvas elements. The moon from Phase 2 remains untouched — this phase only adds nebula layers around it.

</domain>

<decisions>
## Implementation Decisions

### Moon-Nebula Depth Relationship
- **D-01:** Moon sits mid-stack. Layers 1–4 (deep space gradient, stars, far nebula, mid volumetric fog) render **behind** the moon. Layers 5–6 (near bokeh, foreground dust motes) render **in front** of the moon. The moon feels embedded inside the nebula — particles from near layers drift across its face.
- **D-02:** Three.js render order: assign explicit `renderOrder` values (layers 1–4 at renderOrder 0–3, moon at renderOrder 4, layers 5–6 at renderOrder 5–6). `depthWrite: false` on all particle layers to prevent z-fighting.

### Velocity Breathe Character
- **D-03:** **Visible cinematic pulse** — at peak `displayVelocity`, layers spread ~20–30% (translate offset multiplied) and scale ~1.15–1.2×. Clearly visible to the visitor.
- **D-04:** Breathe decay: ~0.6–0.8s settle time once velocity drops. Read the existing `displayVelocity` from the Zustand scroll store — already lerped at factor 0.15, so no additional smoothing needed on the nebula side.
- **D-05:** Breathe is applied as a scale + spread multiplier to the parallax offset calculation — not as a separate animation. At velocity ≈ 0, multiplier = 1.0. At peak velocity, multiplier = 1.2–1.3. Tune during execution.

### Parallax Driver — Both Zones
- **D-06:** **Vertical zone** (`phase = "vertical" | "transition"`): Each layer offsets on the Y axis by `scrollY * parallaxCoefficient`. Background layers (0.05×) barely move; foreground layers (0.8×) move significantly.
- **D-07:** **Horizontal zone** (`phase = "horizontal"`): Y parallax freezes at its final vertical-zone value. X parallax engages — each layer offsets on the X axis by `horizontalProgress * parallaxCoefficient`. Both vertical freeze + horizontal engage happen simultaneously when `phase` transitions to `"horizontal"`.
- **D-08:** All parallax reads from `useScrollStore.getState()` inside `useFrame` — never via React selector subscriptions (same pattern established in Phase 1/2 for R3F layers).

### Layer Stack (6 Layers)
- **D-09:** Layer order, parallax coefficient, and render position:

| Layer | Name | Coefficient | In Front of Moon? |
|-------|------|-------------|-------------------|
| 1 | Deep space gradient | 0.0× (fixed) | No |
| 2 | Distant stars | 0.05× | No |
| 3 | Far nebula clusters | 0.15× | No |
| 4 | Mid volumetric fog | 0.3× | No |
| 5 | Near bokeh | 0.6× | Yes |
| 6 | Foreground dust motes | 0.8× | Yes |

- **D-10:** Layer 1 (deep space gradient) is a CSS background on the canvas wrapper div or a full-screen `PlaneGeometry` with a gradient material — not a particle system. Claude's discretion on implementation.

### Particle Clusters (Layers 3–6)
- **D-11:** Three named nebula clusters (~800 particles each), `AdditiveBlending`, colors from requirements: purple `#7b4fa6`, teal `#2ec4b6`, coral `#ff6b6b`. Clusters inhabit layers 3–4 primarily, with tendrils into layer 5.
- **D-12:** Layer 2 (stars) is a separate `THREE.Points` with ~2000–3000 points, white/pale-blue, very small `size`. Not part of the named color clusters.

### Layer Rendering Technique
- **D-13:** `THREE.Points` with **per-layer sprite textures** — a canvas-generated texture per layer type:
  - Stars: sharp circle (1px antialiased disc)
  - Nebula clusters (far/mid): soft gaussian blob (~32×32 canvas texture)
  - Near bokeh: large soft circle (classic bokeh disc, ~64×64)
  - Foreground dust: tiny grain texture (~8×8)
- **D-14:** Textures are generated at runtime via `OffscreenCanvas` or regular `<canvas>` in a utility function (e.g., `src/lib/nebula-textures.ts`). Not loaded from `/public` — generated once on mount and reused.
- **D-15:** Implementation specifics (blur radius per texture, exact particle sizes, z-positions of each layer plane) are Claude's discretion — optimize for visual quality within the GPU budget.

### Component Architecture
- **D-16:** Nebula lives at `src/components/canvas/NebulaScene.tsx`. Rendered inside the existing `<Canvas>` in `MoonSceneClient`, alongside `MoonScene`. Both inside the same `<Suspense>` boundary or separate sibling Suspense boundaries — Claude's discretion on Suspense grouping.
- **D-17:** `MoonSceneClient` may need to be renamed/extended to accommodate both scenes. The critical constraint is a **single `<Canvas>` instance** — requirements explicitly forbid multiple WebGL contexts.
- **D-18:** A constants file `src/components/canvas/NebulaScene.constants.ts` holds layer coefficients, particle counts, colors, and breathe multiplier range. Same pattern as `MoonScene.constants.ts`.

### Claude's Discretion
- Exact parallax coefficient per layer within the 0.05×–0.8× range (D-09 gives anchors)
- Z-position of each layer plane in 3D space (spread across z=-2 to z=2 to interact naturally with moon at z=0)
- Breathe multiplier peak value (tune during execution within 1.2–1.3 range)
- Canvas texture generation approach (`OffscreenCanvas` vs. regular canvas)
- Whether Layer 1 (deep space gradient) is CSS vs. PlaneGeometry
- Suspense grouping for NebulaScene vs. MoonScene

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — NEB-01 through NEB-05 acceptance criteria (authoritative)
- `.planning/ROADMAP.md` Phase 3 section — success criteria checklist (5 items)

### Prior Phase Context
- `.planning/phases/01-scroll-foundation/01-CONTEXT.md` — scroll store shape (D-08 through D-10): `scrollY`, `velocity`, `displayVelocity`, `phase`, `progress`
- `.planning/phases/02-moon-hero/02-CONTEXT.md` — Canvas architecture (D-01 through D-03), moon position (D-04, D-05), DPR cap, component file structure

### Codebase Integration Points
- `src/lib/scroll-store.ts` — Zustand store; `getState()` inside `useFrame` is the correct read pattern for R3F layers
- `src/components/canvas/MoonScene.client.tsx` — current Canvas owner; Phase 3 adds NebulaScene inside the same Canvas
- `src/components/canvas/MoonScene.constants.ts` — `MOON_DPR_CAP`, `MOON_X_OFFSET` etc. — do not duplicate these in nebula constants

### Critical Constraints
- **Single Canvas only** — requirements out-of-scope explicitly forbids multiple WebGL contexts. NebulaScene must render inside the existing `<Canvas>` in MoonSceneClient.
- `depthWrite: false` on all particle materials — prevents z-fighting between layers
- `displayVelocity` from scroll store is already lerped — nebula reads this directly, no re-smoothing
- Three.js version pinned at `^0.168.0` — do not change (R3F 8.x breaks with 0.169+)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/scroll-store.ts` — `useScrollStore.getState()` inside `useFrame` gives `scrollY`, `displayVelocity`, `phase`, `progress`. NebulaScene reads all four.
- `src/lib/gsap.ts` — single GSAP import; only needed if nebula uses GSAP for breathe (likely not — useFrame loop is cleaner for per-frame particle updates).
- `src/components/canvas/MoonScene.constants.ts` — `MOON_X_OFFSET = 2.0`, camera `fov=50`, camera `position=[0,0,6]`. NebulaScene must be aware of moon's X position when placing foreground particle clusters.

### Established Patterns
- Canvas components: `ComponentName.tsx` (R3F content) + `ComponentName.client.tsx` (Canvas wrapper with `next/dynamic ssr:false`)
- Constants files: `ComponentName.constants.ts` for all magic numbers
- `useFrame` for per-frame updates — no scroll event listeners in R3F components
- `getState()` not `useStore()` inside `useFrame` — avoids React re-render churn at 60fps

### Integration Points
- `src/components/canvas/MoonScene.client.tsx` — add `<NebulaScene />` inside the existing `<Canvas>`. Layers 1–4 before `<MoonScene />` in JSX order; layers 5–6 after (Three.js renders in JSX order, adjusted by `renderOrder`).
- `app/layout.tsx` — no changes needed; MoonSceneClient is already mounted.

</code_context>

<specifics>
## Specific Ideas

- Moon embedded mid-stack is the key creative decision — foreground nebula layers drifting over the moon's surface makes the scene feel like outer space rather than a floating moon graphic.
- Velocity breathe should be clearly visible — this is a cinematic portfolio. When the visitor scrolls fast, the nebula should visibly inhale and settle.
- Both parallax axes active in horizontal zone — nebula feels continuous through the full scroll journey, not switched off when project cards appear.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-nebula-system*
*Context gathered: 2026-05-07*
