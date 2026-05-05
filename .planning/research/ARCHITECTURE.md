# Architecture Research — Kameron Benjamin Portfolio

**Domain:** Creative developer portfolio — Next.js 14 App Router + React Three Fiber + cinematic scroll system
**Confidence:** HIGH (core patterns), MEDIUM (Lenis v2 + GSAP integration specifics — verify against installed API)

---

## Recommended File Structure

Organize by feature surface, not by file type. Three top-level groupings inside `components/`:

```
src/
├── app/
│   ├── layout.tsx              # Root: LenisProvider, global Canvas mount
│   └── page.tsx                # Single page, section sequence
│
├── components/
│   ├── canvas/                 # R3F-only — no DOM APIs
│   │   ├── MoonScene.tsx
│   │   ├── MoonScene.client.tsx    # dynamic import wrapper, ssr:false
│   │   ├── NebulaSystem.tsx
│   │   ├── nebula/
│   │   │   ├── StarField.tsx       # 0.05x parallax
│   │   │   ├── FarNebula.tsx       # 0.15x
│   │   │   ├── MidFog.tsx          # 0.30x
│   │   │   ├── NearBokeh.tsx       # 0.50x
│   │   │   └── ForegroundDust.tsx  # 0.80x
│   │   └── CubeScene.tsx           # Isolated canvas, controlled by card
│   │
│   ├── scroll/                 # Framework — no content knowledge
│   │   ├── LenisProvider.tsx
│   │   └── HorizontalTrack.tsx
│   │
│   ├── sections/
│   │   ├── hero/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HeroText.tsx
│   │   │   └── hero.css
│   │   ├── projects/
│   │   │   ├── ProjectsTrack.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── GreenGuardianCard.tsx
│   │   │   ├── CubeCoachCard.tsx
│   │   │   ├── PlaceholderCard.tsx
│   │   │   └── projects.css
│   │   ├── personality/
│   │   │   ├── PersonalityStrip.tsx
│   │   │   ├── StrikersSection.tsx
│   │   │   └── personality.css
│   │   └── timeline/
│   │       ├── JourneyTimeline.tsx
│   │       ├── TimelineNode.tsx
│   │       └── timeline.css
│   │
│   └── ui/
│       ├── RocketButton.tsx
│       ├── TechPill.tsx
│       └── AnimatedText.tsx
│
├── hooks/
│   ├── useScrollStore.ts
│   ├── useLenis.ts
│   └── useReducedMotion.ts
│
├── lib/
│   ├── scroll-store.ts         # Zustand: scrollY, velocity, phase, progress
│   └── three-utils.ts
│
└── styles/
    ├── tokens.css
    ├── typography.css
    └── global.css
```

**Key rationale:** `canvas/` is strictly isolated — nothing inside it may import DOM components. Each section collocates its CSS (e.g., `hero.css` next to `HeroSection.tsx`) making sections independently deletable.

---

## R3F Canvas Strategy: One Global Canvas

**Verdict: Single global `<Canvas>` in `app/layout.tsx`, `position: fixed`, `z-index: 0`, `pointer-events: none`.**

Per-section canvases fail for three compounding reasons:

1. **WebGL context limit.** Browsers cap at 8 (Chrome) to 16 (Firefox). Multiple canvases silently drop oldest contexts — 3D content disappears without error.
2. **Nebula continuity.** The 6-layer nebula must span the full viewport. Per-section canvases clip it to each section's bounding box.
3. **Re-mount cost.** R3F tears down all GPU resources on canvas remount. A global canvas never remounts — textures, geometries, and the renderer persist for the page lifetime.

