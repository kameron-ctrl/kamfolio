# Phase 1: Scroll Foundation — Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire Lenis + GSAP ScrollTrigger + Zustand so every downstream phase has a verified, synced scroll source of truth. Delivers: smooth scroll, vertical→horizontal pin working end-to-end, velocity pipeline publishing to Zustand, dev HUD confirming all values update in real time.

Does NOT include: 3D canvas, moon, nebula, any visual effects — those consume the pipeline built here.

</domain>

<decisions>
## Implementation Decisions

### Project Scaffold
- **D-01:** Bootstrap with `create-next-app` — TypeScript, ESLint, Tailwind CSS, `src/` directory, App Router. No custom scaffold.
- **D-02:** All dependencies installed upfront in a single install: next, gsap, @gsap/react, lenis, zustand, @react-three/fiber, @react-three/drei, three@^0.168.0, motion, tailwindcss. No incremental per-phase installs.
- **D-03:** Scaffold into `~/portfolio/` directly (`create-next-app .`) — CLAUDE.md and `.planning/` stay in place alongside the app.

### LenisProvider Architecture
- **D-04:** Lenis+GSAP wiring lives in a dedicated `src/components/lenis-provider/LenisProvider.tsx` client component. Root `app/layout.tsx` stays a server component — it only imports and renders `<LenisProvider>`.
- **D-05:** Lenis instantiation uses `useLayoutEffect` (runs before paint). All ScrollTrigger registration uses `useGSAP` from `@gsap/react`. StrictMode-safe via `useGSAP` cleanup.
- **D-06:** The 5-step init order is enforced inside `LenisProvider`: (1) `new Lenis()`, (2) `lenis.on('scroll', ScrollTrigger.update)`, (3) `gsap.ticker.add(time => lenis.raf(time * 1000))`, (4) `gsap.ticker.lagSmoothing(0)`, (5) register ScrollTriggers.
- **D-07:** Zustand scroll store is the sole downstream interface — no React context for the lenis instance. Children read scroll state from the store only.

### Zustand Scroll Store
- **D-08:** Store shape: `{ scrollY: number, velocity: number, displayVelocity: number, phase: "vertical" | "transition" | "horizontal", progress: number }`. Raw `lenis.velocity` → `velocity`. Lerped value → `displayVelocity`. Downstream effects always consume `displayVelocity`.
- **D-09:** Scroll zone boundaries: `phase = "vertical"` at 0-40% scroll depth, `"transition"` at 40-55%, `"horizontal"` at 55-100%. `progress` is 0 to 1 within the current zone.
- **D-10:** Store location: `src/lib/scroll-store.ts`. R3F layers read via `getState()` inside `useFrame` — never via React selector subscriptions.

### HorizontalTrack Phase 1 Scope
- **D-11:** Phase 1 builds the full pin + translateX wired end-to-end via GSAP ScrollTrigger. Success criterion #3 must be verifiable before Phase 2 starts.
- **D-12:** HorizontalTrack lives at `src/components/horizontal-track/HorizontalTrack.tsx`.
- **D-13:** Phase 1 track renders a visible placeholder band so pin movement can be manually verified without real card content.

### Velocity Pipeline Phase 1 Outputs
- **D-14:** Phase 1 ships a dev-only HUD overlay at `src/components/debug/ScrollDebugHUD.tsx` showing scrollY, velocity, displayVelocity, phase, and progress in real time. Rendered only when `process.env.NODE_ENV === 'development'`.
- **D-15:** `src/lib/gsap.ts` is the single plugin registration site. All components import from here; none call `gsap.registerPlugin` directly.

### Claude's Discretion
- Lerp factor for displayVelocity — 0.1-0.2 range.
- CSS pin approach (sticky vs. GSAP pin:true) — whichever integrates cleanest with Lenis.
- ScrollDebugHUD visual style — functional readability over aesthetics.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Documents
- `.planning/research/STACK.md` — validated stack, critical version pins
- `.planning/research/SUMMARY.md` — architecture decisions and top pitfalls
- `.planning/REQUIREMENTS.md` — FOUND-01 through FOUND-05 acceptance criteria
- `.planning/ROADMAP.md` Phase 1 section — success criteria checklist

### Critical Constraints
- Three.js must be pinned to `^0.168.0` — R3F 8.x breaks with 0.169+
- GSAP StrictMode: must use `@gsap/react` useGSAP, not raw useEffect
- Lenis init order is non-negotiable — wrong order breaks ScrollTrigger offsets

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — codebase is empty. Phase 1 establishes all foundational patterns.

### Integration Points
- `app/layout.tsx` — wraps LenisProvider and later the global R3F Canvas
- `src/lib/scroll-store.ts` — all phases read from here; must exist before Phase 2
- `src/lib/gsap.ts` — every component that uses GSAP imports from here

</code_context>

<specifics>
## Specific Ideas

- Dev HUD must show values visibly updating while scrolling — proves pipeline is live.
- Horizontal placeholder must be wide enough to require actual translateX movement.
- Visual polish deferred to Phase 2 — Phase 1 is pure infrastructure.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-scroll-foundation*
*Context gathered: 2026-05-05*
