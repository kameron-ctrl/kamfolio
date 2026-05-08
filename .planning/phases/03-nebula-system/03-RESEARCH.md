# Phase 3: Nebula System — Research

**Researched:** 2026-05-07
**Domain:** React Three Fiber particle systems, canvas texture generation, scroll-driven parallax + velocity breathe
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Moon sits mid-stack. Layers 1–4 render behind the moon. Layers 5–6 render in front.
- **D-02:** Explicit `renderOrder` values: layers 1–4 at renderOrder 0–3, moon at renderOrder 4, layers 5–6 at renderOrder 5–6. `depthWrite: false` on all particle layers.
- **D-03:** Visible cinematic pulse at peak `displayVelocity` — layers spread ~20–30% and scale ~1.15–1.2x.
- **D-04:** Breathe decay ~0.6–0.8s settle. Read `displayVelocity` directly from store — already lerped at 0.15. No re-smoothing on nebula side.
- **D-05:** Breathe applied as scale + spread multiplier to parallax offset. At velocity ≈ 0, multiplier = 1.0. At peak, multiplier = 1.2–1.3.
- **D-06:** Vertical zone: each layer offsets Y by `scrollY * parallaxCoefficient`.
- **D-07:** Horizontal zone: Y parallax freezes at final vertical value. X parallax engages via `progress * parallaxCoefficient` (where progress is within-phase 0–1 when `phase === "horizontal"`).
- **D-08:** All parallax reads from `useScrollStore.getState()` inside `useFrame` — never React selector subscriptions.
- **D-09:** Layer stack with exact coefficients (see table in CONTEXT.md).
- **D-10:** Layer 1 (deep space gradient) is CSS background or full-screen PlaneGeometry — Claude's discretion.
- **D-11:** Three named clusters ~800 particles each, AdditiveBlending, colors: `#7b4fa6`, `#2ec4b6`, `#ff6b6b`.
- **D-12:** Layer 2 (stars): separate `THREE.Points`, ~2000–3000 points, white/pale-blue, small size.
- **D-13:** Per-layer sprite textures via canvas-generated CanvasTexture.
- **D-14:** Textures generated at runtime via `OffscreenCanvas` or regular `<canvas>` in `src/lib/nebula-textures.ts`. Not from `/public`.
- **D-15:** Implementation specifics (blur radius, particle sizes, z-positions) are Claude's discretion.
- **D-16:** Nebula lives at `src/components/canvas/NebulaScene.tsx`. Inside existing `<Canvas>` in `MoonSceneClient`.
- **D-17:** `MoonSceneClient` may need extending. Single `<Canvas>` constraint is absolute.
- **D-18:** Constants at `src/components/canvas/NebulaScene.constants.ts`. Same pattern as `MoonScene.constants.ts`.

### Claude's Discretion

- Exact parallax coefficient per layer within 0.05x–0.8x range
- Z-position of each layer plane (spread z=-2 to z=2, moon at z=0)
- Breathe multiplier peak within 1.2–1.3 range
- Canvas texture generation approach (OffscreenCanvas vs regular canvas)
- Layer 1 gradient: CSS vs PlaneGeometry
- Suspense grouping for NebulaScene vs MoonScene

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NEB-01 | 6-layer parallax nebula stack renders: deep space gradient → stars → far nebula → mid fog → near bokeh → foreground dust | Verified: THREE.Points + BufferGeometry at 0.168.0; renderOrder on Object3D; CanvasTexture constructor |
| NEB-02 | Each layer has a distinct parallax coefficient (0.05x → 0.8x) active during both vertical and horizontal scroll phases | Verified: scroll store `progress` field drives horizontal zone; `scrollY` drives vertical zone; both readable via `getState()` in `useFrame` |
| NEB-03 | Three nebula clusters (~800 particles each) render with AdditiveBlending in purple, teal, coral | Verified: `THREE.AdditiveBlending = 2`; PointsMaterial `blending` property confirmed at 0.168.0 |
| NEB-04 | Nebula breathes at high scroll velocity — layers scale up then settle back as velocity decays | Verified: `displayVelocity` in scroll store is already lerped; `pts.scale.set()` and `pts.position` manipulation confirmed on THREE.Points |
| NEB-05 | Star field parallaxes at 0.05x in vertical zone and continues correctly in horizontal zone | Covered by same NEB-02 implementation — star layer is a separate THREE.Points with 0.05x coefficient |

</phase_requirements>

---

## Summary

