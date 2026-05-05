# Phase 1: Scroll Foundation — Research

**Researched:** 2026-05-05
**Domain:** Lenis smooth scroll + GSAP ScrollTrigger + Zustand store + Next.js 14 App Router
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Bootstrap with `create-next-app` — TypeScript, ESLint, Tailwind CSS, `src/` directory, App Router. No custom scaffold.
- **D-02:** All dependencies installed upfront in a single install: next, gsap, @gsap/react, lenis, zustand, @react-three/fiber, @react-three/drei, three@^0.168.0, motion, tailwindcss. No incremental per-phase installs.
- **D-03:** Scaffold into `~/portfolio/` directly (`create-next-app .`) — CLAUDE.md and `.planning/` stay in place alongside the app.
- **D-04:** Lenis+GSAP wiring lives in `src/components/lenis-provider/LenisProvider.tsx` (client component). Root `app/layout.tsx` stays a server component — it only imports and renders `<LenisProvider>`.
- **D-05:** Lenis instantiation uses `useLayoutEffect` (runs before paint). All ScrollTrigger registration uses `useGSAP` from `@gsap/react`. StrictMode-safe via `useGSAP` cleanup.
- **D-06:** The 5-step init order is enforced inside `LenisProvider`: (1) `new Lenis()`, (2) `lenis.on('scroll', ScrollTrigger.update)`, (3) `gsap.ticker.add(time => lenis.raf(time * 1000))`, (4) `gsap.ticker.lagSmoothing(0)`, (5) register ScrollTriggers.
- **D-07:** Zustand scroll store is the sole downstream interface — no React context for the lenis instance. Children read scroll state from the store only.
- **D-08:** Store shape: `{ scrollY: number, velocity: number, displayVelocity: number, phase: "vertical" | "transition" | "horizontal", progress: number }`. Raw `lenis.velocity` → `velocity`. Lerped value → `displayVelocity`. Downstream effects always consume `displayVelocity`.
- **D-09:** Scroll zone boundaries: `phase = "vertical"` at 0-40% scroll depth, `"transition"` at 40-55%, `"horizontal"` at 55-100%. `progress` is 0 to 1 within the current zone.
- **D-10:** Store location: `src/lib/scroll-store.ts`. R3F layers read via `getState()` inside `useFrame` — never via React selector subscriptions.
- **D-11:** Phase 1 builds the full pin + translateX wired end-to-end via GSAP ScrollTrigger. Success criterion #3 must be verifiable before Phase 2 starts.
- **D-12:** HorizontalTrack lives at `src/components/horizontal-track/HorizontalTrack.tsx`.
- **D-13:** Phase 1 track renders a visible placeholder band so pin movement can be manually verified without real card content.
- **D-14:** Phase 1 ships a dev-only HUD overlay at `src/components/debug/ScrollDebugHUD.tsx` showing scrollY, velocity, displayVelocity, phase, and progress in real time. Rendered only when `process.env.NODE_ENV === 'development'`.
- **D-15:** `src/lib/gsap.ts` is the single plugin registration site. All components import from here; none call `gsap.registerPlugin` directly.

### Claude's Discretion

- Lerp factor for displayVelocity — 0.1-0.2 range.
- CSS pin approach (sticky vs. GSAP pin:true) — whichever integrates cleanest with Lenis.
- ScrollDebugHUD visual style — functional readability over aesthetics.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Site scrolls smoothly with Lenis, exposing velocity to all visual effects | Lenis 1.3.23 init pattern with `autoRaf: false` + GSAP ticker; `lenis.velocity` available on every scroll event |
| FOUND-02 | Page transitions from vertical (0-40%) to pinned horizontal (55-100%) without jank, transition zone at 40-55% | GSAP ScrollTrigger `pin: true` + `scrub` + `gsap.to(track, { x: ... })` pattern; pinSpacer behavior documented |
| FOUND-03 | Scroll velocity drives visual effects: skewX, blur, nebula spread | `displayVelocity` in Zustand store, lerped each tick; downstream reads via `useScrollStore.getState()` in useFrame |
| FOUND-04 | GSAP ScrollTrigger fires at correct visual offsets (synced to Lenis) | `lenis.on('scroll', ScrollTrigger.update)` — no scrollerProxy needed as of GSAP 3.11+ |
| FOUND-05 | Single GSAP plugin registration site — no duplicate warnings | `src/lib/gsap.ts` exports pre-registered gsap; GSAP team confirms duplicate registrations are harmless but centralization is the pattern |

</phase_requirements>

---

## Summary

Phase 1 establishes the scroll infrastructure that every subsequent phase reads from. The core wiring is Lenis 1.3.23 driving a GSAP ticker loop (with `autoRaf: false` to avoid a double RAF), a `lenis.on('scroll', ScrollTrigger.update)` bridge that keeps ScrollTrigger synced to Lenis's position (no scrollerProxy needed), and a Zustand 5.x store that receives raw velocity and publishes a lerped `displayVelocity` on every tick.

