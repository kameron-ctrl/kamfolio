# Phase 2: Moon Hero — Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Mount the global R3F Canvas in `app/layout.tsx`, build a photorealistic moon mesh with NASA displacement + normal maps, atmospheric glow rim, entrance animation, and DPR cap. The canvas is the permanent visual layer for all subsequent phases.

Does NOT include: nebula/particle system (Phase 3), hero text overlay (Phase 4), scroll-driven velocity effects (Phase 3+). Phase 2 moon is static after entrance animation completes.

</domain>

<decisions>
## Implementation Decisions

### Canvas Architecture
- **D-01:** Single global `<Canvas>` in `app/layout.tsx`. Position: `fixed`, `inset: 0`, `z-index: 0`, `pointer-events: none`. HTML content sits at `z-index: 1` in a sibling div. This is the permanent canvas for all phases — never remounted.
- **D-02:** Canvas wrapper div starts at `opacity: 0`. Once Three.js is ready and textures have loaded (Suspense resolved), transition to `opacity: 1` with a short CSS fade (~0.5s). No spinner, no fallback sphere — the moon materializes cleanly.
- **D-03:** DPR cap: `dpr={[1, 1.5]}` (QUAL-04). The architecture research shows `[1, 2]` but the requirement is authoritative — use 1.5 as the ceiling.

