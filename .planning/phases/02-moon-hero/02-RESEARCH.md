# Phase 2: Moon Hero — Research

**Researched:** 2026-05-06
**Domain:** React Three Fiber photorealistic sphere, NASA displacement/normal maps, GSAP Z-axis entrance animation, canvas mount in Next.js App Router
**Confidence:** HIGH — all packages installed and verified against node_modules source

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Single global `<Canvas>` in `app/layout.tsx`. Position: `fixed`, `inset: 0`, `z-index: 0`, `pointer-events: none`. HTML content at `z-index: 1` in a sibling div. Never remounted.
- **D-02:** Canvas wrapper div starts at `opacity: 0`. Transition to `opacity: 1` (~0.5s CSS fade) once Three.js is ready and Suspense resolves. No spinner, no fallback sphere.
- **D-03:** DPR cap: `dpr={[1, 1.5]}`. Do NOT use `[1, 2]` from architecture doc — QUAL-04 is authoritative.
- **D-04:** Moon sits right-of-center, vertically centered. X-axis offset in 3D space (e.g., `position={[2.0, 0, 0]}`). Camera stays centered.
- **D-05:** Moon diameter ~50% of viewport height at final resting position.
- **D-06:** Phase 4 text (name + subtitle) anchors bottom-left — Phase 4 planner should account for this.
- **D-07:** 4096×2048 PNG for all three maps: color/albedo, displacement, normal. Served from `/public/textures/moon/`.
- **D-08:** Mobile does NOT load R3F — CSS-only moon at 375px (QUAL-02, Phase 8 scope).
- **D-09:** Load via `useTexture` with `<Suspense>` boundary. Canvas opacity triggers on Suspense resolution, not a timer.
- **D-10:** Filenames: `moon-color.png`, `moon-displacement.png`, `moon-normal.png`. Source: NASA SVS. Must be present in `/public/textures/moon/` before Phase 2 execution.
- **D-11:** Z fly-in: moon starts at `z = -15`, lerps to `z = 0` over ~2.5s on mount. Real 3D perspective foreshortening — NOT scale lerp.
- **D-12:** Canvas fade-in and Z fly-in start simultaneously once textures resolve.
- **D-13:** Lerp curve: ease-out. Use `gsap.to` on mesh ref `position.z` inside `useEffect`, OR `useFrame` + lerp — Claude's discretion.
- **D-14:** `THREE.SphereGeometry` — 64×64 or 128×128 segments.
- **D-15:** `MeshStandardMaterial` with `map`, `displacementMap`, `normalMap`. `displacementScale` is Claude's discretion.
- **D-16:** Single `PointLight` for sun simulation. Position + intensity are Claude's discretion (aim for 30–40% shadow).
- **D-17:** Atmospheric glow: second mesh ~5% larger, `MeshBasicMaterial`, `AdditiveBlending`, opacity ~0.15–0.25, `transparent: true`. No texture.
- **D-18:** Self-rotation: ~0.0005 rad/frame on Y axis in `useFrame`.
- **D-19:** Moon does NOT respond to scroll in Phase 2. Scroll reactivity is Phase 3.
- **D-20:** File locations:
  - `src/components/canvas/MoonScene.tsx` — R3F scene content
  - `src/components/canvas/MoonScene.client.tsx` — `next/dynamic` wrapper with `ssr: false`
  - Canvas mount in `app/layout.tsx`

### Claude's Discretion