The horizontal track uses GSAP ScrollTrigger's `pin: true` + a `gsap.to(trackEl, { x: ... })` scrubbed timeline. This is the standard pattern confirmed by community examples and the official GSAP docs. A critical version constraint governs the entire stack: Next.js 14.x (not 16.x) is required because R3F 8.x requires React `>=18 <19`, and Next.js 16 requires React 19. The install must explicitly pin `next@14`, `react@18`, `react-dom@18`, `@react-three/fiber@8`, and `@react-three/drei@9`.

The useLayoutEffect + useGSAP split in LenisProvider is intentional: Lenis needs to be created synchronously before paint (useLayoutEffect), but ScrollTrigger registrations must run inside useGSAP to be StrictMode-safe and get automatic cleanup. The `@gsap/react` package implements an isomorphic layout effect internally, so it works correctly under Next.js SSR without extra guards.

**Primary recommendation:** Build LenisProvider in a single `"use client"` component that owns the complete 5-step init order, writes to Zustand on every scroll tick, and keeps `app/layout.tsx` as a server component. Every other component reads scroll state only from the Zustand store — no prop drilling, no context.

---

## Standard Stack

### Critical Version Matrix

> WARNING: `npm install` without explicit version pins will install Next.js 16 (React 19) and R3F 9 (also React 19). These are incompatible with R3F 8 + Three.js 0.168. All version-pinned packages below MUST be explicitly specified.

| Library | Version | Purpose | Constraint Reason |
|---------|---------|---------|------------------|
| next | 14.2.35 | App Router framework | Must use 14.x — 16.x requires React 19, incompatible with R3F 8 |
| react | 18.3.1 | UI runtime | R3F 8.x requires `>=18 <19` |
| react-dom | 18.3.1 | DOM renderer | Matches react |
| gsap | 3.15.0 | Scroll animations, ScrollTrigger | 3.x stable |
| @gsap/react | 2.1.2 | useGSAP hook, StrictMode safety | Companion to gsap 3.x |
| lenis | 1.3.23 | Smooth scroll, velocity exposure | NOT @studio-freight/lenis |
| zustand | 5.0.13 | Scroll state store | getState() for R3F useFrame |
| @react-three/fiber | 8.18.0 | R3F (not used in Phase 1, but pinned in upfront install) | Requires React `<19` |
| @react-three/drei | 9.122.0 | Three.js helpers (not used in Phase 1, pinned upfront) | Peer: R3F 8.x, React ^18 |
| three | 0.168.0 | 3D engine — EXACT pin, no caret | R3F 8 breaks with 0.169+ |
| motion | 12.x | Framer Motion UI animations | v11+ uses "motion" package name |
| tailwindcss | 3.4.19 | CSS utility framework | v3 only — v4 has breaking config changes |

[VERIFIED: npm registry — all versions confirmed 2026-05-05]

### Supporting Libraries (include in upfront install)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.x | Conditional class names | All component className logic |
| tailwind-merge | 2.x | Safe Tailwind class merging | When dynamic Tailwind classes collide |
| sharp | latest | Next.js image optimization | Project card screenshots in Phase 5 |

### Alternatives Considered

| Standard Choice | Alternative | Why Standard Wins |
|----------------|-------------|-------------------|
| GSAP pin:true + scrub | CSS position:sticky | GSAP pin creates a pinSpacer that correctly pushes content; sticky doesn't interplay with Lenis's virtual scroll position |
| zustand getState() in useFrame | React context | Context subscriptions trigger reconciler at 60fps — unacceptable for 3D render loop |
| @gsap/react useGSAP | raw useEffect | useGSAP wraps gsap.context(), auto-reverts on StrictMode double-invoke, isomorphic layout effect built in |
| lenis (manual GSAP ticker) | ReactLenis component | Manual init gives direct access to the instance in same scope as ScrollTrigger wiring; avoids ref forwarding complexity |

**Installation commands:**

```bash
# Step 1: Scaffold (run from ~/portfolio/ — files already present, confirm "non-empty directory" prompt)
npx create-next-app@14 . --typescript --eslint --tailwind --src-dir --app --no-turbo --import-alias "@/*"

# Step 2: Verify Tailwind version (create-next-app may install v4)
# Check package.json — if tailwindcss is v4, downgrade:
# npm install tailwindcss@^3.4.19 autoprefixer postcss

# Step 3: Install all remaining deps upfront (exact three pin — no caret)
npm install gsap @gsap/react lenis zustand motion \
  "@react-three/fiber@^8.18.0" "@react-three/drei@^9.122.0" \
  clsx tailwind-merge sharp
npm install "three@0.168.0"
```

> `three@0.168.0` is an EXACT pin. Install it separately after the bulk install to prevent npm from resolving a range.

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 files)

