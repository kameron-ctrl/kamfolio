# Phase 4: Hero Section — Pattern Map

**Mapped:** 2026-05-17
**Files analyzed:** 6 new/modified files
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/hero/HeroOverlay.tsx` | component | event-driven (mount timer + signal) | `src/components/horizontal-track/HorizontalTrack.tsx` | role-match |
| `src/hooks/useTypewriter.ts` | hook | event-driven (interval + signal gate) | `src/lib/scroll-store.ts` | role-match |
| `src/styles/tokens.css` | config | — | `src/styles/tokens.css` (modify in-place) | exact |
| `src/app/globals.css` | config | — | `src/app/globals.css` (modify in-place) | exact |
| `src/app/layout.tsx` | config | request-response | `src/app/layout.tsx` (modify in-place) | exact |
| `src/app/page.tsx` | component | request-response | `src/app/page.tsx` (modify in-place) | exact |
| `next.config.mjs` | config | — | `next.config.mjs` (modify in-place) | exact |

---

## Pattern Assignments

### `src/components/hero/HeroOverlay.tsx` (component, event-driven)

**Analog:** `src/components/horizontal-track/HorizontalTrack.tsx`

This is the closest match: a `"use client"` component that calls `useGSAP` from `@gsap/react`, imports gsap from `@/lib/gsap`, holds refs, and uses a scoped animation context. `ScrollDebugHUD` also illustrates the simpler fixed-position overlay pattern with `pointer-events: none`.

**"use client" directive + import pattern** (HorizontalTrack.tsx lines 1, 23–26):
```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
```

HeroOverlay adapts this: swap `ScrollTrigger` for `useState`, add `useTypewriter` import.

**useGSAP animation + cleanup pattern** (HorizontalTrack.tsx lines 37–62):
```tsx
useGSAP(
  () => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: { ... },
    });
  },
  { scope: sectionRef },
);
```

HeroOverlay adapts this with `gsap.fromTo(nameRef.current, { opacity: 0 }, { opacity: 1, delay: 1.3, duration: 1.8, ease: "power2.out", onComplete: () => setTypewriterReady(true) })` — same hook, same `{ scope: ref }` option.

**Fixed overlay + pointer-events: none pattern** (ScrollDebugHUD.tsx lines 16–40):
```tsx
export default function ScrollDebugHUD(): JSX.Element | null {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      aria-hidden="true"
      data-testid="scroll-debug-hud"
    >
```

HeroOverlay uses `position: "fixed"`, `bottom`/`left` instead of `top`/`right`, `zIndex: 2`, and `pointer-events: none` — same pattern.

**Reduced-motion guard pattern** (MoonScene.tsx lines 58–62):
```tsx
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```

Copy this helper verbatim into HeroOverlay (or inline the guard). The `typeof window !== "undefined"` SSR guard is the established project convention.

**Exported constants for testability pattern** (MoonScene.constants.ts — full file structure):
```ts
export const MOON_ENTRANCE_DURATION = 2.5;
export const MOON_ENTRANCE_EASE = "power3.out";
// ...
```

HeroOverlay must export `NAME_FADE_DELAY`, `NAME_FADE_DURATION`, and `CURSOR_FADE_DELAY_MS` as named exports for Wave 0 unit tests (matching MoonScene.constants.ts convention, confirmed in RESEARCH.md Pattern 2).

**Initial opacity set in style prop to prevent flash** (derived from RESEARCH.md Anti-Patterns + MoonScene.tsx initial position useEffect):
```tsx
// Set opacity: 0 in style prop directly — prevents flash between React render
// and GSAP initialization. MoonScene.tsx does this for position via useEffect;
// HeroOverlay does it via the style prop.
style={{ opacity: reducedMotion ? 1 : 0 }}
```

---

### `src/hooks/useTypewriter.ts` (hook, event-driven)

**Analog:** No existing hook file in the project. Closest structural analog is `src/lib/scroll-store.ts` (incremental state driven by a signal) plus `prefersReducedMotion` guard from `src/components/canvas/MoonScene.tsx`.

**Project hook shape convention** (from `src/lib/scroll-store.ts` — Zustand action pattern, and TypeScript patterns rule):
```ts
export function useTypewriter(
  text: string,
  charDelayMs: number,
  startSignal: boolean
): string {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  // ...
  return displayed;
}
```

- Return cleanup from every `useEffect` that starts a timer: `return () => clearInterval(id)`
- Use `useRef` for the mutable index counter to avoid stale closure — same reason `LenisProvider.tsx` uses `lenisRef` and `scroll-store.ts` uses Zustand `get()` for mutable state in callbacks
- Initial state `""` — never expose partial text before `startSignal` fires

**NebulaScene.tsx reduced-motion detection pattern** (lines 145–149) — use inside `useEffect`, not at module scope:
```tsx
const reducedMotionRef = useRef<boolean>(false);
useEffect(() => {
  if (typeof window === "undefined") return;
  reducedMotionRef.current = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}, []);
```

`useTypewriter` reads `matchMedia` inside the `useEffect` body (equivalent pattern, without the ref since the hook doesn't need per-frame access).

**matchMedia mock already available in vitest.setup.ts** (lines 1–14):
```ts
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    // ...
  }),
});
```

Tests for `useTypewriter` override `.value` per test to simulate reduced-motion — no additional setup required in test files.

---

### `src/styles/tokens.css` (config, modify)

**Analog:** `src/styles/tokens.css` (the file itself — adding CSS variables to the existing `:root` block).

**Current `:root` block pattern** (tokens.css lines 1–30):
```css
:root {
  /* Space palette */
  --color-space: oklch(4% 0 0);
  --color-void: oklch(8% 0.01 260);

  /* Motion timing */
  --duration-canvas-reveal: 500ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

  /* Reduced motion gate — QUAL-03 (Phase 4 fully consumes this) */
  --motion-ok: 1;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-ok: 0;
  }
}
```

Phase 4 adds a `/* Typography */` comment block with font size tokens following the existing grouping convention. No new `--font-geist-*` declaration is needed in CSS — those variable names are injected by the `geist` package's `.variable` class on `<html>`. Any new tokens (e.g., `--text-hero`, `--text-subtitle`) follow the `clamp()` + `vw` pattern from the global coding style rule.

---

### `src/app/globals.css` (config, modify)

**Analog:** `src/app/globals.css` (the file itself — appending `body::after` grain rule).

**Current globals.css pattern** (lines 1–11):
```css
@import "../styles/tokens.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: var(--color-space);
  color: #ffffff;
  min-height: 100vh;
}
```

Phase 4 appends below the existing `body` block. Critical: grain CSS MUST be in this file, never in a `.module.css` (Pitfall 5 in RESEARCH.md). The `calc(var(--motion-ok) * 1.5s)` pattern is available because `tokens.css` is imported at line 1.

**Grain rule to append** (RESEARCH.md Pattern 4 — verbatim excerpt):
```css
body::after {
  content: "";
  position: fixed;
  inset: 0;
  width: 300%;
  height: 300%;
  top: -100%;
  left: -100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,...SVG feTurbulence data URI...");
  background-repeat: repeat;
  background-size: 250px 250px;
  animation: grain calc(var(--motion-ok) * 1.5s) steps(6) infinite;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10%       { transform: translate(-5%, -10%); }
  30%       { transform: translate(3%, -15%); }
  50%       { transform: translate(12%, 9%); }
  70%       { transform: translate(9%, 4%); }
  90%       { transform: translate(-1%, 7%); }
}
```

Use `transform: translate()` — compositor-only, no repaint. Do NOT use `background-position` (would trigger layout/paint).

---

### `src/app/layout.tsx` (config, modify)

**Analog:** `src/app/layout.tsx` (the file itself — adding font imports and className).

**Current layout.tsx** (full file, lines 1–26):
```tsx
import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/lenis-provider/LenisProvider";
import MoonSceneClient from "@/components/canvas/MoonScene.client";