Phase 3 adds a 6-layer parallax nebula to the existing R3F Canvas in `MoonSceneClient`. All layers are `THREE.Points` meshes (except the deep space gradient background, which is either a CSS property or a fixed PlaneGeometry), each with a canvas-generated `CanvasTexture` for its sprite shape. Layers render at explicit `renderOrder` values so the moon sits mid-stack: layers 1–4 behind, layers 5–6 in front.

Per-frame parallax reads `scrollY` (vertical zone) and `progress` (horizontal zone, when `phase === "horizontal"`) from the Zustand scroll store via `useScrollStore.getState()` inside `useFrame`. Velocity breathe applies a scale + position multiplier proportional to `displayVelocity`, which is already smoothed at 0.15 lerp factor by the store — no additional smoothing is needed.

The key integration constraint is the single `<Canvas>` in `MoonSceneClient`. `NebulaScene.tsx` must be a sibling R3F component inside that Canvas, not a wrapper or separate Canvas. Canvas texture generation happens once at mount in a utility function using `document.createElement('canvas')` (not `OffscreenCanvas` — avoid: OffscreenCanvas is unavailable in older Safari and requires `.transferToImageBitmap()` which adds complexity; regular canvas elements work at mount time and are not in the render critical path).

**Primary recommendation:** Build `NebulaScene` as a single R3F component that renders 5–6 imperative `<points>` children, each referencing a `useRef<THREE.Points>` for per-frame mutation in `useFrame`. All constants in `NebulaScene.constants.ts`. All texture generation in `src/lib/nebula-textures.ts`.

---

## Project Constraints (from CLAUDE.md)

- **Stack locked:** Next.js 14, R3F 8.x, Three.js 0.168.0, GSAP 3.x, Lenis, Zustand 5 — no substitutions
- **Three.js version pinned at `^0.168.0`** — do not upgrade (R3F 8.x breaks with 0.169+) [VERIFIED: package.json]
- **Single `<Canvas>`** — `MoonSceneClient` owns the only Canvas; NebulaScene renders inside it
- **`next/dynamic` + `ssr: false`** — already applied to MoonScene; NebulaScene inherits this by living inside the same Canvas
- **`depthWrite: false`** on all particle materials — prevents z-fighting
- **`getState()` not `useStore()` inside `useFrame`** — avoids React re-render at 60fps (established in Phase 1/2)
- **Constants files** — all magic numbers in `ComponentName.constants.ts`
- **File size limit:** 800 lines max per file (from CLAUDE.md rules)
- **No mutation:** create new objects; use `ref.current.position.set()` / `ref.current.scale.set()` (imperative Three.js mutation is acceptable inside useFrame — React objects are not mutated)
- **Immutability in TS types/state** — constants file values should be `as const` / `readonly`

---

## Standard Stack

### Core (already installed — no new packages required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `three` | 0.168.0 | THREE.Points, BufferGeometry, CanvasTexture, AdditiveBlending | Pinned — R3F peer dep |
| `@react-three/fiber` | 8.18.0 | `useFrame`, JSX mesh composition | Project standard |
| `@react-three/drei` | 9.122.0 | Optional helpers (`<Points>` component, `useMemo` integration) | Project standard |
| `zustand` | 5.0.13 | Scroll store reads via `getState()` | Established in Phase 1 |

[VERIFIED: package.json in project root]

No new npm packages are needed for Phase 3. All required APIs exist in the installed versions.

### Optional — PostProcessing (not required but available)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@react-three/postprocessing` | not installed | Bloom on nebula particles | Not needed — AdditiveBlending provides natural bloom-like glow without GPU overhead of a postprocessing pass |

**Recommendation:** Do not install `@react-three/postprocessing` for Phase 3. AdditiveBlending on transparent particle layers achieves a sufficient bloom-like quality for particle clouds and costs far less in GPU fill rate. Postprocessing bloom on top of AdditiveBlending layers tends to overexpose on mobile.

### Installation

No new packages. All dependencies present.

---

## Architecture Patterns

### Recommended File Structure

```
src/
├── components/
│   └── canvas/
│       ├── MoonScene.client.tsx        # MODIFY: add <NebulaScene /> inside Canvas
│       ├── MoonScene.tsx               # UNCHANGED
│       ├── MoonScene.constants.ts      # UNCHANGED — do not duplicate MOON_DPR_CAP etc.
│       ├── MoonGlow.tsx                # UNCHANGED
│       ├── NebulaScene.tsx             # NEW: R3F component, renders all nebula layers
│       └── NebulaScene.constants.ts    # NEW: coefficients, counts, colors, breathe range
└── lib/
    └── nebula-textures.ts              # NEW: canvas texture generation utility
```

### Pattern 1: NebulaScene Component Shape

