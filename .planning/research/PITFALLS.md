# Pitfalls Research — Kameron Benjamin Portfolio

**Domain:** Next.js 14 App Router + React Three Fiber + GSAP ScrollTrigger + Lenis + Framer Motion
**Confidence:** HIGH across all areas

---

## PITFALL 1: R3F Canvas Breaks on SSR Without `dynamic` + `ssr: false`

**What goes wrong:** `<Canvas>` calls WebGL APIs that don't exist in Node.js. Even with `'use client'`, the module runs server-side. Results in `window is not defined` at build time or a hydration mismatch that blanks the scene.

**Why it happens:** `'use client'` marks a component for interactivity but does NOT prevent SSR execution. Top-level imports still run on the server.

**Fix:** Always wrap the entire 3D scene in a `dynamic` import with `{ ssr: false }` at the import site (never in the same file as Canvas). Add a `loading` placeholder sized to the canvas to prevent layout shift.

**Warning signs:** `window is not defined` build error; "Hydration failed" console error; scene flashes then disappears.

**Phase to address:** Phase 1 (Foundation) — wire before any 3D code is written.

---

## PITFALL 2: GSAP ScrollTrigger + React StrictMode Creates Orphaned Animations

**What goes wrong:** React 18 StrictMode mounts → unmounts → remounts every component. ScrollTrigger instances created in `useEffect` fire twice. The first instance isn't fully cleaned up — animations jump, fire at wrong positions, or trigger twice.

**Fix:** Use `useGSAP` from `@gsap/react` instead of raw `useEffect`. It handles StrictMode via GSAP's own context system. Use the `scope` option scoped to the container ref. Never use raw `useEffect` for ScrollTrigger.

**Warning signs:** Scroll animations fire at wrong positions in dev but work in production; doubled ScrollTrigger markers; pinned sections never unpin; horizontal scroll jumps unexpectedly.

**Phase to address:** Phase 1 (Foundation) — establish `useGSAP` as the standard before any animation is written.

---

## PITFALL 3: Lenis + ScrollTrigger Out of Sync

**What goes wrong:** Lenis intercepts native scroll and replaces it with a smoothed synthetic position. ScrollTrigger reads `window.scrollY` (native). During the lerp period these diverge — ScrollTrigger fires at the wrong time, pins activate early or late, scrub animations stutter.

**Fix — strict initialization order:**
```
1. Create Lenis instance
2. lenis.on('scroll', ScrollTrigger.update)  ← bridge scroll position
3. gsap.ticker.add((time) => lenis.raf(time * 1000))  ← drive Lenis from GSAP ticker
4. gsap.ticker.lagSmoothing(0)  ← prevent double-smoothing
5. Only then create ScrollTrigger animations
```

Initialize once in root layout as a context provider, never in page components.

**Warning signs:** Pin activates 50–200px off; scrub animations stutter then snap; ScrollTrigger markers don't align with visual elements; fast scroll causes permanent lag.

**Phase to address:** Phase 1 (Foundation) — this is the scroll architecture core.

---

## PITFALL 4: Three.js Memory Leaks — GPU Allocations Never Freed

**What goes wrong:** Geometries, materials, textures, and render targets allocated in Three.js are NOT garbage collected on React unmount. Progressive GPU memory growth across hot-reloads. On mobile: VRAM exhaustion, tab crash, or severe frame drops.

**Fix:**
- Every imperatively created Three.js resource needs explicit `dispose()` in useEffect cleanup
- Prefer JSX-declared R3F objects (tracked by fiber reconciler)
- Moon textures via `useTexture` (Drei manages cache/disposal)
- Never call `dispose()` on textures loaded via `useLoader`/`useTexture` — R3F owns those
- Always dispose particle BufferGeometry and PointsMaterial on unmount
- Always dispose WebGLRenderTarget

**Warning signs:** GPU memory in DevTools climbs monotonically; `THREE.WebGLRenderer: Context Lost`; progressive framerate degradation; mobile tab crash after 2–3 minutes.

**Phase to address:** Phase 2 (Moon Hero) — establish disposal patterns with first textures. Audit every phase adding R3F content.

---

## PITFALL 5: Mobile GPU Overload from Unthrottled 3D Rendering