```
src/
├── app/
│   ├── layout.tsx              # Server component — renders LenisProvider only
│   └── page.tsx                # Placeholder scroll content (tall page + HorizontalTrack)
├── components/
│   ├── lenis-provider/
│   │   └── LenisProvider.tsx   # "use client" — Lenis + GSAP wiring hub
│   ├── horizontal-track/
│   │   └── HorizontalTrack.tsx # "use client" — GSAP pin + placeholder band
│   └── debug/
│       └── ScrollDebugHUD.tsx  # "use client" — dev overlay
└── lib/
    ├── gsap.ts                 # Single plugin registration site
    └── scroll-store.ts         # Zustand store definition
```

### Pattern 1: LenisProvider — 5-Step Init Order

**What:** Client component that creates the Lenis instance, wires GSAP ticker, and populates Zustand on every scroll tick.

**When to use:** Mounted once in `app/layout.tsx` as a wrapper around `{children}`.

**Critical nuance:** Use `useLayoutEffect` for Lenis instantiation (runs synchronously before paint). Use `useGSAP` for any GSAP animations/ScrollTriggers. The Lenis init itself is NOT inside useGSAP — Lenis must be alive before any GSAP animation runs, and useGSAP delays to layout effect timing as well, but gsap.context() revert would destroy the Lenis bridge on StrictMode double-invoke if placed there.

```typescript
// Source: [CITED: gsap.com/community/forums/topic/40426]
//         [CITED: github.com/darkroomengineering/lenis README]
"use client";
import { useLayoutEffect, useRef } from "react";
import Lenis from "lenis";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { useScrollStore } from "@/lib/scroll-store";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useLayoutEffect(() => {
    // Step 1: Create Lenis — autoRaf:false means GSAP ticker drives the loop
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.1,
      syncTouch: true,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    // Step 2: Bridge Lenis position → ScrollTrigger (no scrollerProxy needed)
    lenis.on("scroll", ScrollTrigger.update);

    // Step 3: Drive Lenis from GSAP ticker (single RAF loop)
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);

    // Step 4: Disable lag smoothing (prevents drift on slow/throttled frames)
    gsap.ticker.lagSmoothing(0);

    // Step 5: Write to Zustand store on every Lenis scroll event
    // The scroll callback receives the Lenis instance as its argument
    lenis.on("scroll", (lenisInstance: Lenis) => {
      const total = document.body.scrollHeight - window.innerHeight;
      const rawProgress = total > 0 ? lenisInstance.animatedScroll / total : 0;

      let phase: "vertical" | "transition" | "horizontal";
      let progress: number;
      if (rawProgress < 0.4) {
        phase = "vertical";
        progress = rawProgress / 0.4;
      } else if (rawProgress < 0.55) {
        phase = "transition";
        progress = (rawProgress - 0.4) / 0.15;
      } else {
        phase = "horizontal";
        progress = (rawProgress - 0.55) / 0.45;
      }

      useScrollStore.getState().set({
        scrollY: lenisInstance.animatedScroll,
        velocity: lenisInstance.velocity,
        phase,
        progress,
      });
    });

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
```

> Use `useScrollStore.getState().set(...)` inside the scroll callback — NOT a React hook call. This is the vanilla Zustand imperative API, safe to call outside React render.

### Pattern 2: GSAP Single Registration File

**What:** `src/lib/gsap.ts` imports and registers all plugins once; every other file imports from here.

**Why it prevents SSR crashes:** This file must only be imported from `"use client"` components. The plugin registration calls internal DOM APIs. Centralizing in one file makes the import dependency graph auditable — if any server component accidentally imports this, the error is traceable to one file.

**GSAP team confirmation:** Multiple `registerPlugin` calls are idempotent — no error, no warning, no duplicate instances. Centralization is a cleanliness pattern, not a correctness requirement. [CITED: gsap.com/community/forums/topic/40634]

```typescript
// src/lib/gsap.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default gsap;
export { ScrollTrigger };
```

**Import pattern in all components:**

```typescript
// Correct — imports from the single registration site
import gsap, { ScrollTrigger } from "@/lib/gsap";

// NEVER — bypasses centralization, risks SSR if imported from wrong context
import { ScrollTrigger } from "gsap/ScrollTrigger";
```

### Pattern 3: Zustand Scroll Store with displayVelocity Lerp

**What:** Store that publishes raw + lerped velocity. The lerp happens inside the `set` action so it's co-located with state.

**Why getState() over useStore() in R3F:** `useStore()` inside `useFrame` would trigger React reconciler at 60fps. `getState()` reads directly from the store's vanilla JS object — zero React overhead. [CITED: github.com/pmndrs/zustand]