- Exact moon X offset (right-of-center read, adjusted to camera FOV)
- SphereGeometry segment count (64 or 128 — quality vs. GPU cost)
- `displacementScale` value (visible craters, not jagged)
- PointLight position and intensity (convincing shadow hemisphere)
- Glow mesh opacity (subtle halo, not bloomed)
- Entrance lerp implementation (GSAP vs. `useFrame` — whichever integrates more cleanly)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-01 | Moon renders with NASA displacement + normal maps showing photorealistic craters | `MeshStandardMaterial.displacementMap` + `normalMap` verified in Three.js 0.168.0 node_modules |
| HERO-02 | Moon shows realistic lit/dark hemisphere from simulated PointLight sun | `PointLight` class confirmed in Three.js 0.168.0; positioning pattern documented |
| HERO-03 | Atmospheric glow rim as second slightly-larger sphere with AdditiveBlending | `AdditiveBlending = 2` constant confirmed in Three.js; `MeshBasicMaterial` supports it |
| HERO-04 | On load, moon starts small/distant and lerps toward camera over ~2.5s | GSAP 3.15.0 `gsap.to` animates any JS object property; `useGSAP` from `@gsap/react` 2.1.2 handles StrictMode cleanup |
| HERO-05 | Moon self-rotates subtly on Y axis (~0.0005/frame) | `useFrame` confirmed in R3F 8.18.0; pattern from architecture doc |
| QUAL-04 | Canvas DPR capped at `[1, 1.5]` | `Dpr = number | [min: number, max: number]` confirmed in R3F types; `[1, 1.5]` is valid |

</phase_requirements>

---

## Summary

Phase 2 mounts the global R3F `<Canvas>` in `app/layout.tsx` and builds the photorealistic moon mesh that serves as the permanent visual anchor for the entire portfolio. The three core deliverables are: (1) the canvas mount with opacity-fade reveal, (2) the moon mesh with NASA texture maps and atmospheric glow, and (3) the entrance animation (Z fly-in over 2.5s).

All packages required for this phase are already installed and verified against node_modules. Three.js 0.168.0 has `displacementMap`, `normalMap`, `displacementScale`, and `AdditiveBlending` built into `MeshStandardMaterial` and constants respectively. Drei 9.122.0 exports `useTexture` (with `preload` and `clear` static methods) and a `Sphere` forwardRef component. R3F 8.18.0 confirms `dpr` accepts `[min, max]` tuple and `useFrame` is a first-class export. GSAP 3.15.0 with `@gsap/react` 2.1.2's `useGSAP` is already in use in `HorizontalTrack.tsx` — the Phase 2 entrance animation should follow the same pattern for StrictMode safety.

The single blocking prerequisite is the NASA texture files. The `/public/` directory does not exist yet and there are no texture files present. These 4096×2048 PNG files (~10–14MB total) must be downloaded from NASA SVS and placed at `/public/textures/moon/` before any implementation task can complete.

**Primary recommendation:** Wave 0 task 0 — create `/public/textures/moon/` and place the three PNG files before any code is written.

---

## Standard Stack

### Core (all already installed)

| Library | Installed Version | Purpose | Why Standard |
|---------|------------------|---------|--------------|
| `@react-three/fiber` | 8.18.0 | React renderer for Three.js | Declarative 3D in React; one global Canvas pattern |
| `@react-three/drei` | 9.122.0 | Helper components/hooks for R3F | `useTexture`, `Sphere`, reduces boilerplate |
| `three` | 0.168.0 | 3D engine (pinned) | Pinned — R3F 8.x breaks with 0.169+ |
| `gsap` | 3.15.0 | Entrance animation tween | Already in use; `gsap.to` animates JS object props |
| `@gsap/react` | 2.1.2 | `useGSAP` for StrictMode-safe context | Already in use in HorizontalTrack |
| `next` | 14.2.35 | App Router + `next/dynamic` | `ssr: false` required for WebGL |

[VERIFIED: node_modules — all versions inspected from installed packages]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useGSAP` for entrance | `useFrame` lerp | `useFrame` lerp is simpler but less precise for timed animations; GSAP gives deterministic 2.5s with ease curve control. Either is valid per D-13. |
| `MeshStandardMaterial` | `MeshPhysicalMaterial` | Physical adds clearcoat/transmission — overkill for a moon. Standard gives PBR lighting at lower GPU cost. |
| Drei `<Sphere>` component | Raw `<mesh>` + `<sphereGeometry>` | Drei Sphere is a thin forwardRef wrapper around mesh+geometry; raw mesh is fine, Sphere just saves lines. |

**No new packages need to be installed for this phase.**

---

## Architecture Patterns

### Recommended Component Structure

```
src/
├── app/
│   └── layout.tsx               # Add canvas wrapper + MoonScene.client import
├── components/
│   └── canvas/
│       ├── MoonScene.tsx         # R3F scene content — no DOM APIs
│       └── MoonScene.client.tsx  # next/dynamic wrapper, ssr: false
public/
└── textures/
    └── moon/
        ├── moon-color.png        # 4096x2048 NASA color/albedo map
        ├── moon-displacement.png # 4096x2048 NASA displacement/height map
        └── moon-normal.png       # 4096x2048 NASA normal map