**What goes wrong:** 60fps WebGL at full DPR on mobile drains battery in minutes. The 6-layer nebula (~2,400 particles) + moon sphere + AdditiveBlending overdraw is the specific combination that will break mobile.

**Why:** AdditiveBlending on overlapping transparent layers multiplies GPU fill-rate cost. R3F defaults `dpr` to `window.devicePixelRatio` (3x on modern iPhones = 9x fill rate of 1x display).

**Fix:**
- `<Canvas dpr={[1, 1.5]}>` — always, no exceptions
- Moon sphere: 64×64 segments → 32×32 on mobile
- Nebula particles: 800 → 200 per layer on mobile
- `frameloop="demand"` in static sections, `"always"` only during active scroll
- `prefers-reduced-motion` fallback to static gradient

**Warning signs:** Device warm after 30 seconds; GPU time >16ms in DevTools; FPS below 30 on Moto G emulation.

**Phase to address:** Phase 2 establishes DPR cap and frameloop mode. Phase 3 (Nebula) enforces particle count limits.

---

## PITFALL 6: Horizontal Scroll Breaks Touch Events and Scroll Restoration

**What goes wrong:** GSAP pin + CSS translateX creates an illusion where vertical scroll drives horizontal visual motion. On touch devices: browser interprets swipes as vertical (because the container IS vertical), fighting the synthetic horizontal motion. On back-navigation: scroll restoration drops to arbitrary `scrollY` mid-track, breaking layout.

**Fix:**
- `touch-action: pan-y` on pinned horizontal container
- `window.history.scrollRestoration = 'manual'` in layout (client-side only)
- Reset scroll position to top on route change via root layout `useEffect`
- Mobile: convert horizontal section to vertical card stack
- Test iOS rubber-band overscroll — pin must release correctly at both ends

**Warning signs:** iOS Safari sticks on swipe; back button lands mid-track; GSAP warning `End value is greater than start`.

**Phase to address:** Phase 3 (Horizontal Scroll Architecture) — build touch behavior into initial implementation.

---

## PITFALL 7: Framer Motion + GSAP Both Writing `transform` Causes Jitter

**What goes wrong:** If Framer Motion controls a `motion.div`'s transform AND GSAP targets the same element's transform, they overwrite each other every frame — the element flickers between two positions.

**Fix — strict ownership rule:**
- **Framer Motion owns:** page entrance/exit transitions, mount/unmount animations, hover states not involving scroll
- **GSAP owns:** all scroll-driven motion (parallax, pin, scrub), timeline-based sequences
- Never let both target `transform` on the same element
- For elements needing both: Framer Motion handles `opacity`, GSAP handles `x`/`y`

**Warning signs:** Element jitters at scroll/hover animation boundary; no console errors; removing one library fixes the other.

**Phase to address:** Phase 1 (Foundation) — document ownership rules before any animation code is written.

---

## PITFALL 8: Missing Suspense Boundary Causes Flash of Invisible Canvas

**What goes wrong:** Moon's displacement and normal maps (2K–4K) cause R3F to suspend the subtree during load via `useTexture`. Without a correctly sized `<Suspense>` boundary, the Canvas goes blank. Mismatched fallback size causes layout shift.

**Fix:** Wrap the 3D scene in `<Suspense>` with a fallback matching canvas dimensions exactly. Use `useTexture` from Drei. Call `useTexture.preload(url)` outside the component tree to start loading before Canvas mounts.

**Warning signs:** White/black flash before moon appears; `No Suspense boundary found` console error; Lighthouse LCP delay tied to texture load.

**Phase to address:** Phase 2 (Moon Hero) — set up Suspense architecture with first textures.

---

## PITFALL 9: `gsap.registerPlugin` Called in Multiple Files

**What goes wrong:** Hot-reload causes repeated registrations. ScrollTrigger's internal state is partially reset on re-registration — some triggers silently lose their configuration.

**Fix:** Create `lib/gsap.ts` as the single registration site. All other files import from `lib/gsap.ts`, never directly from `gsap`. Never call `registerPlugin` in component files.

**Warning signs:** ScrollTrigger behavior changes after hot-reload without code changes; some triggers work, others silently don't; no console errors.