export const metadata: Metadata = { ... };

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          <MoonSceneClient />
          <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </LenisProvider>
      </body>
    </html>
  );
}
```

Phase 4 modifications (3 changes):
1. Add imports: `import { GeistSans } from "geist/font/sans"` and `import { GeistMono } from "geist/font/mono"` at top of file
2. Apply `.variable` classes to `<html>`: `className={`${GeistSans.variable} ${GeistMono.variable}`}`
3. Update content div: `zIndex: 1` → `zIndex: 2` (grain sits at z-index 1 between canvas and content — per RESEARCH.md z-index layering table)

---

### `src/app/page.tsx` (component, modify)

**Analog:** `src/app/page.tsx` (the file itself — adding `<HeroOverlay />` inside the vertical zone section).

**Current vertical zone section** (page.tsx lines 32–35):
```tsx
{/* Vertical zone — represents future hero + nebula content */}
<section
  style={{ minHeight: "250vh" }}
  data-testid="vertical-zone"
/>
```

Phase 4 changes the self-closing `<section>` to an open element wrapping `<HeroOverlay />`. Add import at top following the existing `@/` alias pattern:

```tsx
import HeroOverlay from "@/components/hero/HeroOverlay";
```

page.tsx is a Server Component — no `"use client"` directive. HeroOverlay carries its own `"use client"` directive, creating a Client Component island (same pattern as layout.tsx → MoonSceneClient).

---

### `next.config.mjs` (config, modify)

**Analog:** `next.config.mjs` (the file itself — adding `transpilePackages`).

**Current next.config.mjs** (lines 1–5):
```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