**What:** Single R3F component holding all 6 layers as children. Each particle layer uses a `useRef<THREE.Points>` for per-frame position/scale mutations in one shared `useFrame` callback.

**When to use:** Always for this phase. One `useFrame` per R3F component is the R3F performance recommendation — do not create 6 separate components each with their own `useFrame`.

```typescript
// Source: Established Phase 2 pattern (MoonScene.tsx) + Three.js 0.168.0 API
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollStore } from "@/lib/scroll-store";
import {
  NEBULA_LAYERS,
  NEBULA_BREATHE_MAX,
  NEBULA_BREATHE_VELOCITY_SCALE,
} from "./NebulaScene.constants";
import { createNebulaTextures } from "@/lib/nebula-textures";

export default function NebulaScene(): JSX.Element {
  // One ref per layer (indices match NEBULA_LAYERS array)
  const layerRefs = [
    useRef<THREE.Points>(null),
    useRef<THREE.Points>(null),
    useRef<THREE.Points>(null),
    useRef<THREE.Points>(null),
    useRef<THREE.Points>(null),
  ] as const;

  const textures = useMemo(() => createNebulaTextures(), []);

  // Freeze vertical offset when phase transitions to horizontal
  const frozenVerticalOffset = useRef<number>(0);

  useFrame(() => {
    const { scrollY, displayVelocity, phase, progress } =
      useScrollStore.getState();

    // Breathe multiplier: 1.0 at rest, up to NEBULA_BREATHE_MAX at peak velocity
    const normalizedVelocity = Math.min(
      Math.abs(displayVelocity) * NEBULA_BREATHE_VELOCITY_SCALE,
      1.0
    );
    const breatheMultiplier =
      1.0 + (NEBULA_BREATHE_MAX - 1.0) * normalizedVelocity;

    // Capture vertical offset freeze point when entering horizontal zone
    if (phase !== "horizontal") {
      frozenVerticalOffset.current = scrollY;
    }

    NEBULA_LAYERS.forEach((layer, i) => {
      const ref = layerRefs[i];
      if (!ref.current) return;

      // Vertical parallax — freezes in horizontal zone
      const verticalBase =
        phase === "horizontal"
          ? frozenVerticalOffset.current
          : scrollY;
      const yOffset =
        -verticalBase * layer.parallaxCoefficient * breatheMultiplier;

      // Horizontal parallax — only active in horizontal zone
      const xOffset =
        phase === "horizontal"
          ? -progress * layer.parallaxCoefficient * breatheMultiplier * 10
          : 0;

      ref.current.position.set(xOffset, yOffset, layer.z);
      ref.current.scale.setScalar(breatheMultiplier);
    });
  });

  // JSX: render each layer. Layer index maps to renderOrder.
  // ...
}
```

[VERIFIED: Three.js 0.168.0 API — `pts.position.set()`, `pts.scale.setScalar()`, `useScrollStore.getState()` scroll store shape]

### Pattern 2: Canvas Texture Generation

**What:** Utility function creates one `HTMLCanvasElement` per layer type, draws the sprite shape, and returns a `THREE.CanvasTexture`. Called once in `useMemo`.

**When to use:** This is the locked approach (D-14). Generate at mount; reuse across all particles in that layer.

```typescript
// Source: Three.js 0.168.0 CanvasTexture constructor, MDN Canvas 2D API
// src/lib/nebula-textures.ts

export interface NebulaTextures {
  star: THREE.CanvasTexture;
  nebulaBlob: THREE.CanvasTexture;
  bokeh: THREE.CanvasTexture;
  dustGrain: THREE.CanvasTexture;
}

function makeCircleTexture(size: number, blur: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const center = size / 2;
  const gradient = ctx.createRadialGradient(
    center, center, 0,
    center, center, center
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(blur, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createNebulaTextures(): NebulaTextures {
  return {
    star: makeCircleTexture(16, 0.1),       // Sharp 1px-equivalent disc
    nebulaBlob: makeCircleTexture(32, 0.5), // Soft gaussian blob
    bokeh: makeCircleTexture(64, 0.3),      // Large soft bokeh disc
    dustGrain: makeCircleTexture(8, 0.2),   // Tiny grain
  };
}
```

[VERIFIED: `THREE.CanvasTexture` confirmed as `class CanvasTexture extends Texture` in Three.js 0.168.0; `document.createElement('canvas')` works at component mount time (client-only via `next/dynamic ssr:false`)]

**OffscreenCanvas decision:** Do NOT use `OffscreenCanvas`. Regular `document.createElement('canvas')` is simpler, universally supported in the browser contexts where this runs (client-only component), and requires no additional setup. OffscreenCanvas would add complexity for zero benefit here. [ASSUMED — but this is low-risk conventional wisdom; OffscreenCanvas gains only matter for worker threads]