```

### Pattern 1: Canvas Mount in layout.tsx

**What:** Add a `MoonSceneClient` component alongside the existing `{children}` div. The canvas wrapper div lives inside `MoonScene.client.tsx` as a Client Component island — `layout.tsx` stays a Server Component so `export const metadata` continues to work.

**Constraint:** `layout.tsx` currently has no `'use client'` directive and exports metadata. It must remain a Server Component. The canvas wrapper goes inside the `next/dynamic` wrapper.

```tsx
// src/app/layout.tsx — keep as Server Component (no 'use client')
// Source: existing layout.tsx structure + D-01, D-20 from CONTEXT.md
import MoonSceneClient from '@/components/canvas/MoonScene.client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <MoonSceneClient />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
          <ScrollDebugHUD />
        </LenisProvider>
      </body>
    </html>
  )
}
```

### Pattern 2: MoonScene.client.tsx — Dynamic Wrapper + Canvas

**What:** `MoonScene.client.tsx` is a `'use client'` component that owns the fixed-position wrapper div and the `<Canvas>`. It dynamically imports `MoonScene.tsx` with `ssr: false`.

```tsx
// src/components/canvas/MoonScene.client.tsx
// Source: next/dynamic API verified; D-01, D-02, D-03, D-20 from CONTEXT.md
'use client'
import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'

const MoonScene = dynamic(() => import('./MoonScene'), { ssr: false })

export default function MoonSceneClient(): JSX.Element {
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        camera={{ fov: 50, position: [0, 0, 6] }}
      >
        <Suspense fallback={null}>
          <MoonScene onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  )
}
```

### Pattern 3: Canvas Opacity Fade on Texture Load

**What:** `useTexture` accepts an optional `onLoad` callback as its second argument. This fires inside the R3F render loop after GPU upload — the correct moment. The callback propagates up via a prop from `MoonScene` to `MoonSceneClient`.

```tsx
// Source: Drei Texture.d.ts — useTexture signature verified
// useTexture<Url>(input: Url, onLoad?: (texture) => void): MappedTextureType<Url>
const textures = useTexture(
  {
    map: '/textures/moon/moon-color.png',
    displacementMap: '/textures/moon/moon-displacement.png',
    normalMap: '/textures/moon/moon-normal.png',
  },
  () => onReady()  // fires after GPU texture upload
)
// textures.map, textures.displacementMap, textures.normalMap are THREE.Texture instances
```

### Pattern 4: Moon Mesh with Displacement + Normal Maps

**What:** A `<mesh>` with `SphereGeometry`, `MeshStandardMaterial` loaded with three texture maps. Segment count 128×128 recommended for 4096px displacement fidelity.

```tsx
// Source: Three.js 0.168.0 MeshStandardMaterial.js — displacementMap/normalMap/displacementScale verified
// Source: Three.js 0.168.0 SphereGeometry.js — constructor args: (radius, widthSeg, heightSeg)
<mesh ref={meshRef} position={[2.0, 0, -15]}>
  <sphereGeometry args={[1.5, 128, 128]} />
  <meshStandardMaterial
    map={textures.map}
    displacementMap={textures.displacementMap}
    displacementScale={0.08}
    normalMap={textures.normalMap}
  />