```typescript
// src/lib/scroll-store.ts
import { create } from "zustand";

type ScrollPhase = "vertical" | "transition" | "horizontal";

interface ScrollState {
  scrollY: number;
  velocity: number;
  displayVelocity: number; // lerped — downstream visual effects use this
  phase: ScrollPhase;
  progress: number;        // 0-1 within the current phase zone
  set: (partial: Partial<Omit<ScrollState, "set" | "displayVelocity">>) => void;
}

const LERP_FACTOR = 0.15; // [ASSUMED] — 0.1-0.2 range per discretion; tune during execution

export const useScrollStore = create<ScrollState>((set, get) => ({
  scrollY: 0,
  velocity: 0,
  displayVelocity: 0,
  phase: "vertical",
  progress: 0,
  set: (partial) =>
    set((state) => ({
      ...partial,
      displayVelocity:
        state.displayVelocity +
        ((partial.velocity ?? state.velocity) - state.displayVelocity) * LERP_FACTOR,
    })),
}));

// R3F useFrame pattern (used in Phase 3+ components — documented here for planner):
// import { useScrollStore } from "@/lib/scroll-store";
// useFrame(() => {
//   const { displayVelocity, phase } = useScrollStore.getState();
// });
```

### Pattern 4: HorizontalTrack — GSAP pin + scrub

**What:** A section that gets pinned by ScrollTrigger while its inner track slides left as the user scrolls vertically.

**Decision: GSAP pin:true over CSS sticky.** CSS `position: sticky` with Lenis produces position drift because Lenis's `animatedScroll` differs from `window.scrollY`. GSAP ScrollTrigger's pin mechanism is aware of the Lenis bridge and positions correctly.

**Pinned element vs. animated element:** GSAP docs explicitly warn: "don't animate the pinned element itself because that will throw off the measurements." The outer `<section>` is pinned. The inner track `<div>` is animated with `x`.

**The `scrub` value:** `scrub: 1` means the playhead takes 1 second to catch up to the scrollbar — this gives an inertia feel that complements Lenis smoothing. Can be tuned to `scrub: true` (instant) or higher values during execution.

```typescript
// Source: [CITED: gsap.com/docs/v3/Plugins/ScrollTrigger/]
// src/components/horizontal-track/HorizontalTrack.tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";

export default function HorizontalTrack({ children }: { children: React.ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: "none", // REQUIRED for scrub — must be linear
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,        // reduces jitter at pin entry point
          invalidateOnRefresh: true, // recalculates on window resize
          markers: process.env.NODE_ENV === "development",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} style={{ overflow: "hidden" }}>
      <div
        ref={trackRef}
        style={{
          display: "flex",
          width: "max-content",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </section>
  );
}
```

**Phase 1 placeholder usage in page.tsx:**

```tsx
// The track needs enough width to demonstrate actual movement
// Three 100vw slots = 2 viewports of horizontal travel
<HorizontalTrack>
  {["#1a1a3e", "#1a2e3e", "#2e1a3e"].map((bg, i) => (
    <div
      key={i}
      style={{ width: "100vw", height: "100vh", background: bg, flexShrink: 0 }}
    >
      Placeholder {i + 1}
    </div>
  ))}
</HorizontalTrack>
```

**Page structure for correct zone boundaries:**
The document must be tall enough so that 55% scroll depth aligns with the HorizontalTrack trigger start. This requires content above the track to occupy ~55% of total scroll distance. For Phase 1, a tall spacer div above the track achieves this.

### Pattern 5: ScrollDebugHUD