### Pattern 3: Particle Buffer Geometry Construction

**What:** Each layer's particle positions are generated once at mount using `useMemo`, packed into a `Float32Array`, and set as a `BufferAttribute` named `"position"`.

```typescript
// Source: Three.js 0.168.0 BufferGeometry/BufferAttribute API [VERIFIED]
const geometry = useMemo(() => {
  const count = LAYER_PARTICLE_COUNT;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Distribute across a wide plane at the layer's Z depth
    positions[i * 3]     = (Math.random() - 0.5) * NEBULA_SPREAD_X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * NEBULA_SPREAD_Y;
    positions[i * 3 + 2] = 0; // Z handled by group position, not individual particles
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}, []);
```

### Pattern 4: PointsMaterial Configuration

**What:** Each layer uses `THREE.PointsMaterial` with `depthWrite: false`, `transparent: true`, and `AdditiveBlending`. The sprite texture is assigned to `map`.

```typescript
// Source: Three.js 0.168.0 PointsMaterial API [VERIFIED]
// MoonGlow.tsx establishes depthWrite:false + AdditiveBlending pattern [VERIFIED in codebase]
const material = useMemo(() => new THREE.PointsMaterial({
  map: textures.nebulaBlob,
  color: new THREE.Color(CLUSTER_COLOR),
  size: PARTICLE_SIZE,
  sizeAttenuation: true,       // Perspective-correct sizing
  transparent: true,
  depthWrite: false,            // Required — prevents z-fighting (D-02)
  blending: THREE.AdditiveBlending,
  opacity: LAYER_OPACITY,
}), [textures.nebulaBlob]);
```

### Pattern 5: renderOrder Assignment

**What:** All nebula layers and the moon use explicit `renderOrder` values. R3F exposes `renderOrder` as a JSX prop on all mesh/points objects.

```tsx
// Source: Three.js Object3D.renderOrder API [VERIFIED: 'renderOrder' in new THREE.Points() === true]
<points
  ref={layerRef}
  geometry={geometry}
  material={material}
  renderOrder={2}         // Layer 3 (far nebula)
/>
// Moon sits at renderOrder={4} — set in MoonScene.tsx
// Layers 5–6 at renderOrder={5} and renderOrder={6}
```

**Critical:** `renderOrder` on transparent objects works correctly when `depthWrite: false` is set on all transparent materials. Without it, the depth buffer prevents particles from stacking correctly. [VERIFIED: established pattern in MoonGlow.tsx which uses `depthWrite={false}`]

### Pattern 6: MoonSceneClient Integration

**What:** `NebulaScene.tsx` is imported with `next/dynamic ssr:false` (or can be a regular import if it contains no server-unsafe top-level code — since it lives inside the Canvas which is already wrapped in `dynamic`, either approach works). Added to `MoonSceneClient` inside the existing `<Canvas>`.

```tsx
// Source: Established Phase 2 pattern (MoonScene.client.tsx) [VERIFIED in codebase]
// MoonSceneClient.tsx — MODIFIED version

// JSX ordering: layers 1–4 before MoonScene, layers 5–6 after
// renderOrder handles final draw order; JSX order provides a safe fallback
<Canvas dpr={[...MOON_DPR_CAP]} gl={{ alpha: false }} camera={{ fov: 50, position: [0, 0, 6] }}>
  <Suspense fallback={null}>
    <NebulaScene />    {/* contains layers 1–4 behind moon AND layers 5–6 in front */}
    <MoonScene onReady={handleReady} />
  </Suspense>
</Canvas>
```

Since `NebulaScene` renders both behind and in front of moon, it can be a single sibling. `renderOrder` controls depth, not JSX position. This is simpler than splitting `NebulaScene` into two separate components.

**Note:** The existing `<Canvas gl={{ alpha: false }}>` in `MoonSceneClient` sets `alpha: false` which means the canvas background is opaque. Layer 1 (deep space gradient) must cover the full canvas to establish the background. If implemented as CSS, the canvas background must be transparent — changing `gl={{ alpha: true }}` and removing `<color attach="background" />` from `MoonScene.tsx`. If implemented as a `PlaneGeometry`, `alpha: false` can remain. This is Claude's discretion (D-10). [VERIFIED: MoonScene.tsx has `<color attach="background" args={["#0a0a1a"]} />` — the background is currently set on the R3F scene, not as a CSS background]

### Anti-Patterns to Avoid