</mesh>
```

**Segment count rationale:** SphereGeometry defaults to 32×16 (verified from source). Displacement mapping moves vertices — too few vertices produces polygon faceting. For a 4096px displacement map, 128×128 vertices gives adequate sampling without excessive geometry cost in a single-sphere scene.

[VERIFIED: Three.js 0.168.0 node_modules/three/src/materials/MeshStandardMaterial.js lines 38–43]
[VERIFIED: Three.js 0.168.0 node_modules/three/src/geometries/SphereGeometry.js line 7 — default args]

### Pattern 5: Atmospheric Glow Mesh

**What:** Second `<mesh>` at same resting position, ~5% larger radius, `MeshBasicMaterial` with `AdditiveBlending`, `transparent: true`, `depthWrite={false}`.

```tsx
// Source: Three.js 0.168.0 constants.js — AdditiveBlending = 2 verified
<mesh position={[2.0, 0, 0]}>
  <sphereGeometry args={[1.575, 32, 32]} />
  <meshBasicMaterial
    color="#a0c8ff"
    transparent
    opacity={0.18}
    blending={THREE.AdditiveBlending}
    side={THREE.BackSide}
    depthWrite={false}
  />
</mesh>
```

**`side={THREE.BackSide}`:** Renders only the inward-facing faces — the glow appears from outside the sphere. `depthWrite={false}` prevents the transparent mesh from occluding the depth buffer for objects behind it.

[VERIFIED: AdditiveBlending = 2 in node_modules/three/src/constants.js]
[ASSUMED: BackSide + depthWrite=false as glow technique — standard Three.js pattern, training knowledge]

### Pattern 6: Z Fly-In Entrance with useGSAP

**What:** On mount (after textures resolve), use `useGSAP` to tween `meshRef.current.position.z` from -15 to 0 over 2.5s with `power3.out`. This matches the existing pattern from `HorizontalTrack.tsx`.

```tsx
// Source: @gsap/react 2.1.2 types/index.d.ts — useGSAP signature verified
// Source: HorizontalTrack.tsx — existing usage pattern in codebase
import { useGSAP } from '@gsap/react'
import gsap from '@/lib/gsap'

useGSAP(
  () => {
    if (!meshRef.current || !texturesLoaded) return
    gsap.to(meshRef.current.position, {
      z: 0,
      duration: 2.5,
      ease: 'power3.out',
    })
  },
  { dependencies: [texturesLoaded] }
)
```

**Why `useGSAP` over raw `useEffect`:** Matches existing codebase pattern. `useGSAP` wraps `gsap.context()` internally — auto-reverts all tweens on React StrictMode's second invocation and on unmount. Raw `useEffect` requires manual `tween.kill()` cleanup.

[VERIFIED: useGSAP from @gsap/react types/index.d.ts; gsap.to from node_modules/gsap/types/gsap-core.d.ts]

### Pattern 7: useFrame Self-Rotation

```tsx
// Source: R3F core/hooks.d.ts — useFrame(callback: RenderCallback): null
// Source: D-18 from CONTEXT.md
useFrame(() => {
  if (meshRef.current) {
    meshRef.current.rotation.y += 0.0005
  }
})
```

### Pattern 8: PointLight for Sun Simulation

```tsx
// Source: Three.js 0.168.0 lights/PointLight.js — class confirmed
// Position values are Claude's discretion (D-16) — tune visually
<pointLight
  position={[-10, 5, 8]}
  intensity={3.0}
  color="#fff8e8"