**One justified exception:** The CubeCoach card's Rubik's cube uses its own isolated `<Canvas>` scoped inside the card. One additional context for a single contained widget stays within browser limits.

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
            <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 2]}>
              <NebulaSystem />
              <MoonScene />
            </Canvas>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  )
}
```

Both `NebulaSystem` and `MoonScene` are `next/dynamic` wrapped with `ssr: false`.

---

## Vertical → Horizontal Scroll: Lenis + GSAP Wiring

**Initialization order is non-negotiable:**

```
1. Lenis instantiated
2. gsap.ticker.add(time => lenis.raf(time * 1000))   ← Lenis drives GSAP's rAF
3. lenis.on('scroll', ScrollTrigger.update)           ← Lenis drives ScrollTrigger refresh
4. gsap.ticker.lagSmoothing(0)                        ← prevent jitter on tab re-focus
5. Component ScrollTrigger registrations (useLayoutEffect per section)
6. ScrollTrigger.refresh() after all sections mount
```

Steps 2-4 must happen inside `LenisProvider`'s `useEffect`, before any ScrollTrigger is registered. If a ScrollTrigger is registered before step 3, it reads native `window.scrollY` instead of Lenis's synthetic position — triggers fire at wrong visual offsets.

**Horizontal scroll mechanism:** Native scroll axis stays vertical. No hijacking. `HorizontalTrack` uses a GSAP ScrollTrigger pin + scrub to map `scrollY` → `translateX` on a wide flex container.

```
Vertical zone:    0%  → 40%  → hero scrolls normally
Pin zone:        40%  → 55%  → pin fires, horizontal starts
Horizontal zone: 55%  → 100% → translateX advances per scrollY increment
```

Track width = section count × 100vw + gaps. Approximately 6–7 × 100vw for this project.

```tsx
// components/scroll/HorizontalTrack.tsx
export function HorizontalTrack({ children }) {
  const containerRef = useRef(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.h-section')
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${containerRef.current.scrollWidth}`,
          onUpdate: (self) => {
            const phase = self.progress < 0.4 ? 'vertical'
                        : self.progress < 0.55 ? 'transition'
                        : 'horizontal'
            useScrollStore.getState().setPhase(phase)
          },
        },
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef}>
      <div style={{ display: 'flex' }}>{children}</div>
    </div>
  )
}
```

---

## 6-Layer Nebula Componentization

```
<NebulaSystem>                     ← coordinator, reads scroll store
  DeepSpaceGradient                ← CSS background on <body>, not R3F
  <StarField />                    ← R3F Points, ~2000 pts, parallax 0.05x
  <FarNebula />                    ← R3F 3 clusters × 800 pts, AdditiveBlending, 0.15x
  <MidFog />                       ← R3F soft circle texture Points, 0.30x
  <NearBokeh />                    ← R3F bokeh disc Points, 0.50x
  <ForegroundDust />               ← R3F small fast Points, 0.80x
</NebulaSystem>
```

`DeepSpaceGradient` is a CSS `background` — fixed `<div>` at `z-index: -1`, no Canvas needed.

**Per-layer imperative read pattern** (critical — do NOT use React selectors inside `useFrame`):

```tsx
export function FarNebula() {
  const ref = useRef()
  const PARALLAX = 0.15

  useFrame(() => {
    const { scrollY, velocity } = useScrollStore.getState()  // imperative — no subscription
    ref.current.position.y = scrollY * PARALLAX * -0.001
    const breathe = 1 + Math.abs(velocity) * 0.002
    ref.current.scale.setScalar(breathe)
  })
  // geometry + material + return
}
```

**Why:** Using `useScrollStore(s => s.velocity)` inside R3F creates a React subscription that re-renders 60×/second, adding reconciliation overhead at animation rate. `getState()` is imperative and has zero overhead.

**Velocity pipeline:**

```
Lenis scroll event
  → raw velocity
  → lerped displayVelocity (decay 0.1 per frame — settles in ~300ms)
  → written to Zustand store
  → read by useFrame in each layer
  → applied as scale multiplier (the "breathe")
```

The lerp lives in `LenisProvider`'s scroll callback, not inside `useFrame`.

---

## Data Flow

```
Lenis (each RAF frame)
  ├─→ ScrollTrigger.update()
  ├─→ Zustand scroll-store { scrollY, velocity, phase, progress }
  │     ├─→ useFrame reads (R3F layers) — getState(), no subscription
  │     └─→ rAF loop (DOM) — updates CSS vars --scroll-skew, --scroll-blur
  └─→ HorizontalTrack (via GSAP scrub) — translateX
```

CSS velocity effects use a plain `requestAnimationFrame` loop outside R3F that writes CSS custom properties. CSS applies them to `.h-section-content` with `transform: skewX(var(--scroll-skew))` and `filter: blur(var(--scroll-blur))` — no CSS `transition` on these properties, the rAF loop is already smooth.

---

## Build Order

Dependencies determine the order. Each phase is a prerequisite for the next:

| Phase | What | Deps |
|-------|------|------|
| 1 | `scroll-store.ts` → `LenisProvider` → `HorizontalTrack` | None → scroll-store → LenisProvider running |
| 2 | Global Canvas → `NebulaSystem` + nebula sublayers → `MoonScene` | LenisProvider |
| 3 | `HeroSection` + `HeroText` | MoonScene visible, LenisProvider |
| 4 | `ProjectCard` → `GreenGuardianCard` → `CubeScene` → `CubeCoachCard` → `PlaceholderCard` | HorizontalTrack working |
| 5 | `PersonalityStrip`, `StrikersSection`, `JourneyTimeline`, `TimelineNode` | HorizontalTrack working |
| 6 | `RocketButton`, `TechPill`, `AnimatedText` | No deps — parallelizable |

**Critical path:** `scroll-store → LenisProvider → Canvas → NebulaSystem + MoonScene → HeroSection`

Nothing scroll-driven can be correctly verified until Phase 1 is complete. ScrollTrigger measurements depend on Lenis having initialized — without it, trigger positions are wrong and the horizontal pin may not fire at the correct scroll depth.

---

## Top Anti-Patterns for This Project

| Anti-Pattern | Failure Mode | Fix |
|---|---|---|
| ScrollTrigger without Lenis sync | Triggers fire at wrong offsets | Wire `ScrollTrigger.update` to Lenis scroll event |
| Canvas inside a scrolling container | Layout recalculation on every repaint | Always `position: fixed` |
| React selector inside `useFrame` | 60fps re-renders from subscription | `getState()` imperative read |
| Multiple canvases for nebula | Silently exceeds browser context limit | One global Canvas |
| `gsap.ticker.add()` without cleanup | Strict Mode + HMR stacks duplicate callbacks, double-speed physics | Capture reference, remove in `useEffect` cleanup |

---

*Research completed: 2026-05-05*