### Moon Position and Framing
- **D-04:** Moon sits **right-of-center, vertically centered**. Implemented by offsetting the moon mesh on the X axis in 3D space (e.g., `position={[2.0, 0, 0]}` — exact value is Claude's discretion based on camera FOV so the moon reads as clearly right-of-center without bleeding the edge). Camera stays centered.
- **D-05:** Moon size target: ~50% of viewport height in diameter at final resting position. Large enough to dominate the right half but not so large it crowds the left text area.
- **D-06:** Phase 4 text placement consequence: name and subtitle will anchor **bottom-left** in the HTML layer, with clear negative space on the left side of the viewport. Phase 4 planner should account for this.

### NASA Textures
- **D-07:** Resolution: **4096×2048 PNG** for all three maps (color/albedo, displacement, normal). Maximum crater and surface detail. Served from `/public/textures/moon/`.
- **D-08:** Mobile does not load R3F at all (QUAL-02 — CSS-only moon at 375px). These textures are desktop-only. The ~10–14MB total download is acceptable for desktop users on fast connections.
- **D-09:** Load via Drei's `useTexture` hook with a `<Suspense>` boundary around `MoonScene`. Canvas wrapper opacity animation triggers on Suspense resolution (not on a timer).
- **D-10:** Texture filenames (Claude's discretion — use descriptive names): `moon-color.png`, `moon-displacement.png`, `moon-normal.png`. Source: NASA SVS (public domain). Files must be present in `/public/textures/moon/` before Phase 2 is executable.

### Entrance Animation
- **D-11:** **Z fly-in approach**: Moon starts at `z = -15` (appears as a tiny distant point) and lerps to `z = 0` over **~2.5 seconds** on mount. Uses real 3D perspective foreshortening — more convincing than a scale lerp. Not scroll-driven; this is a mount-time animation.
- **D-12:** Entrance triggers immediately once textures are ready (canvas becomes visible). Fade-in and Z fly-in start simultaneously — the moon both materializes and approaches at the same time.
- **D-13:** Lerp curve: ease-out (fast start, settles gently). Use `gsap.to` on the mesh ref's `position.z` inside a `useEffect` after textures resolve, OR implement manually with `useFrame` + a lerp factor. Claude's discretion — whichever integrates more cleanly with existing GSAP setup.

### Moon Mesh Details (prescriptive from requirements)
- **D-14:** Geometry: `THREE.SphereGeometry` with adequate segment count for smooth displacement (e.g., 64×64 or 128×128 — Claude's discretion for quality/perf balance).
- **D-15:** Material: `MeshStandardMaterial` with `map` (color), `displacementMap`, `normalMap`. `displacementScale` is Claude's discretion (tune for visible but not exaggerated crater depth).
- **D-16:** Sun simulation: single `PointLight` positioned to create a convincing lit/shadow hemisphere. Position and intensity are Claude's discretion — aim for roughly 30–40% of the sphere in shadow.
- **D-17:** Atmospheric glow: second `SphereGeometry` mesh, ~5% larger radius, `MeshBasicMaterial` with `AdditiveBlending`, low opacity (~0.15–0.25), transparent: true. No texture — just a soft halo effect.
- **D-18:** Self-rotation: `~0.0005` radians/frame on Y axis, applied in `useFrame`. Subtle — perceptible on sustained viewing, not on glance.

### Phase 2 Scroll Behavior
- **D-19:** Moon does **not** respond to scroll in Phase 2. Static after entrance animation. Scroll reactivity (velocity breathe, parallax) is Phase 3's responsibility. This keeps Phase 2 scope clean and Phase 3 testable in isolation.

### Component Architecture
- **D-20:** Files follow ARCHITECTURE.md `canvas/` directory pattern:
  - `src/components/canvas/MoonScene.tsx` — R3F scene content (moon mesh, glow, lights)
  - `src/components/canvas/MoonScene.client.tsx` — `next/dynamic` wrapper with `ssr: false`
  - Canvas mount point in `app/layout.tsx` (client component wrapper required since Canvas is client-only)

### Claude's Discretion
- Exact moon X offset (targeting right-of-center read — adjust based on camera FOV)
- SphereGeometry segment count (64 or 128 — balance quality vs. GPU cost)
- displacementScale value (visible craters, not jagged)
- PointLight position and intensity (convincing shadow hemisphere)
- Glow mesh opacity (subtle halo, not bloomed)
- Lerp curve implementation (GSAP vs. useFrame — whichever is cleaner)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Documents
- `.planning/REQUIREMENTS.md` — HERO-01 through HERO-05, QUAL-04 acceptance criteria
- `.planning/ROADMAP.md` Phase 2 section — success criteria checklist
- `.planning/research/ARCHITECTURE.md` — Global Canvas strategy and component file structure
- `.planning/research/STACK.md` — NASA texture guidance, Drei helper list (`useTexture`, `Sphere`, `useFrame`)
- `.planning/phases/01-scroll-foundation/01-CONTEXT.md` — Phase 1 decisions (scroll store, layout.tsx wiring)

### Critical Constraints
- Three.js must stay pinned at `0.168.0` — R3F 8.x breaks with 0.169+
- DPR cap is `[1, 1.5]` — NOT `[1, 2]` (the architecture doc has a typo; QUAL-04 is authoritative)
- Canvas must use `next/dynamic` with `{ ssr: false }` — WebGL APIs crash on server
- Textures must be in `/public/textures/moon/` before execution — not downloaded at build time
- `src/lib/gsap.ts` is the single GSAP import point — no component-level `registerPlugin` calls

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/scroll-store.ts` — Zustand store with `scrollY`, `velocity`, `displayVelocity`, `phase`, `progress`. Moon does NOT subscribe to this in Phase 2 (Phase 3 adds reactivity).
- `src/lib/gsap.ts` — Single GSAP import. Any GSAP animation in Phase 2 must import from here.
- `src/components/lenis-provider/LenisProvider.tsx` — Already in layout.tsx. Canvas must be a sibling of LenisProvider, not nested inside it.
- `app/layout.tsx` — Currently wraps only LenisProvider + children. Phase 2 adds the Canvas wrapper div alongside `{children}`.

### Integration Points
- `app/layout.tsx` — Add fixed Canvas wrapper div alongside the existing `{children}` div
- Canvas wrapper: `position: fixed; inset: 0; z-index: 0; pointer-events: none`
- HTML wrapper: `position: relative; z-index: 1` (children div already exists)

</code_context>

<specifics>
## Specific Decisions to Honor

- Entrance is Z fly-in (real 3D depth), NOT scale lerp — the perspective shift is intentional
- Moon position is right-of-center (X offset), not centered — constrains Phase 4 text layout
- 4096×2048 PNGs chosen for maximum crater detail; no progressive loading — plain fade-in suffices
- Canvas opacity fade + Z fly-in start simultaneously once textures load
- DPR cap is 1.5 — enforce this; do not use 2.0 from the architecture doc

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-moon-hero*
*Context gathered: 2026-05-06*