/>
<ambientLight intensity={0.05} />
```

**Recommendation:** `position={[-10, 5, 8]}` places the light upper-left from the camera's perspective. With moon at `[2.0, 0, 0]`, the left hemisphere is lit and the right is in shadow — approximately 35% shadow. `ambientLight` at 0.05 prevents fully black shadow side (pure black looks artificial).

[VERIFIED: PointLight class in Three.js 0.168.0]
[ASSUMED: Specific position/intensity — visual tune required during implementation]

### Anti-Patterns to Avoid

- **Suspense wrapping `<Canvas>` itself:** Suspense must wrap scene content inside the Canvas boundary, not the Canvas element. The Suspense goes inside `<Canvas>...</Canvas>`.
- **React state subscription inside `useFrame`:** Use `useScrollStore.getState()` (imperative), not `useScrollStore(s => s.x)` (subscription). Phase 2 doesn't read scroll, but this pattern matters for Phase 3.
- **`dpr={[1, 2]}`:** ARCHITECTURE.md has `[1, 2]` but QUAL-04 and D-03 require `[1, 1.5]`. Requirement wins.
- **`gsap.registerPlugin` in MoonScene:** Must not register GSAP plugins at component or module level. LenisProvider is the single registration point (FOUND-05).
- **`'use client'` on layout.tsx:** Breaks `export const metadata`. Canvas wrapper must be a separate Client Component island.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Texture loading with Suspense | Custom `TextureLoader` + Promise + setState | `useTexture` from Drei | Handles WebGL context, mipmaps, Suspense integration, and texture caching |
| StrictMode-safe tween cleanup | `useEffect` + manual `tween.kill()` | `useGSAP` from `@gsap/react` | Auto-cleans via `gsap.context()` on StrictMode second invoke and unmount |
| DPR scaling math | Manual `window.devicePixelRatio` + resize listener | `dpr={[1, 1.5]}` on Canvas | R3F handles retina pixel ratio clamping internally |
| Sphere geometry + UV mapping | Typed `Float32Array` vertex buffers | `<sphereGeometry args={[r, w, h]} />` | Three.js SphereGeometry handles UV mapping and displacement-ready vertex normals |

**Key insight:** Every sub-problem in this phase has a Drei or R3F solution. No custom implementations are needed.

---

## Common Pitfalls

### Pitfall 1: Texture Files Missing at Execution Time

**What goes wrong:** `useTexture` throws during Suspense resolution if files don't exist at `/public/textures/moon/`. The Suspense boundary catches the error but shows nothing — canvas stays at `opacity: 0` permanently.

**Why it happens:** The `/public/` directory does not exist in the project yet (verified — `ls` showed it absent). NASA texture files must be placed before any code runs.

**How to avoid:** Wave 0 task 0: create `/public/textures/moon/` and place all three PNGs. Verify with `curl -I http://localhost:3000/textures/moon/moon-color.png` in dev server.

**Warning signs:** `onReady` callback never fires; canvas wrapper stays invisible.

[VERIFIED: /public directory absence confirmed via filesystem check]

### Pitfall 2: layout.tsx Becoming a Client Component

**What goes wrong:** Adding `'use client'` to `layout.tsx` to accommodate Canvas breaks `export const metadata` — metadata exports only work in Server Components.

**Why it happens:** WebGL Canvas requires client APIs, making it tempting to mark layout.tsx as a client component.

**How to avoid:** Keep `layout.tsx` as a Server Component. The Canvas wrapper lives inside `MoonScene.client.tsx` (a Client Component island). The `next/dynamic` boundary handles the server/client split.

[VERIFIED: layout.tsx currently has no 'use client' directive and exports metadata]

### Pitfall 3: Canvas Renders with Black Background

**What goes wrong:** By default, Three.js WebGLRenderer has `alpha: false`. The Canvas renders a black rectangle over the HTML content.

**Why it happens:** Three.js `WebGLRenderer` defaults `alpha: false`.

**How to avoid:** Pass `gl={{ alpha: true }}` on the `<Canvas>` element. The deep space background is a CSS gradient on `<body>` (not a Three.js background color).

[ASSUMED: alpha: true required for transparent canvas — standard Three.js WebGLRenderer behavior, training knowledge]

### Pitfall 4: Displacement Faceting with Low Segment Count

**What goes wrong:** With the SphereGeometry default of 32×16 segments, displacement mapping produces visible polygon faceting — the moon looks like a bumpy polyhedron, not a cratered sphere.

**Why it happens:** Displacement moves vertices, not pixels. Too few vertices means the 4096px displacement map has no geometry to push.

**How to avoid:** Use 128×128 segments (minimum 64×64). Verify at the lit/shadow terminator line where crater rims are most visible.

[VERIFIED: SphereGeometry defaults to 32×16 from node_modules/three/src/geometries/SphereGeometry.js line 7]

### Pitfall 5: Glow Mesh Z-fighting

**What goes wrong:** The glow sphere and moon sphere at the same Z position with slightly different radii can flicker at certain viewing angles due to floating point depth buffer precision.

**Why it happens:** WebGL depth buffer precision at similar depths with transparent blending.