- **One `useFrame` per layer component:** Creates 6 render loops. Use one `useFrame` in `NebulaScene` that iterates all layer refs.
- **`useScrollStore(selector)` inside `useFrame`:** Selector subscriptions trigger React re-renders. Use `useScrollStore.getState()` inside `useFrame` — same pattern as MoonScene.
- **Animating individual particle positions each frame:** Do not modify `BufferAttribute` data per-frame. Translate the entire `THREE.Points` group via `ref.current.position.set()` and `ref.current.scale.setScalar()`. BufferAttribute modification requires `needsUpdate = true` and re-uploads geometry to GPU each frame — expensive and unnecessary for parallax.
- **Multiple `THREE.CanvasTexture` instances per particle:** Create one texture per layer type, share across all particles in that layer.
- **`depthWrite: true` on particle materials:** Causes z-fighting between overlapping transparent layers. All nebula materials must use `depthWrite: false`.
- **Loading textures from `/public`:** D-14 specifies runtime generation. Do not create static PNG sprite files.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth velocity signal | Custom lerp on raw scroll velocity | `displayVelocity` from scroll store | Already lerped at factor 0.15 in LenisProvider; adding another lerp causes lag and visual mushiness |
| Particle sprite textures | PNG files in `/public` | Canvas 2D API → THREE.CanvasTexture | D-14 specifies runtime generation; avoids network round-trip and keeps sprites at any resolution |
| Per-particle animation | Updating `positions` BufferAttribute each frame | Group-level `position.set()` + `scale.setScalar()` | BufferAttribute updates re-upload geometry to GPU every frame — O(n) cost. Group transform is a single matrix multiply |
| Bloom effect | `@react-three/postprocessing` Bloom pass | `THREE.AdditiveBlending` on transparent particles | Postprocessing adds a full-screen render pass + framebuffer blit; AdditiveBlending achieves comparable glow at zero extra draw calls |

**Key insight:** The parallax effect in this phase is entirely a camera/group transform problem — no individual particle movement is needed. Translating the parent `THREE.Points` object is sufficient for all 6 layers.

---

## Common Pitfalls

### Pitfall 1: Breathing Causes Layout Drift at Phase Transition

**What goes wrong:** When `phase` transitions from `"transition"` to `"horizontal"`, `scrollY` may still be changing. If the frozen vertical offset isn't captured at the exact right moment, the nebula jumps.

**Why it happens:** The freeze must capture `scrollY` on the last vertical frame, not on the first horizontal frame.

**How to avoid:** Capture `frozenVerticalOffset.current = scrollY` on every frame where `phase !== "horizontal"`, including the transition phase. When `phase === "horizontal"`, stop updating the frozen value. This means the freeze happens naturally as the last written value before the phase switch.

**Warning signs:** Nebula snap-jumps when horizontal scroll begins.

### Pitfall 2: CanvasTexture Created Before Canvas Element Mounts

**What goes wrong:** `createNebulaTextures()` calls `document.createElement('canvas')`. If called during SSR or before the component mounts, it throws `ReferenceError: document is not defined`.

**Why it happens:** The texture utility is called in `useMemo` inside `NebulaScene`, which is inside a `dynamic(..., { ssr: false })` wrapped Canvas. However, if the utility is imported at module level and called at module initialization, SSR will execute it.

**How to avoid:** Call `createNebulaTextures()` only inside component lifecycle (`useMemo`, `useEffect`). Never at module scope. The `next/dynamic ssr:false` guarantee covers component body execution, not module-level side effects.

**Warning signs:** `ReferenceError: document is not defined` during `next build`.

### Pitfall 3: GPU Memory Leak from Undisposed Textures and Geometries

**What goes wrong:** `THREE.CanvasTexture`, `THREE.BufferGeometry`, and `THREE.PointsMaterial` created imperatively in `useMemo` are not automatically disposed on component unmount.

**Why it happens:** React garbage collection does not invoke Three.js `dispose()`. GPU resources accumulate.

**How to avoid:** Return cleanup from `useEffect` that calls `.dispose()` on each texture, geometry, and material. For textures created in `useMemo`, add a companion `useEffect` with the textures as dependencies that disposes on cleanup.

```typescript
useEffect(() => {
  return () => {
    textures.star.dispose();
    textures.nebulaBlob.dispose();
    textures.bokeh.dispose();
    textures.dustGrain.dispose();
  };
}, [textures]);
```

[VERIFIED: Established concern from PITFALLS.md Pitfall 4 in project research]

**Warning signs:** GPU memory in Chrome DevTools Task Manager climbs during hot-reload cycles.

### Pitfall 4: Horizontal Parallax Scale Mismatch