Phase 4 adds one field — must be done before any `geist/font/*` import or `next build` will fail (RESEARCH.md Pitfall 2):
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["geist"],
};

export default nextConfig;
```

---

## Shared Patterns

### "use client" Island Pattern
**Source:** `src/components/canvas/MoonScene.client.tsx` (line 1), `src/components/horizontal-track/HorizontalTrack.tsx` (line 1)
**Apply to:** `HeroOverlay.tsx`

```tsx
"use client";
// First line, before all imports.
// Server Components are the default — only Client Component islands carry this.
```

### GSAP Import Convention
**Source:** `src/lib/gsap.ts` (entire file), referenced at `HorizontalTrack.tsx` line 26 and `MoonScene.tsx` line 34
**Apply to:** `HeroOverlay.tsx`

```tsx
import gsap from "@/lib/gsap";
// Never: import gsap from "gsap"
// All GSAP access routes through the re-export to prevent SSR side effects.
```

### SSR Window Guard
**Source:** `src/components/canvas/MoonScene.tsx` (lines 58–61), `src/components/canvas/NebulaScene.tsx` (lines 145–149)
**Apply to:** `HeroOverlay.tsx`, `useTypewriter.ts`

```ts
if (typeof window === "undefined") return false;
window.matchMedia("(prefers-reduced-motion: reduce)").matches
```

### calc(var(--motion-ok)) Animation Duration
**Source:** `src/styles/tokens.css` (lines 24–30)
**Apply to:** `src/app/globals.css` (grain animation), `HeroOverlay.tsx` (cursor fade transition)

```css
animation-duration: calc(var(--motion-ok) * 1.5s);
transition: opacity calc(var(--motion-ok) * 0.6s) ease;
/* Collapses to 0s when --motion-ok: 0 — freezes animation under reduced-motion */
```

### Exported Constants for Unit Testability
**Source:** `src/components/canvas/MoonScene.constants.ts` (full file), tested in `src/components/canvas/__tests__/MoonScene.test.tsx` (lines 1–27)
**Apply to:** `HeroOverlay.tsx`

```ts
export const NAME_FADE_DELAY = 1.3;      // seconds
export const NAME_FADE_DURATION = 1.8;   // seconds
export const CURSOR_FADE_DELAY_MS = 2000;
// Exported from the component file, not a separate .constants.ts,
// because values are small and HeroOverlay-specific.
```

### JSDoc Component Header
**Source:** `src/components/canvas/MoonScene.tsx` (lines 1–19), `src/components/horizontal-track/HorizontalTrack.tsx` (lines 1–21)
**Apply to:** `HeroOverlay.tsx`, `useTypewriter.ts`

```tsx
/**
 * HeroOverlay — one-sentence purpose.
 *
 * Phase 4 scope:
 *   - HERO-06: name fade-in
 *   - HERO-07: subtitle typewriter
 *   - HERO-08: reduced-motion fallback
 *
 * Reduced motion (QUAL-03): name appears at full opacity immediately;
 * subtitle shows as full text immediately; grain layer static.
 * StrictMode: useGSAP wraps gsap.context() — auto-cleanup, no manual kill.
 */
```

### Test File Location Convention
**Source:** `src/components/canvas/__tests__/MoonScene.test.tsx`, `src/lib/__tests__/scroll-store.test.ts`
**Apply to:** `src/components/hero/__tests__/HeroOverlay.constants.test.ts`, `src/hooks/__tests__/useTypewriter.test.ts`, `src/hooks/__tests__/useTypewriter.reduced-motion.test.ts`

Tests live in a `__tests__/` subdirectory adjacent to the source file. The two `useTypewriter` test files are split because each needs a different `matchMedia` mock value — matching the RESEARCH.md Validation Architecture note about the matchMedia mock constraint.

### data-testid Attribute Convention
**Source:** `src/components/canvas/MoonScene.client.tsx` (line 41), `src/components/horizontal-track/HorizontalTrack.tsx` (lines 71, 78)
**Apply to:** `HeroOverlay.tsx`

```tsx
<div data-testid="hero-overlay" ...>
  <h1 data-testid="hero-name" ...>Kameron Benjamin</h1>
  <p data-testid="hero-subtitle" ...>{subtitle}</p>
</div>
```

---

## No Analog Found

All files have direct analogs or are self-modifying (in-place modifications of existing files). No entries.

---

## Metadata

**Analog search scope:** `src/components/`, `src/lib/`, `src/hooks/`, `src/app/`, `src/styles/`, root config files
**Files scanned:** 15 source files + 3 config files
**Pattern extraction date:** 2026-05-17