**How to avoid:** Set `depthWrite={false}` on the glow material (Pattern 5). Also place the glow mesh after the moon mesh in JSX — Three.js renders in JSX order.

[ASSUMED: depthWrite=false resolves glow z-fighting — standard Three.js guidance, training knowledge]

### Pitfall 6: useGSAP Plugin Registration

**What goes wrong:** `useGSAP` from `@gsap/react` may require `gsap.registerPlugin(useGSAP)`. Omitting registration can cause the hook to fall back to basic `useEffect` behavior without context cleanup.

**Why it happens:** GSAP plugins require explicit registration before use.

**How to avoid:** Check if `registerPlugin(useGSAP)` is already present in `LenisProvider.tsx`. If not, add it alongside the existing `gsap.registerPlugin(ScrollTrigger)` in the `useLayoutEffect` block. LenisProvider is the single plugin registration point per FOUND-05.

[ASSUMED: useGSAP requires explicit registerPlugin — verify against @gsap/react README before implementing]

---

## Code Examples

### DPR Cap (QUAL-04)

```tsx
// Source: R3F core/store.d.ts — Dpr = number | [min: number, max: number] verified
// Do NOT use [1, 2] from ARCHITECTURE.md — QUAL-04 is authoritative
<Canvas dpr={[1, 1.5]} gl={{ alpha: true }}>
  ...
</Canvas>
```

### useTexture with Record Input

```tsx
// Source: Drei core/Texture.d.ts — Record<string, string> input returns Record<string, Texture>
const textures = useTexture({
  map: '/textures/moon/moon-color.png',
  displacementMap: '/textures/moon/moon-displacement.png',
  normalMap: '/textures/moon/moon-normal.png',
})
// textures.map → THREE.Texture
// textures.displacementMap → THREE.Texture
// textures.normalMap → THREE.Texture
```

### MeshStandardMaterial with All Three Maps

```tsx
// Source: Three.js 0.168.0 MeshStandardMaterial.js — all three properties verified
<meshStandardMaterial
  map={textures.map}
  displacementMap={textures.displacementMap}
  displacementScale={0.08}
  normalMap={textures.normalMap}
/>
```

### AdditiveBlending Constant

```tsx
// Source: Three.js 0.168.0 constants.js — AdditiveBlending = 2 verified
import * as THREE from 'three'
// THREE.AdditiveBlending is 2
blending={THREE.AdditiveBlending}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@studio-freight/lenis` | `lenis` package | 2023–2024 | Old package unmaintained — already using correct package |
| `framer-motion` package | `motion` package | Framer Motion v11 | Already installed as `motion ^12` |
| `THREE.Geometry` (removed) | `THREE.BufferGeometry` via JSX | Three.js r125 | Three.js 0.168.0 only has BufferGeometry — JSX sphereGeometry is correct |
| `dpr={[1, 2]}` in ARCHITECTURE.md | `dpr={[1, 1.5]}` per QUAL-04 | This project — QUAL-04 | Use 1.5 ceiling, not 2.0 |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `THREE.BackSide` + `depthWrite={false}` is the correct glow technique | Pattern 5 | Glow mesh may occlude moon or z-fight; easy to correct during implementation |
| A2 | `useGSAP` requires `gsap.registerPlugin(useGSAP)` in LenisProvider | Pitfall 6 | If not required, harmless; if required and omitted, StrictMode cleanup fails |
| A3 | `gl={{ alpha: true }}` is required for transparent canvas background | Pitfall 3 | Canvas renders black rectangle over HTML content; one-line fix |
| A4 | PointLight at `[-10, 5, 8]` + intensity 3.0 achieves ~35% shadow | Pattern 8 | Shadow amount visually wrong; trivially tuned during implementation |
| A5 | `displacementScale={0.08}` produces visible-but-not-jagged craters | Pattern 4 | May need tuning; visual judgment call |
| A6 | 128×128 segments are adequate for 4096×2048 displacement texture | Pattern 4 | Too few = faceting; 64 is a safe fallback |

---

## Open Questions