**What goes wrong:** `progress` from the scroll store is 0–1 within the horizontal phase zone. Multiplying by `parallaxCoefficient` alone gives a very small offset (e.g., `1.0 * 0.8 = 0.8` Three.js units). The horizontal nebula drift is invisible.

**Why it happens:** The vertical parallax multiplies against `scrollY` in pixels (potentially hundreds), while horizontal uses normalized `progress` 0–1.

**How to avoid:** Scale the horizontal parallax by a constant that maps the 0–1 progress to a meaningful world-space offset. A multiplier of 8–15 Three.js units gives visible horizontal separation across layers. This constant belongs in `NebulaScene.constants.ts`.

```typescript
// Horizontal offset in world units for full progress travel
export const NEBULA_H_PARALLAX_RANGE = 12; // tune during execution
// Usage: xOffset = -progress * layer.parallaxCoefficient * NEBULA_H_PARALLAX_RANGE
```

### Pitfall 5: Overdraw Budget on Mobile

**What goes wrong:** 6 AdditiveBlending transparent layers with ~800 particles each = significant overdraw. On mobile with DPR=1.5 and a 375px display, every transparent pixel is evaluated multiple times. GPU fill rate exceeded → frame drops below 30fps.

**Why it happens:** AdditiveBlending disables early-z rejection. All fragments, including those behind opaque geometry, are shaded.

**How to avoid:**
- The DPR cap `[1, 1.5]` (already set in `MOON_DPR_CAP`) limits fill rate. [VERIFIED: MoonScene.constants.ts, though note current constant has `[1, 2]` — a known bug flagged by existing test]
- Phase 3 should document particle count reduction for mobile as a constant: `NEBULA_PARTICLE_COUNT_MOBILE = 200` (from 800).
- `prefers-reduced-motion`: static gradient fallback (Phase 4 will implement the media query; Phase 3 should not animate if the hook indicates reduced motion).

**Warning signs:** Mobile frame rate drops during scroll on Moto G emulation in DevTools.

### Pitfall 6: `<color attach="background">` Conflicts with Layer 1 Gradient

**What goes wrong:** `MoonScene.tsx` currently has `<color attach="background" args={["#0a0a1a"]} />` which sets the R3F scene background color on the Three.js scene object. If Layer 1 is a `PlaneGeometry` gradient, this color flashes before the plane geometry loads. If Layer 1 is CSS, the Canvas needs `gl={{ alpha: true }}` — but `MoonScene.client.tsx` currently has `gl={{ alpha: false }}`.

**How to avoid:** If implementing Layer 1 as CSS gradient on the wrapper div:
1. Change `gl={{ alpha: false }}` to `gl={{ alpha: true }}` in `MoonSceneClient`
2. Remove `<color attach="background" />` from `MoonScene.tsx`
3. Set the gradient CSS on the `aria-hidden` wrapper div in `MoonSceneClient`

If implementing Layer 1 as R3F `PlaneGeometry`, keep `alpha: false` and replace the `<color>` with a proper gradient `ShaderMaterial` or `MeshBasicMaterial` with a gradient texture.

**Recommendation:** CSS approach is simpler and eliminates one R3F object. The wrapper div already covers the full viewport with `position: fixed; inset: 0`. [VERIFIED: MoonScene.client.tsx wrapper div is fixed inset-0]

---

## Code Examples

### Verified Patterns from Codebase

#### getState() inside useFrame (Phase 1/2 established pattern)

```typescript
// Source: LenisProvider.tsx + MoonScene.tsx established pattern [VERIFIED in codebase]
useFrame(() => {
  const { scrollY, displayVelocity, phase, progress } =
    useScrollStore.getState();
  // ... use values directly, no React subscription
});
```

#### PointsMaterial with depthWrite:false + AdditiveBlending (MoonGlow.tsx pattern)

```typescript
// Source: MoonGlow.tsx in codebase [VERIFIED]
<meshBasicMaterial
  color={GLOW_COLOR}
  transparent
  opacity={GLOW_OPACITY}
  blending={THREE.AdditiveBlending}
  side={THREE.BackSide}
  depthWrite={false}
/>
// Same depthWrite:false + AdditiveBlending principles apply to PointsMaterial
```

#### Constants file pattern (MoonScene.constants.ts)

