# Research Summary — Kameron Benjamin Portfolio

*Synthesized: 2026-05-05 | Confidence: HIGH*

---

## Recommended Stack

Next.js 14 App Router with React Three Fiber 8.x (Three.js pinned to <=0.168.0 to avoid R3F peer dep conflicts), GSAP 3.x with ScrollTrigger, Lenis (package name: `lenis` — NOT `@studio-freight/lenis`, which is dead), Framer Motion 11.x (package name: `motion`), and Tailwind CSS v3.x (not v4, which is still beta). Add `@gsap/react` for the `useGSAP` hook — mandatory under React 18 StrictMode. Supporting packages: `@react-three/drei` for texture/geometry helpers, `clsx` + `tailwind-merge` for class utilities, `sharp` for image optimization, and optionally `@react-three/postprocessing` for bloom on the nebula.

---

## Table Stakes Features

- Name and role legible within 5 seconds — legibility wins over aesthetics if they conflict
- 2-3 real projects with tech stack visible and working links (Green Guardian, CubeCoach qualify)
- Contact reachability — rocket CTA must resolve to something real (email reveal + copy + mailto)
- Mobile usable at 375px — replace 3D with CSS equivalents, not degrade
- Load time not punishing — dynamic imports, NASA textures compressed to 2048px max WebP/JPEG
- Reduced motion fallback — `--motion-ok: 1` CSS custom property on `:root`, cannot be retrofitted
- OG image + correct meta tags with recruiter keywords
- No 404s — pre-launch link audit

---

## Differentiating Features

- Photorealistic moon hero with NASA displacement + normal maps, entrance lerp over ~2.5s
- Velocity-responsive nebula breathe — 6-layer parallax system that reacts to scroll speed
- Live R3F Rubik's cube embedded in CubeCoach card — demo inside portfolio, not a link away
- Vertical to horizontal scroll transition at 40-55% scroll depth
- "Beyond the Code" personality strip — sousaphone, dance, garden, etc. — what recruiters remember
- Rocket hire button with particle trail — delight at the exact moment of hiring intent
- Journey timeline with moon/planet nodes — space-themed career progression
- CSS grain/scanline overlay — cinematic, not "dark mode"
- Interstitial nebula gaps between cards — continuity = immersion

---

## Architecture Decisions

- **One global Canvas fixed at z-index 0, pointer-events none** in `app/layout.tsx`. Multiple canvases silently hit the browser 8-context limit and clip the nebula to section bounding boxes. The CubeCoach card gets one isolated Canvas as the sole justified exception.
- **Lenis initializes before any ScrollTrigger registration.** Non-negotiable order: create Lenis → `lenis.on('scroll', ScrollTrigger.update)` → `gsap.ticker.add(time => lenis.raf(time * 1000))` → `gsap.ticker.lagSmoothing(0)` → then register ScrollTriggers. Wrong order means triggers fire at incorrect visual offsets.
- **Zustand scroll store as single source of truth** (`scrollY`, `velocity`, `phase`, `progress`). R3F layers read via `getState()` inside `useFrame` — never via React selector subscriptions, which create 60fps reconciler overhead.
- **Strict animation ownership:** Framer Motion owns mount/unmount transitions and hover states. GSAP owns all scroll-driven motion. Never let both target `transform` on the same element.
- **Organize by feature surface, not file type.** `components/canvas/` is strictly R3F-only (no DOM imports). Each section collocates its CSS (`hero.css` next to `HeroSection.tsx`) making sections independently deletable.

---

## Top Pitfalls to Avoid

1. **R3F Canvas on SSR** — `'use client'` does not prevent server execution; every Canvas needs `next/dynamic` with `{ ssr: false }`.
2. **GSAP StrictMode double-fire** — use `useGSAP` from `@gsap/react` everywhere, never raw `useEffect` for ScrollTrigger.
3. **Lenis + ScrollTrigger desync** — enforce the 5-step init order in `LenisProvider`; any ScrollTrigger created before the bridge is wired fires at the wrong position.
4. **Mobile GPU overload** — cap `dpr={[1, 1.5]}` on Canvas, reduce nebula particles to 200/layer on mobile, use `frameloop="demand"` in static sections.
5. **Three.js memory leaks** — dispose particle BufferGeometry and PointsMaterial on unmount; never dispose textures loaded via `useTexture` (Drei owns those).

---

## Recommended Build Order

1. **Scroll foundation** — `scroll-store.ts` (Zustand), `LenisProvider` (full GSAP wiring), `lib/gsap.ts` (single plugin registration site), `useGSAP` baseline, `HorizontalTrack` stub. Nothing scroll-driven can be verified until this is complete.
2. **Moon hero** — global Canvas in layout, `MoonScene` with NASA textures via `useTexture` + Suspense, entrance lerp, DPR cap, disposal patterns. Establishes all texture/memory patterns.
3. **Nebula system** — 6-layer `NebulaSystem` + sublayers, velocity pipeline (lerped `displayVelocity` → Zustand → `useFrame` `getState()`), nebula breathe effect. Mobile particle limits enforced here.
4. **Hero section** — `HeroSection` + `HeroText`, name fade-in, subtitle typeout, CSS grain overlay, reduced motion fallback wired.
5. **Project cards (horizontal zone)** — `HorizontalTrack` fully implemented, `ProjectCard` base, `GreenGuardianCard`, `CubeScene` + `CubeCoachCard`, `PlaceholderCard`. Touch behavior + scroll restoration built into initial implementation.
6. **Personality + timeline** — `PersonalityStrip`, `StrikersSection`, `JourneyTimeline` with planet nodes. Depends on horizontal track working.
7. **Rocket CTA + UI components** — `RocketButton`, `TechPill`, `AnimatedText`. Parallelizable with Phase 6.
8. **Polish + mobile** — mobile layout (CSS moon, vertical card stack), backdrop-filter pass, OG image, performance audit, pre-launch link check.

---

## Open Questions

1. **What does the rocket CTA reveal?** Email address, Formspree endpoint, or mailto link — must be decided before Phase 7 so the reveal state is designed correctly.
2. **NASA texture resolution budget** — do compressed textures fit within the 300kb JS budget, or does KTX2 compression need to be added to the Phase 1 asset pipeline?
3. **CubeCoach card canvas strategy** — isolated Canvas inside the card DOM, or a portal to a shared offscreen canvas? (Current recommendation: isolated — one extra context stays within browser limits.)
4. **Contact secondary option** — Calendly as a secondary link after email reveal? Needs a decision before Phase 7.