1. **useGSAP plugin registration**
   - What we know: `useGSAP` is in use in `HorizontalTrack.tsx` and appears to work. `LenisProvider.tsx` calls `gsap.registerPlugin(ScrollTrigger)`.
   - What's unclear: Whether `useGSAP` self-registers or requires an explicit `gsap.registerPlugin(useGSAP)` call.
   - Recommendation: Implementation task should check the `@gsap/react` README and add `registerPlugin(useGSAP)` to LenisProvider's `useLayoutEffect` if not already present.

2. **Opacity signal across the R3F boundary**
   - What we know: `useTexture`'s `onLoad` fires inside the R3F render loop. The opacity CSS lives on a wrapper div in the React tree (outside Canvas).
   - What's unclear: The cleanest pattern for propagating the "ready" signal from inside R3F to the outer React tree.
   - Recommendation: Pass an `onReady` callback prop from `MoonSceneClient` → `MoonScene`. The `useTexture` `onLoad` calls `onReady()`. `MoonSceneClient` uses `useState(false)` and flips to true on `onReady`. This avoids a Zustand store entry for a one-time signal.

3. **NASA texture source URLs**
   - What we know: NASA SVS (svs.gsfc.nasa.gov) is canonical; public domain.
   - What's unclear: Exact SVS product page with pre-processed color + displacement + normal maps at 4096px.
   - Recommendation: Wave 0 task should search NASA SVS for "CGI Moon Kit" or "Lunar Reconnaissance Orbiter" texture products. The CGI Moon Kit has 8192px maps (resize to 4096). Alternative: Solar System Scope moon texture pack has pre-processed normal + displacement maps.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@react-three/fiber` | All 3D rendering | Yes | 8.18.0 | — |
| `@react-three/drei` | `useTexture`, `Sphere` | Yes | 9.122.0 | — |
| `three` | Geometry, materials, blending | Yes | 0.168.0 (pinned) | — |
| `gsap` + `@gsap/react` | Entrance animation | Yes | 3.15.0 + 2.1.2 | — |
| `/public/textures/moon/*.png` | HERO-01, HERO-02, HERO-03 | NO | — | None — blocking |

**Missing dependencies with no fallback:**
- NASA texture PNG files at `/public/textures/moon/` — blocks HERO-01, HERO-02, HERO-03. Must be sourced and placed before implementation tasks.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 1.x with jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | Moon renders with displacement + normal maps | Visual — browser only | Manual inspection / Playwright screenshot | No WebGL in jsdom |
| HERO-02 | Lit/dark hemisphere from PointLight | Visual — browser only | Manual inspection | No WebGL in jsdom |
| HERO-03 | Glow rim visible as additive blended sphere | Visual — browser only | Manual inspection | No WebGL in jsdom |
| HERO-04 | Z fly-in over 2.5s on load | Unit (tween config) + Visual | `npm test -- src/components/canvas` | Wave 0 gap |
| HERO-05 | Self-rotation at 0.0005 rad/frame | Unit (constant check) | `npm test -- src/components/canvas` | Wave 0 gap |
| QUAL-04 | DPR capped at 1.5 | Unit (prop check) | `npm test -- src/components/canvas` | Wave 0 gap |

**R3F components cannot render in jsdom** (no WebGL). Unit tests for this phase test configuration values and constants, not rendered output. Visual requirements (HERO-01, HERO-02, HERO-03) require browser or Playwright verification.

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` + `npm run build`
- **Phase gate:** Full suite green + visual browser check of entrance animation and moon appearance before moving to Phase 3

### Wave 0 Gaps

- [ ] `src/components/canvas/__tests__/MoonScene.test.tsx` — unit tests for QUAL-04 (dpr prop), HERO-04 (GSAP tween duration/ease), HERO-05 (rotation constant)
- [ ] `/public/textures/moon/` directory and three PNG files — blocking HERO-01/02/03

---

## Security Domain

No authentication, user input, database queries, cryptographic operations, or external API calls in this phase. Canvas rendering is purely client-side.

| ASVS Category | Applies | Note |
|---------------|---------|------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | No | No user input |
| V6 Cryptography | No | — |

**CSP note:** If CSP is added in Phase 8, it must allow `blob:` and `data:` URIs for WebGL shader compilation. This is a Phase 8 concern.

---

## Project Constraints (from CLAUDE.md)

| Directive | Enforcement in Phase 2 |
|-----------|------------------------|
| Stack locked — no new packages | All packages already installed; no additions needed |
| R3F Canvas uses `next/dynamic` with `{ ssr: false }` | `MoonScene.client.tsx` is the `next/dynamic` wrapper |
| One global Canvas, never per-section | Canvas mounts once in `layout.tsx` via `MoonSceneClient` |
| Three.js pinned at 0.168.0 — do not upgrade | Version pinned in package.json; do not run `npm update three` |
| GSAP plugins registered only in `useEffect`/`useLayoutEffect`, never at module level | LenisProvider's `useLayoutEffect` is the single registration point |
| Single GSAP import point: `src/lib/gsap.ts` | All Phase 2 GSAP usage must import from `@/lib/gsap` |
| JS budget < 300kb gzipped | `MoonScene.client.tsx` uses `next/dynamic` — lazy loaded |
| Files max 800 lines | `MoonScene.tsx` has one sphere + glow + lights — well under limit |
| Functions max 50 lines | Split into `MoonMesh`, `GlowMesh`, and `MoonScene` if needed |
| No `console.log` in production | Use `process.env.NODE_ENV === 'development'` guards |

---

## Sources

### Primary (HIGH confidence — verified against installed node_modules)

- `node_modules/three/src/materials/MeshStandardMaterial.js` lines 38–43 — `displacementMap`, `normalMap`, `displacementScale` properties
- `node_modules/three/src/constants.js` line 18 — `AdditiveBlending = 2`
- `node_modules/three/src/geometries/SphereGeometry.js` line 7 — constructor signature `(radius=1, widthSegments=32, heightSegments=16, ...)`
- `node_modules/three/src/lights/PointLight.js` — PointLight class exists
- `node_modules/@react-three/drei/core/Texture.d.ts` lines 10–11 — `useTexture` signature with Record input and `onLoad` callback
- `node_modules/@react-three/drei/core/shapes.d.ts` line 11 — `Sphere` forwardRef export
- `node_modules/@react-three/fiber/dist/declarations/src/core/store.d.ts` line 17 — `Dpr = number | [min: number, max: number]`
- `node_modules/@react-three/fiber/dist/declarations/src/core/hooks.d.ts` line 37 — `useFrame(callback): null`
- `node_modules/@gsap/react/types/index.d.ts` — `useGSAP` signature and `useGSAPConfig` interface
- `node_modules/gsap/types/gsap-core.d.ts` line 611 — `gsap.to(targets, vars): Tween`
- `node_modules/next/dist/shared/lib/dynamic.d.ts` — `dynamic` with `ssr: false`
- `src/components/lenis-provider/LenisProvider.tsx` — existing plugin registration + GSAP ticker pattern
- `src/components/horizontal-track/HorizontalTrack.tsx` — `useGSAP` usage pattern (canonical reference)
- `src/app/layout.tsx` — current Server Component structure
- `.planning/phases/02-moon-hero/02-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)

- `.planning/research/ARCHITECTURE.md` — canvas strategy, component structure, imperative store read pattern
- `.planning/research/STACK.md` — stack validation, Drei helper list, NASA texture guidance

### Tertiary (LOW confidence — ASSUMED claims)

- BackSide + depthWrite=false for glow technique (A1)
- useGSAP plugin registration requirement (A2)
- alpha: true for transparent canvas (A3)
- PointLight position and intensity values (A4)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified from node_modules
- Architecture: HIGH — locked by CONTEXT.md; existing codebase patterns are canonical
- API usage (useTexture, useFrame, GSAP): HIGH — verified from type definitions in node_modules
- Pitfalls: MEDIUM — core pitfalls verified; glow technique specifics are ASSUMED
- Texture download source: LOW — NASA SVS URLs not verified this session

**Research date:** 2026-05-06
**Valid until:** Stable — package versions are pinned; no fast-moving dependencies