```typescript
// Source: MoonScene.constants.ts [VERIFIED in codebase]
// NebulaScene.constants.ts should follow this exact structure:
export const NEBULA_LAYERS = [
  { name: "stars",    coefficient: 0.05, z: -2.0, renderOrder: 1 },
  { name: "farNebula", coefficient: 0.15, z: -1.5, renderOrder: 2 },
  { name: "midFog",   coefficient: 0.3,  z: -1.0, renderOrder: 3 },
  { name: "nearBokeh", coefficient: 0.6, z:  0.5, renderOrder: 5 },
  { name: "fgDust",   coefficient: 0.8,  z:  1.0, renderOrder: 6 },
] as const;
// Layer 1 (deep space gradient) handled separately as CSS or PlaneGeometry
```

#### Disposing imperative Three.js resources (established concern from project PITFALLS.md)

```typescript
// Source: PITFALLS.md Pitfall 4 — established disposal pattern [CITED: .planning/research/PITFALLS.md]
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, [geometry, material, texture]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useStore(selector)` in useFrame | `useScrollStore.getState()` in useFrame | Established Phase 1 | Avoids React re-render at 60fps |
| PNG sprite files in `/public` | Runtime `CanvasTexture` generation | D-14 | No network round-trip, no asset pipeline step |
| Per-particle position animation | Group-level transform (`position.set`, `scale.setScalar`) | Best practice | O(1) vs O(n) GPU cost |
| `THREE.ShaderMaterial` for blobs | `THREE.PointsMaterial` + `CanvasTexture` | Simpler approach | Same visual quality, no custom GLSL required |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `OffscreenCanvas` should not be used in favor of regular `document.createElement('canvas')` | Standard Stack / Pattern 2 | Low risk — both APIs produce equivalent CanvasTexture inputs. OffscreenCanvas would still work in the browser context; this is a simplicity preference. |
| A2 | Horizontal parallax travel of 8–15 Three.js units provides visible layer separation | Pattern 4 / Common Pitfalls | Medium risk — actual camera fov=50, camera z=6 means viewport spans roughly ±5 units at z=0. A range of 8–15 may be too large; tune during execution |
| A3 | `useFrame` with multiple `ref.current.position.set()` calls for 5 layers runs at 60fps without issue | Architecture Patterns | Low risk — 5 matrix operations per frame is negligible compared to the GPU cost of rendering the particles themselves |
| A4 | `THREE.PointsMaterial` with `sizeAttenuation: true` provides correct perspective scaling for nebula depth illusion | Code Examples | Low risk — `sizeAttenuation` is the standard approach for particles that should appear smaller with distance |

---

## Open Questions

1. **DPR constant drift bug**
   - What we know: `MoonScene.constants.ts` exports `MOON_DPR_CAP = [1, 2]` but the existing test asserts `[1, 1.5]`. Three tests are currently failing.
   - What's unclear: Whether the constant was intentionally changed to `[1, 2]` or drifted accidentally
   - Recommendation: Wave 0 of Phase 3 should resolve this by fixing the constant to `[1, 1.5]` (per QUAL-04 requirement) or updating the test — the planner should include this as an explicit task

2. **Layer 1 gradient strategy**
   - What we know: D-10 gives Claude discretion. Current `<Canvas gl={{ alpha: false }}>` and `<color attach="background">` in MoonScene mean a CSS approach requires changing two existing files.
   - What's unclear: Which approach is preferred for long-term maintainability
   - Recommendation: CSS gradient on the wrapper div (simpler, no R3F object, trivially updatable). Requires changing `alpha: false → true` in MoonSceneClient and removing `<color>` from MoonScene.

3. **Horizontal parallax `progress` mapping**
   - What we know: `progress` is 0–1 within the horizontal zone. The scroll store has no `horizontalProgress` field specifically — it is `progress` when `phase === "horizontal"`.
   - What's unclear: CONTEXT.md uses the term `horizontalProgress` — this is an alias for `progress` when `phase === "horizontal"`, not a separate field.
   - Recommendation: Document this clearly in constants and inline comments. Use `const isHorizontal = phase === "horizontal"` guard before applying x-axis parallax.

---

## Environment Availability

This phase is code-only — no external CLI tools, databases, or services required. All dependencies are installed npm packages.

Step 2.6: SKIPPED (no external dependencies beyond installed npm packages)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 1.x with jsdom |
| Config file | `vitest.config.ts` (exists) |
| Setup file | `vitest.setup.ts` (exists, includes matchMedia + IntersectionObserver mocks) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

