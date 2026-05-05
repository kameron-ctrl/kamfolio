# Stack Research — Kameron Benjamin Portfolio

## Validated Stack (2025)

The pre-decided stack is sound. Key validations and gotchas below.

---

## Core Framework

### Next.js 14 (App Router)
- **Version**: 14.x stable ✓
- **Confidence**: High
- **Notes**: App Router is the correct choice. Pages Router has no advantages here.
- **SSR concern**: R3F Canvases must be dynamically imported with `{ ssr: false }` — WebGL APIs don't exist on the server.

```js
const MoonScene = dynamic(() => import('@/components/hero/MoonScene'), { ssr: false })
```

---

## 3D Layer

### React Three Fiber 8.x + Three.js
- **Package**: `@react-three/fiber`
- **Confidence**: High
- **Critical**: Pin Three.js to a version compatible with R3F 8.x. R3F 8.x has known incompatibilities with Three.js 0.169+. Check R3F's peer deps before installing.
- **Pattern**: One global `<Canvas>` at layout level, not per-section. Per-section canvases cause expensive WebGL context creation/destruction.
- **SSR**: Every canvas must use `dynamic` with `{ ssr: false }`.

### Drei
- **Package**: `@react-three/drei`
- **Confidence**: High
- **Useful helpers for this project**:
  - `<Stars />` — background star field, configurable count/radius/depth
  - `<Points>` / `<PointMaterial>` — nebula particle clusters
  - `<Sphere>` — moon geometry wrapper
  - `<useTexture>` — async texture loading with Suspense
  - `<useFrame>` — per-frame update hook (self-rotation, velocity effects)
  - `<Billboard>` — atmospheric glow rim facing camera
  - `<Preload>` — preload assets before scene renders

---

## Scroll System

### Lenis
- **Package**: `lenis` (**NOT** `@studio-freight/lenis` — that package is dead/unmaintained)
- **Version**: Latest stable
- **Confidence**: High
- **Why**: Exposes `lenis.velocity` natively — no manual delta tracking needed
- **Critical wiring**: Must be initialized in root layout BEFORE GSAP ScrollTrigger. Wrong order breaks scroll triggers.

```js
// Root layout — correct order
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

### GSAP ScrollTrigger
- **Package**: `gsap` (ScrollTrigger is included)
- **Version**: 3.x stable
- **Confidence**: High
- **Next.js App Router concern**: GSAP plugins must be registered inside `useEffect` (never at module level — SSR will fail). Use `gsap.registerPlugin(ScrollTrigger)` inside `useLayoutEffect` or `useEffect`.
- **StrictMode concern**: React 18 StrictMode double-invokes effects. Always return cleanup: `return () => { trigger.kill() }`.

---

## Animation

### Framer Motion
- **Package**: `motion` (package was renamed from `framer-motion` — check latest)
- **Version**: 11.x+ (major rewrite with new `motion` package name)
- **Confidence**: High for UI elements
- **Scope**: Use for card entrances, text animations, personality section. Do NOT use for scroll-driven 3D effects (use R3F useFrame + Lenis velocity instead).

---

## Styling

### Tailwind CSS
- **Version**: **v3.x** — do NOT use v4 (still in beta/RC, breaking changes, ecosystem not ready)
- **Confidence**: High (v3), Low (v4)
- **Config**: Use `tailwind.config.js` with content paths including `./src/**/*.{js,ts,jsx,tsx}`

---

## Assets

### NASA Lunar Textures
- **Source**: NASA Scientific Visualization Studio (svs.gsfc.nasa.gov)
- **License**: Public domain — no attribution required
- **Files needed**:
  - Color/albedo map
  - Displacement/height map (for crater geometry)
  - Normal map (for crater lighting detail)
- **Format**: Use WebP or optimized PNG. Source files can be very large — resize to 2048×1024 or 4096×2048 max.
- **Loading**: Use Drei's `useTexture` hook, wrap scene in `<Suspense>`.

---

## What NOT to Use

| Library | Reason |
|---------|--------|
| `@studio-freight/lenis` | Unmaintained — use `lenis` instead |
| Tailwind v4 | Still beta, ecosystem not ready |
| Three.js 0.169+ | Potential R3F 8.x peer dep conflicts — pin version |
| `react-spring` for scroll | Lenis + GSAP covers this better for complex scroll systems |
| Multiple R3F Canvases | Expensive WebGL context creation — use one global Canvas |
| GSAP at module level (SSR) | Must register plugins inside useEffect |

---

## Missing Pieces (not in original blueprint)

- **`@react-three/postprocessing`** — if you want bloom/vignette on the nebula (optional but impactful)
- **`sharp`** — Next.js image optimization for project card screenshots
- **`clsx` / `tailwind-merge`** — conditional class utilities (standard in Next.js projects)

---

## Recommended `package.json` Starting Point

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "@react-three/fiber": "^8.x",
    "@react-three/drei": "^9.x",
    "three": "^0.168.0",
    "gsap": "^3.x",
    "lenis": "^latest",
    "motion": "^11.x",
    "tailwindcss": "^3.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  }
}
```

> **Verify all versions against npm before installing** — these reflect training data (Aug 2025 cutoff).

---

*Research completed: 2026-05-05*