**Phase to address:** Phase 1 (Foundation) — create `lib/gsap.ts` before any GSAP code is written.

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Lenis + App Router | Creating Lenis in page-level `useEffect` — reinitializes on route change | Create once in `app/layout.tsx` as a context provider |
| R3F + Tailwind | Applying Tailwind classes to `<mesh>` or `<points>` elements | Tailwind on HTML wrapper divs only |
| GSAP ScrollTrigger + Next.js navigation | ScrollTrigger doesn't auto-refresh after client-side route changes | Call `ScrollTrigger.refresh()` after navigation; kill triggers on unmount |
| Framer Motion + R3F Canvas | Using `motion.mesh` inside `<Canvas>` | Framer Motion is DOM-only; inside Canvas use GSAP or raw Three.js |
| NASA textures + Next.js Image | Piping 4K lunar textures through `<Image>` component | Compress separately at build time; `<Image>` doesn't apply to Three.js textures |
| Lenis + `overflow: hidden` on body | Setting `overflow: hidden` on `<html>` or `<body>` | Lenis needs `overflow: auto` or `overflow: scroll` on its root |

---

## Performance Traps

| Trap | Symptoms | Prevention |
|------|----------|------------|
| Full DPR on retina mobile | Device hits 55°C in 60s | `dpr={[1, 1.5]}` on Canvas always |
| AdditiveBlending 6-layer overdraw | GPU time >16ms, FPS halves during scroll | Cap particles; reduce layers on mobile |
| `scrub: true` (boolean) | Animations snap to end on fast scroll | Use `scrub: 1` (number = catch-up seconds) |
| `frameloop="always"` during idle | Battery drain with 0 visible motion | `frameloop="demand"` in static sections |
| Uncompressed 4K NASA textures | 3–8s load delay on LTE | Compress to 1024–2048px JPEG 80% quality |
| Pinned section ignoring scrollbar width | 1–17px jitter on pin activation | `scrollbar-gutter: stable` globally |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No `prefers-reduced-motion` fallback | Vestibular disorder users; a11y fail | Detect → static layout |
| Rocket button behind Canvas z-index | Primary CTA unclickable | Fixed elements need explicit `z-index` above Canvas |
| No visual scroll hint on horizontal section | Desktop users don't know to keep scrolling | Faint arrows or card peeking at right edge |
| Lenis capturing form input scroll | `<textarea>` scroll intercepted | Add `data-lenis-prevent` to form elements |
| Canvas blocking keyboard tab order | Keyboard navigation non-functional | `tabIndex={-1}` on Canvas container |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase |
|---------|-----------------|
| R3F Canvas SSR crash | Phase 1: Foundation |
| GSAP StrictMode double-fire | Phase 1: Foundation |
| Lenis + ScrollTrigger desync | Phase 1: Foundation |
| GSAP plugin re-registration | Phase 1: Foundation |
| Framer Motion + GSAP conflict | Phase 1: Foundation |
| Texture loading Suspense flash | Phase 2: Moon Hero |
| WebGL memory leaks | Phase 2: Moon Hero |
| Mobile GPU overload | Phase 2: Moon Hero |
| Nebula overdraw on mobile | Phase 3: Nebula System |
| Horizontal scroll touch events | Phase 4: Horizontal Track |
| Scroll restoration mid-horizontal | Phase 4: Horizontal Track |
| Rocket button z-index | Phase 5: Polish |
| No reduced-motion fallback | Phase 5: Polish |

---

## Key Takeaways

1. **The Lenis + GSAP initialization order is the single highest-risk integration point** — non-negotiable, must be Phase 1.
2. **`dynamic(..., { ssr: false })` is mandatory for every R3F Canvas** — `'use client'` alone does not prevent SSR.
3. **`useGSAP` from `@gsap/react` is required** — raw `useEffect` creates orphaned triggers under React 18 StrictMode.
4. **Mobile thermal throttle is the most likely post-launch failure** — address DPR cap and particle limits in Phase 2, not Phase 5.
5. **Framer Motion and GSAP must have strict property ownership rules** established before any animation code is written.

---

*Research completed: 2026-05-05*