**What:** Fixed overlay that reads from Zustand and re-renders on every scroll tick. The only component in this phase that legitimately uses React subscriptions to scroll state (because it's a UI display component, not a 3D effect).

```typescript
// src/components/debug/ScrollDebugHUD.tsx
"use client";
import { useScrollStore } from "@/lib/scroll-store";

export default function ScrollDebugHUD() {
  if (process.env.NODE_ENV !== "development") return null;

  const scrollY = useScrollStore((s) => s.scrollY);
  const velocity = useScrollStore((s) => s.velocity);
  const displayVelocity = useScrollStore((s) => s.displayVelocity);
  const phase = useScrollStore((s) => s.phase);
  const progress = useScrollStore((s) => s.progress);

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        color: "#00ff88",
        fontFamily: "monospace",
        fontSize: 11,
        padding: "8px 12px",
        borderRadius: 4,
        pointerEvents: "none",
        lineHeight: 1.8,
        minWidth: 200,
      }}
    >
      <div>scrollY: {scrollY.toFixed(1)}</div>
      <div>velocity: {velocity.toFixed(3)}</div>
      <div>displayVelocity: {displayVelocity.toFixed(3)}</div>
      <div>phase: {phase}</div>
      <div>progress: {(progress * 100).toFixed(1)}%</div>
    </div>
  );
}
```

> `process.env.NODE_ENV !== "development"` is evaluated at build time by Next.js. In production, the entire HUD is tree-shaken out — no information leakage.

### Anti-Patterns to Avoid

- **Double RAF loop:** Lenis with `autoRaf: true` (the default) AND `gsap.ticker.add`. Creates two competing loops causing jitter and erratic velocity readings. Always set `autoRaf: false`.
- **ScrollTrigger before Lenis bridge:** Creating any ScrollTrigger before `lenis.on('scroll', ScrollTrigger.update)`. Triggers fire at native `scrollY` offsets, not Lenis's animated position.
- **Raw useEffect for ScrollTrigger:** React 18 StrictMode double-invokes effects. The second invocation creates a duplicate trigger before the first's cleanup fires. `useGSAP` handles this correctly.
- **useStore() in useFrame:** Subscribing to Zustand via React hook inside `useFrame` forces 60fps reconciler activity. Use `useScrollStore.getState()` instead.
- **Animating the pinned element:** GSAP docs: "don't animate the pinned element itself because that will throw off the measurements." Pin the outer section, animate the inner track.
- **`next` without version pin:** `npm install next` installs v16 (React 19), incompatible with R3F 8.
- **`three` with caret:** `"three": "^0.168.0"` in package.json permits 0.169+ on the next `npm install`. Use exact `"three": "0.168.0"`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scroll with velocity | Manual scroll event + delta tracking | `lenis` 1.3.x | Lenis exposes `velocity` natively; manual delta is jittery and frame-rate dependent |
| GSAP cleanup under StrictMode | Custom cleanup refs in useEffect | `useGSAP` from `@gsap/react` | useGSAP wraps gsap.context() — all animations auto-revert on unmount; handles double-invoke |
| Scroll state across tree | React Context with scroll listener | Zustand store | Context triggers full subtree re-render; Zustand getState() is zero-cost in R3F loops |
| Horizontal scroll math | Manual window.scrollY + transform calc | GSAP ScrollTrigger scrub | ScrollTrigger handles resize, pinSpacer, scroll math, progress normalization |
| Velocity lerp | Custom requestAnimationFrame lerp loop | Zustand set action with lerp | Lenis drives the RAF; lerp inside the store's set() keeps all math in one place |
| ScrollTrigger–Lenis sync | Custom scrollerProxy configuration | `lenis.on('scroll', ScrollTrigger.update)` | scrollerProxy is no longer needed as of GSAP 3.11 (2022); the event bridge is sufficient |

**Key insight:** The scroll infrastructure intersects SSR, StrictMode, mobile touch events, and RAF synchronization. Each listed item has at least one non-obvious edge case that the library solves and hand-rolled code invariably misses.

---

## Common Pitfalls

### Pitfall 1: Double RAF (autoRaf: true + gsap.ticker)

**What goes wrong:** Scroll is jittery; animations advance at irregular intervals; velocity readings oscillate wildly in the HUD.
**Why it happens:** Lenis runs its own `requestAnimationFrame` loop by default (`autoRaf` now defaults to `false` in 1.x, but verify). GSAP also drives a RAF. Two callbacks update Lenis position on slightly offset frames.
**How to avoid:** Always instantiate Lenis with `{ autoRaf: false }`. Verify in the Lenis constructor call.
**Warning signs:** Velocity values in HUD oscillating high-low-high each frame. Scroll feeling "stepped."

[VERIFIED: GSAP community forums + Lenis 1.x README]

### Pitfall 2: ScrollTrigger Offset Drift

**What goes wrong:** A ScrollTrigger fires too early or too late — the visual trigger point doesn't match the scroll position shown in the HUD.
**Why it happens:** A ScrollTrigger was created before `lenis.on('scroll', ScrollTrigger.update)` was called. ScrollTrigger uses native `window.scrollY` for its state instead of Lenis's `animatedScroll`.
**How to avoid:** Enforce the 5-step init order. Step 2 (lenis.on bridge) must precede step 5 (register ScrollTriggers).
**Warning signs:** ScrollTrigger `markers: true` shows trigger points that don't align with where the animation visually fires.

[VERIFIED: gsap.com/community/forums/topic/34814]

### Pitfall 3: React 18 StrictMode Double-Invoke

**What goes wrong:** ScrollTriggers are created twice in development; scroll callbacks run twice per event; cleanup fires at unexpected times.
**Why it happens:** React 18 StrictMode double-invokes effects in development. Raw `useEffect` creates a trigger, React runs cleanup, then creates it again — but the cleanup may kill state the second invocation needs.
**How to avoid:** Use `useGSAP` for all ScrollTrigger creation. It uses `gsap.context()` internally, which reverts the first context cleanly before the second runs.
**Warning signs:** Duplicate console logs from the same effect; ScrollTriggers behave oddly in dev but correctly in production.

[CITED: github.com/greensock/react — useGSAP documentation]

### Pitfall 4: SSR Crash from GSAP Registration

**What goes wrong:** Build fails with "ReferenceError: window is not defined" or "document is not defined".
**Why it happens:** `gsap.registerPlugin(ScrollTrigger)` calls internal DOM APIs. If `src/lib/gsap.ts` is imported by any Server Component (including indirectly), Next.js executes it during server-side build.
**How to avoid:** `src/lib/gsap.ts` must only be imported from `"use client"` components. Never import it in `app/layout.tsx` (server component) — import `LenisProvider` there instead.
**Warning signs:** Build error with "window is not defined" traceable to gsap.ts in the import chain.

[VERIFIED: gsap.com/community/forums/topic/40634 — Rodrigo's guidance]

### Pitfall 5: Next.js / React / R3F Version Mismatch

**What goes wrong:** npm resolves R3F 9 (needs React 19) or Next.js 16 (needs React 19), breaking the R3F 8 peer dependency requirement.
**Why it happens:** Running `npm install next @react-three/fiber` without version constraints installs latest of each: next@16 + react@19 + R3F@9. R3F 8.x requires `react >=18 <19`.
**How to avoid:** Always pin in the install command. Check `package.json` after install to confirm versions.
**Warning signs:** npm warns about peer dependency conflicts during install; TypeScript errors about React type version mismatches.

[VERIFIED: npm registry — R3F 8.17.14 peerDependencies: `"react": ">=18 <19"`]

### Pitfall 6: pinSpacer Blank Space After Trigger Kill

**What goes wrong:** After the horizontal zone exits view (or a trigger is killed programmatically), a blank space appears in the document equal to the pin duration.
**Why it happens:** ScrollTrigger creates a `pin-spacer` div. When the trigger is killed, the spacer is removed but subsequent trigger calculations were based on the document height WITH the spacer present.
**How to avoid:** Call `ScrollTrigger.refresh()` after killing any `pin: true` trigger. Phase 1 has only one pin trigger that is never killed — this is a Phase 5 concern. Document here to prevent the issue when real cards are added.
**Warning signs:** Large whitespace gap appearing below the horizontal section after navigating away and back.

[VERIFIED: gsap.com/community/forums/topic/44795 — solved July 2025]

### Pitfall 7: create-next-app Installs Tailwind v4

**What goes wrong:** `tailwind.config.js` is missing or has v4 format; `@apply` directives fail; CSS variables in `:root` not recognized.
**Why it happens:** `create-next-app --tailwind` installs the `latest` Tailwind tag, which is v4 in 2026. v4 uses a completely different config format from v3.
**How to avoid:** After scaffolding, check `package.json` for `"tailwindcss"` version. If v4, immediately run `npm install tailwindcss@^3.4.19 autoprefixer postcss` and verify `tailwind.config.js` is in v3 format.
**Warning signs:** `tailwind.config.ts` exists instead of `tailwind.config.js`; Tailwind classes have no effect; build fails on `@apply`.

[VERIFIED: npm registry — tailwindcss@latest is 4.2.4; 3.4.19 is latest 3.x]

---

## Code Examples

### Lenis Scroll Event — Available Properties

```typescript
// Source: [CITED: github.com/darkroomengineering/lenis README]
// The scroll callback receives the Lenis instance itself (not a separate event object)
lenis.on("scroll", (lenis: Lenis) => {
  lenis.animatedScroll  // number — current SMOOTH scroll value in px (use this for scrollY)
  lenis.actualScroll    // number — browser-registered native scroll value in px
  lenis.velocity        // number — current scroll velocity (raw)
  lenis.lastVelocity    // number — previous frame's velocity
  lenis.direction       // 1 (scrolling down) | -1 (scrolling up)
  lenis.progress        // number 0–1 — full-page scroll progress
  lenis.isScrolling     // "smooth" | "native" | false
});
```

> Always use `lenis.animatedScroll` (not `lenis.actualScroll`) for the store's `scrollY`. ScrollTrigger sees `animatedScroll` too — keeping them aligned is what prevents offset drift.

### useGSAP — Correct Signatures

```typescript
// Source: [CITED: github.com/greensock/react]

// With scope (preferred for component-scoped animations)
useGSAP(() => {
  gsap.to(".box", { x: 100 });
}, { scope: containerRef });

// With dependencies (re-runs when deps change; does NOT revert by default)
useGSAP(() => {
  gsap.to(el, { x: distance });
}, { scope: containerRef, dependencies: [distance] });

// With revertOnUpdate (reverts and recreates on every dependency change)
useGSAP(() => {
  gsap.to(el, { x: distance });
}, { scope: containerRef, dependencies: [distance], revertOnUpdate: true });

// contextSafe — for event handlers defined outside useGSAP callback
const { contextSafe } = useGSAP({ scope: containerRef });
const handleClick = contextSafe(() => {
  gsap.to(".box", { rotation: 360 });
});
```

### Zustand getState() in R3F useFrame

```typescript
// Source: [CITED: github.com/pmndrs/zustand — getState outside React]
// Inside a React Three Fiber component — zero React reconciler overhead
import { useFrame } from "@react-three/fiber";
import { useScrollStore } from "@/lib/scroll-store";

function NebulaLayer() {
  useFrame(() => {
    const { displayVelocity, phase } = useScrollStore.getState();
    // Apply velocity-driven visual effects here
  });
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| scrollerProxy() for Lenis | `lenis.on('scroll', ScrollTrigger.update)` | GSAP 3.11 (2022) | Simpler init — no proxy config needed |
| `@studio-freight/lenis` | `lenis` package | 2023 — darkroomengineering fork | Old package is unmaintained; API surface is the same |
| `useEffect` + manual cleanup for GSAP | `useGSAP` from `@gsap/react` | 2023 | StrictMode safety built in; no manual `.kill()` needed |
| React context for scroll state | Zustand getState() in useFrame | R3F best practice (ongoing) | Context triggers reconciler; getState() is zero-cost |
| `framer-motion` package name | `motion` package name | Framer Motion 11 (2024) | Install `motion` not `framer-motion` |
| `smoothTouch: true` Lenis option | `syncTouch: true` | Lenis 1.x | Old option name no longer exists |
| `smooth: true` Lenis option | `duration`/`lerp` config | Lenis 1.x | Replaced by numeric controls |

**Deprecated/outdated:**

- `@studio-freight/lenis` and `@studio-freight/react-lenis`: Both unmaintained. Import from `lenis` and `lenis/react` respectively.
- `ScrollTrigger.scrollerProxy()` for Lenis: No longer needed. The `.on('scroll', ScrollTrigger.update)` bridge is sufficient as of GSAP 3.11.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `create-next-app@14 --tailwind` may install tailwindcss v4 | Standard Stack / Pitfall 7 | Planner must include a Tailwind version verification step immediately after scaffolding |
| A2 | `scrub: 1` creates an acceptable inertia feel matching Lenis smoothing | Pattern 4 | May need tuning during execution; value is within planner/executor discretion |
| A3 | `LERP_FACTOR = 0.15` produces visually smooth displayVelocity | Pattern 3 | Tune if HUD shows displayVelocity lagging too far behind rapid direction changes |
| A4 | `anticipatePin: 1` reduces pin-start jitter without side effects | Pattern 4 | Community reports mixed results; remove if it causes unexpected behavior |
| A5 | `autoRaf` defaults to `false` in Lenis 1.3.x | Pitfall 1 | Verify by checking Lenis constructor defaults; include explicit `autoRaf: false` to be safe regardless |

---

## Open Questions

1. **create-next-app with existing files**
   - What we know: `CLAUDE.md` and `.planning/` already exist in the target directory. `create-next-app` warns on non-empty directories.
   - What's unclear: Whether the interactive prompt or `--yes` flag is the right approach. `--yes` may overwrite files.
   - Recommendation: Run without `--yes`, handle the non-empty directory prompt manually. Verify CLAUDE.md is intact after scaffolding.

2. **Tailwind v3 config after create-next-app@14**
   - What we know: Tailwind v4 is the `latest` npm tag. create-next-app's `--tailwind` flag typically installs `latest`.
   - What's unclear: Whether create-next-app@14 specifically pins Tailwind v3 internally.
   - Recommendation: After scaffolding, immediately check `package.json` for tailwindcss version before any other work.

3. **Lenis CSS import requirement**
   - What we know: One integration guide imports `"lenis/dist/lenis.css"`. README does not mention it as required.
   - What's unclear: Whether the CSS prevents a flash of native scrollbar during Lenis initialization.
   - Recommendation: Import `lenis/dist/lenis.css` in LenisProvider to be safe; verify the file exists in the installed package before importing.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, dev server | ✓ | 18.20.8 | — |
| npm | Package install | ✓ | 10.8.2 | — |
| npx | create-next-app scaffolding | ✓ | 10.8.2 | — |
| git | Repository | ✓ | (repo exists) | — |
| next@14 (to install) | App Router framework | not yet | 14.2.35 target | — |
| gsap (to install) | Scroll animations | not yet | 3.15.0 target | — |
| lenis (to install) | Smooth scroll | not yet | 1.3.23 target | — |
| zustand (to install) | State store | not yet | 5.0.13 target | — |

[VERIFIED: bash — node --version, npm --version confirmed 2026-05-05]

Node 18.20.8 meets Next.js 14's `>=18.17.0` engine requirement. [VERIFIED: npm registry]

**Missing dependencies with no fallback:** All required packages are npm-installable. No system-level dependencies beyond Node.js are required for Phase 1.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Not yet installed — Wave 0 must establish |
| Config file | none — see Wave 0 gaps |
| Quick run command | `npm test -- scroll-store` (after Wave 0) |
| Full suite command | `npm test` (after Wave 0) |

> Phase 1 is scroll infrastructure with no DOM interaction surface. Unit tests covering store logic (phase boundaries, lerp math) are the highest-value automated coverage. Scroll smoothness and HUD live-update verification are necessarily manual for this phase.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Lenis init runs and velocity is defined on tick | unit (store) | `npm test -- scroll-store` | ❌ Wave 0 |
| FOUND-02 | Phase boundaries compute correctly at 0%, 40%, 55%, 100% progress | unit (store) | `npm test -- scroll-store` | ❌ Wave 0 |
| FOUND-03 | displayVelocity lerps toward velocity over successive set() calls | unit (store) | `npm test -- scroll-store` | ❌ Wave 0 |
| FOUND-04 | ScrollTrigger fires at Lenis position, not native scrollY | manual | Scroll to 50% → confirm HUD shows `phase="transition"` | N/A |
| FOUND-05 | No duplicate plugin warnings in console | manual | Open devtools → scroll → zero "GSAP plugin already registered" warnings | N/A |

### Sampling Rate

- **Per task commit:** `npm test -- scroll-store` (store unit tests only — runs in < 5s)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + all 5 manual success criteria verified before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/lib/__tests__/scroll-store.test.ts` — covers FOUND-01, FOUND-02, FOUND-03
- [ ] `vitest.config.ts` — framework config (recommended over Jest for Next.js 14 App Router)
- [ ] `vitest.setup.ts` — jsdom environment, window/document mocks
- [ ] Framework install: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom`

**Why Vitest over Jest:** Next.js 14 with App Router + TypeScript requires less configuration with Vitest. No babel transform patches needed; native ESM support; faster than Jest for this use case.

---

## Security Domain

> Phase 1 is pure client-side scroll infrastructure — no authentication, no user input, no data persistence, no API calls, no external resources loaded. ASVS categories V2, V3, V4, V6 do not apply.

| ASVS Category | Applies | Notes |
|---------------|---------|-------|
| V2 Authentication | No | No auth in this phase |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No access control |
| V5 Input Validation | No | No user input |
| V6 Cryptography | No | No secrets or crypto |

**One surface to note:** `ScrollDebugHUD` is gated by `process.env.NODE_ENV === 'development'`. Next.js replaces this constant at build time — the HUD is fully tree-shaken in production builds. Zero information leakage risk.

---

## Sources

### Primary (HIGH confidence)

- npm registry (`npm view [package] version`) — all versions verified 2026-05-05
- [GSAP ScrollTrigger Docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — pin, scrub, markers, invalidateOnRefresh, pinSpacer behavior
- [Lenis GitHub README](https://github.com/darkroomengineering/lenis) — scroll event callback properties, constructor options, autoRaf, raf() method
- [greensock/react GitHub](https://github.com/greensock/react) — useGSAP signatures, scope, dependencies, revertOnUpdate, contextSafe, cleanup
- [pmndrs/zustand GitHub](https://github.com/pmndrs/zustand) — getState() outside React components pattern

### Secondary (MEDIUM confidence)

- [GSAP Community: Lenis ScrollTrigger sync patterns](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/) — no scrollerProxy needed confirmed
- [GSAP Community: Plugin registration in Next.js App Router](https://gsap.com/community/forums/topic/40634-good-way-to-register-gsap-plugins-in-nextjs-app-router-and-how-many-many-times-we-can-do-it/) — Rodrigo: duplicate registration is idempotent
- [GSAP Community: pinSpacer blank space fix](https://gsap.com/community/forums/topic/44795-scrolltrigger-once-with-pin-and-scrub-lenis-creates-a-blank-space/) — ScrollTrigger.refresh() solution, solved July 2025
- [GSAP Community: scrollerProxy no longer needed](https://gsap.com/community/forums/topic/34814-scrolltrigger-with-lenis-smooth-scroll-problem-with-the-scrollerproxy-setup/) — GSAP 3.11+ bridge pattern
- [DevDreaming: Lenis + GSAP Next.js 2026 guide](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) — autoRaf:false pattern confirmed
- [Bridger Tower: Lenis in Next.js](https://bridger.to/lenis-nextjs) — provider architecture reference

### Tertiary (LOW confidence — marked ASSUMED)

- A2 (scrub: 1 inertia feel), A3 (lerp 0.15), A4 (anticipatePin: 1) — tuning values from community examples, require hands-on adjustment during execution

---

## Metadata

**Confidence breakdown:**

- Standard Stack: HIGH — all versions verified against npm registry
- Architecture Patterns: HIGH — sourced from GSAP official docs and Lenis official README
- Pitfalls 1-6: HIGH — sourced from GSAP community staff responses (Rodrigo) or official docs
- Pitfall 7 (Tailwind): MEDIUM — inferred from npm registry state; actual create-next-app@14 behavior needs confirmation at execution time
- Tuning values (lerp, scrub, anticipatePin): LOW — reasonable defaults from community examples, adjust during execution

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (30 days — stable library ecosystem; re-verify three@0.168.0 availability if start is delayed)