[VERIFIED: vitest.config.ts and vitest.setup.ts read from filesystem]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NEB-01 | 6-layer constants exported with correct renderOrder values | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ Wave 0 |
| NEB-01 | NebulaScene exports a default React function component | unit (module shape) | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ Wave 0 |
| NEB-02 | NEBULA_LAYERS array has 5 entries with distinct coefficients | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ Wave 0 |
| NEB-02 | Coefficients are monotonically increasing (0.05 < 0.15 < 0.3 < 0.6 < 0.8) | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ Wave 0 |
| NEB-03 | NEBULA_CLUSTER_COLORS contains exactly 3 colors matching requirements | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ Wave 0 |
| NEB-03 | Cluster colors are `#7b4fa6`, `#2ec4b6`, `#ff6b6b` | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ Wave 0 |
| NEB-04 | `NEBULA_BREATHE_MAX` is within [1.2, 1.3] range | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ Wave 0 |
| NEB-05 | Star layer (layer index 0) has coefficient exactly 0.05 | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ Wave 0 |
| NEB-01 | `nebula-textures.ts` exports `createNebulaTextures` function | unit (module shape) | `npx vitest run src/lib/__tests__/nebula-textures.test.ts` | ❌ Wave 0 |
| QUAL-04 | `MOON_DPR_CAP` is `[1, 1.5]` (fix existing failing test) | unit (regression) | `npx vitest run src/components/canvas/__tests__/MoonScene.test.tsx` | ✅ (failing) |

**Note on WebGL tests:** jsdom has no WebGL context. Tests for `NebulaScene.tsx` must be module-shape tests (verify exports, prop types, constants) rather than render tests. Visual correctness is verified manually via browser inspection per the success criteria checklist. This is the same pattern established by `MoonScene.test.tsx`. [VERIFIED: existing test file uses module shape tests, not rendering tests]

### Sampling Rate

- **Per task commit:** `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx src/lib/__tests__/nebula-textures.test.ts`
- **Per wave merge:** `npx vitest run --reporter=verbose` (full suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/components/canvas/__tests__/NebulaScene.test.tsx` — covers NEB-01, NEB-02, NEB-03, NEB-04, NEB-05 via constants assertions and module shape tests
- [ ] `src/lib/__tests__/nebula-textures.test.ts` — covers NEB-01 (texture utility module shape)
- [ ] Fix `MOON_DPR_CAP` constant drift: `MoonScene.constants.ts` exports `[1, 2]` but QUAL-04 requires `[1, 1.5]` — 3 tests currently failing

---

## Security Domain

This phase has no authentication, user input, external API calls, or cryptographic operations. The OWASP ASVS categories do not apply.

Security note: Canvas 2D API (`getContext('2d')`) is a read/write API on a locally-created canvas element with no user input. No XSS vector exists. `THREE.CanvasTexture` reads pixel data from the canvas — no external URLs involved.

---

## Sources

### Primary (HIGH confidence)
- Three.js 0.168.0 source — `THREE.Points`, `THREE.BufferGeometry`, `THREE.BufferAttribute`, `THREE.PointsMaterial`, `THREE.CanvasTexture`, `THREE.AdditiveBlending`, `Object3D.renderOrder` [VERIFIED via Node.js runtime inspection of installed package]
- `src/lib/scroll-store.ts` — exact field names: `scrollY`, `velocity`, `displayVelocity`, `phase`, `progress` [VERIFIED]
- `src/components/canvas/MoonScene.client.tsx` — Canvas architecture, `gl={{ alpha: false }}`, existing `<Canvas>` structure [VERIFIED]
- `src/components/canvas/MoonScene.tsx` — `<color attach="background">`, existing R3F patterns [VERIFIED]
- `src/components/canvas/MoonGlow.tsx` — `depthWrite: false` + `AdditiveBlending` pattern [VERIFIED]
- `src/components/canvas/MoonScene.constants.ts` — constants file structure and naming convention [VERIFIED]
- `vitest.config.ts` + `vitest.setup.ts` — test infrastructure [VERIFIED]
- `package.json` — all installed versions confirmed [VERIFIED]

### Secondary (MEDIUM confidence)
- `.planning/research/PITFALLS.md` — memory leak patterns, mobile GPU concerns [CITED]
- `.planning/research/ARCHITECTURE.md` — file structure conventions, single Canvas rationale [CITED]
- `.planning/phases/03-nebula-system/03-CONTEXT.md` — all locked decisions D-01 through D-18 [CITED]

### Tertiary (LOW confidence)
- OffscreenCanvas browser compatibility claim — based on general knowledge [ASSUMED — verify at low risk since we are not using it]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via package.json and Node.js runtime
- Architecture: HIGH — existing codebase patterns verified directly
- Pitfalls: HIGH — items 1–4 derived directly from verified code; item 5 from project PITFALLS.md
- Validation: HIGH — test infrastructure verified, test patterns from existing MoonScene.test.tsx

**Research date:** 2026-05-07
**Valid until:** 2026-06-07 (stable libraries, no moving parts)
