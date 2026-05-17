# Phase 4: Hero Section — Research

**Researched:** 2026-05-17
**Domain:** HTML/CSS overlay animation — typewriter, fade-in, SVG grain, next/font
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Name typeface: Geist (geometric sans), loaded via `next/font/google`. Weight 200–300.
- **D-02:** Subtitle typeface: Geist Mono — loaded alongside Geist as a paired variable font.
- **D-03:** Both fonts loaded with `next/font/google` for zero-layout-shift font delivery. CSS variables exposed (`--font-geist`, `--font-geist-mono`) applied to the overlay component.
- **D-04:** Name and subtitle anchor bottom-left of the viewport.
- **D-05:** Name fade-in starts at ~1.2–1.5s after mount. Both elements arrive together around 2.5s mark.
- **D-06:** Name fade duration: ~1.5–2s. Name finishes fading at roughly 3–3.5s after mount.
- **D-07:** Subtitle typing starts after the name is fully visible (opacity = 1).
- **D-08:** Overlay is static during scroll — no scroll-driven exit or parallax on text.
- **D-09:** Subtitle text: "Full-stack developer & creative technologist"
- **D-10:** Typing speed: ~50–70ms per character.
- **D-11:** Cursor (`|` or `_`) appears at end of text then fades out after ~2s.
- **D-12:** Implementation: custom `useTypewriter` hook (`src/hooks/useTypewriter.ts`). Accepts `(text, charDelayMs, startSignal)`.
- **D-13:** Animated film grain — shifts every ~80–120ms via CSS `@keyframes`.
- **D-14:** Grain prominence: subtle — opacity ~0.04–0.07.
- **D-15:** Grain scope: full page — fixed-position `::after` on body or a fixed wrapper div.
- **D-16:** Implementation: inline SVG `feTurbulence` as a `data:` URI in `background-image`. No external file.
- **D-17:** Grain `::after` must have `pointer-events: none` and `z-index` below text overlay but above canvas (z-index 0).
- **D-18:** `--motion-ok: 1` already declared in `tokens.css` with `prefers-reduced-motion` media query. When `--motion-ok = 0`: name appears immediately at full opacity; subtitle appears immediately as full text; grain present but static.
- **D-19:** `calc(var(--motion-ok) * Xs)` for CSS animation durations; `useTypewriter` reads `window.matchMedia('(prefers-reduced-motion: reduce)')` to skip typing.
- **D-20:** Hero overlay component: `src/components/hero/HeroOverlay.tsx`. `"use client"` directly on HeroOverlay.
- **D-21:** `useTypewriter` hook: `src/hooks/useTypewriter.ts`.

### Claude's Discretion

- Exact letter-spacing value for the name (targeting wide, airy — e.g., `0.15em`–`0.25em`)
- Exact font size for the name (targeting dominant but not viewport-filling — roughly `clamp(3rem, 5vw, 7rem)`)
- Exact `feTurbulence` baseFrequency for grain texture character
- Cursor character shape (`|` vs `_`) and blink behavior before fade-out
- Whether name fade uses CSS transition or GSAP (`gsap.to` from `src/lib/gsap.ts`)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-06 | Kameron's name fades in over the moon, large scale, thin letter-spacing | CSS transition or GSAP with delay; `--motion-ok` disables via `calc()` |
| HERO-07 | Subtitle types itself out with the typing animation | `useTypewriter` hook with `startSignal`; `matchMedia` check for reduced-motion |
| HERO-08 | CSS grain/scanline overlay renders via `::after` pseudo-element for cinematic texture | SVG feTurbulence data URI + CSS `@keyframes` with `steps()` transform |
| QUAL-03 | `prefers-reduced-motion` disables all animations — implemented via `--motion-ok: 1` CSS custom property | `--motion-ok` already in `tokens.css`; `calc(var(--motion-ok) * Xs)` pattern confirmed |
</phase_requirements>

---

## Summary

Phase 4 adds a pure HTML/CSS/JS overlay on top of the existing canvas. No R3F or WebGL is involved. Three independent features are needed: (1) a name that fades in, (2) a typewriter subtitle, and (3) a full-page animated grain. All three must gracefully collapse to a static state when `prefers-reduced-motion` is active. The existing codebase already has the `--motion-ok` token in `tokens.css`, GSAP wired through `src/lib/gsap.ts`, and `@gsap/react` installed — giving Phase 4 two viable animation paths for the name fade.

The most significant discovery is that **Geist is NOT available via `next/font/google` in the project's installed Next.js 14.2.35**. The `font-data.json` bundled with this version of Next.js has 1,625 font entries; Geist is absent from all of them. Geist requires installing the separate `geist` npm package (vercel/geist-font, v1.7.0) plus adding `transpilePackages: ["geist"]` to `next.config.mjs`. Once installed, both `GeistSans` and `GeistMono` from `geist/font/sans` and `geist/font/mono` are `NextFontWithVariable` instances — CSS variable exposure works identically to `next/font/google`.

The SVG feTurbulence grain technique is well-established: an inline data URI SVG with `type='fractalNoise'` produces the grain, a CSS `::after` pseudo-element at fixed position covers the full page, and `@keyframes` with `transform: translate()` and `animation-timing-function: steps(N)` makes it animate as discrete film frames. The `calc(var(--motion-ok) * Xs)` pattern reduces `animation-duration` to 0s when reduced-motion is requested, freezing the grain without removing the visual texture.

**Primary recommendation:** Install `geist` npm package, add `transpilePackages` to `next.config.mjs`, load both fonts in `layout.tsx` with `.variable` class approach, and use GSAP (`useGSAP` from `@gsap/react`) for the name fade. GSAP integrates cleanly with the existing animation setup and its `onComplete` callback naturally gates the typewriter's `startSignal` without a competing `setTimeout`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Name fade-in animation | Browser / Client | — | DOM element opacity; GSAP runs client-side only (`"use client"`) |
| Subtitle typewriter | Browser / Client | — | `useEffect`/`setInterval` logic; reads `window.matchMedia` at runtime |
| Film grain `::after` | Browser / Client (CSS) | — | Pure CSS animation on a pseudo-element; no JS involvement |
| Font loading | Frontend Server (SSR) | — | `next/font` resolved at build time; preload link injected server-side |
| CSS variable tokens | Browser / Client (CSS) | — | `--motion-ok` already in `tokens.css`; font vars added to same file |
| Layout integration | Frontend Server | Browser / Client | `layout.tsx` is Server Component; only `HeroOverlay.tsx` is `"use client"` |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `geist` | 1.7.0 [VERIFIED: npm registry] | Geist Sans + Geist Mono font package | Official Vercel package; required because Geist is absent from Next.js 14's `font-data.json` |
| `@gsap/react` | 2.1.2 [VERIFIED: npm registry] | `useGSAP` hook for name fade-in | Already installed; handles React 18 Strict Mode cleanup automatically |
| `gsap` | 3.15.0 [VERIFIED: npm registry] | Animation engine | Already installed; imported via `src/lib/gsap.ts` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS `@keyframes` + `steps()` | — (native) | Film grain animation | Grain shift; no JS needed; degrades to static via `calc(var(--motion-ok) * Xs)` |
| `window.matchMedia` | — (native) | Reduced-motion detection in hook | `useTypewriter` reads this at mount to skip typing loop |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GSAP for name fade | CSS transition + `calc(var(--motion-ok) * Xs)` | CSS is simpler but GSAP gives exact mount-relative `delay` control and a clean `onComplete` callback to gate the typewriter |
| `geist` npm package | `next/font/local` with manually downloaded font files | Same outcome but more setup; `geist` package is the canonical distribution |
| Custom typewriter with `setInterval` | `motion` (Framer Motion) text animation | `motion` is installed but a custom hook (D-12) keeps the logic explicit and avoids library overhead for a simple character loop |

**Installation (new package only — all others already installed):**
```bash
npm install geist
```

**Version verification:**
```
npm view geist version      → 1.7.0
npm view @gsap/react version → 2.1.2 (already in package.json)
npm view gsap version        → 3.15.0 (already in package.json)
```

---

## Package Legitimacy Audit

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| `geist` | npm | ~3 yrs (first published 2015, Vercel font released ~2023) | github.com/vercel/geist-font | [OK] | Approved |

**slopcheck note:** `python3 -m slopcheck install geist` ran against PyPI (different `geist` package — a computer vision library). For the npm `geist` package, legitimacy was confirmed directly: `npm view geist repository` returns `git+https://github.com/vercel/geist-font.git`, homepage is `vercel.com/font`, no `postinstall` script present, published by Vercel.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Mount (t=0)
    │
    ├── layout.tsx (Server Component)
    │   └── GeistSans.variable + GeistMono.variable → className on <html>
    │       → CSS vars: --font-geist-sans, --font-geist-mono available globally
    │
    ├── MoonSceneClient (fixed, z-index: 0) ← unchanged from Phase 2/3
    │
    ├── body::after grain (fixed, z-index: 1, pointer-events: none)
    │   └── SVG feTurbulence data URI + @keyframes grain (steps(6))
    │       └── animation-duration: calc(var(--motion-ok) * 1.5s)
    │
    └── <div z-index: 2> (content wrapper)
        └── page.tsx → <HeroOverlay />  ["use client"]
                │
                ├── useGSAP() → gsap.to(nameRef, {opacity:1, delay:1.3, duration:1.8})
                │                  ↓ onComplete → setTypewriterReady(true)
                │
                └── useTypewriter(text, 60, typewriterReady)
                    ├── if typewriterReady=false → return ""  (no flash)
                    ├── if reduced-motion → return full text immediately
                    └── setInterval loop → builds chars one at a time
                        ↓ complete → shows cursor → fade cursor after 2s
```

### Recommended Project Structure

```
src/
├── components/
│   └── hero/
│       ├── HeroOverlay.tsx          # "use client"; name + subtitle + positioning
│       └── __tests__/
│           └── HeroOverlay.constants.test.ts
├── hooks/
│   ├── useTypewriter.ts             # (text, charDelayMs, startSignal) → string
│   └── __tests__/
│       ├── useTypewriter.test.ts               # motion-ok behavior
│       └── useTypewriter.reduced-motion.test.ts # separate file (matchMedia mock constraint)
├── styles/
│   └── tokens.css                   # add --font-geist-sans, --font-geist-mono here
└── app/
    ├── layout.tsx                   # add GeistSans.variable + GeistMono.variable to <html>
    ├── globals.css                  # add body::after grain rule
    └── page.tsx                     # add <HeroOverlay /> inside existing <main>
```

---

### Pattern 1: Font Loading with `geist` Package (Next.js 14)

**What:** Load Geist Sans and Geist Mono as CSS variables via the official `geist` npm package.
**When to use:** Any time Next.js version is below 15 (Geist is absent from `next/font/google` font-data.json in Next.js 14).

```tsx
// src/app/layout.tsx  [CITED: github.com/vercel/geist-font README v1.7.0]
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/lenis-provider/LenisProvider";
import MoonSceneClient from "@/components/canvas/MoonScene.client";

export const metadata: Metadata = {
  title: "Kameron Benjamin",
  description: "Full-stack developer with a strong creative tech focus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <LenisProvider>
          <MoonSceneClient />
          <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
        </LenisProvider>
      </body>
    </html>
  );
}
```

```js
// next.config.mjs  [CITED: github.com/vercel/geist-font README v1.7.0]
const nextConfig = {
  transpilePackages: ["geist"],
};
export default nextConfig;
```

CSS variables exposed by the `.variable` class: `--font-geist-sans` and `--font-geist-mono`.

---

### Pattern 2: Name Fade with `useGSAP`

**What:** Fade the name element from opacity 0 to 1 with a mount-relative delay, using `useGSAP` for automatic Strict Mode cleanup.
**When to use:** Preferred over CSS transition because `delay` is mount-relative (not class-application-relative) and `onComplete` naturally gates the typewriter `startSignal`.

```tsx
// src/components/hero/HeroOverlay.tsx  [CITED: gsap.com/resources/React/]
"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { useTypewriter } from "@/hooks/useTypewriter";

// Export constants so they are unit-testable (established project pattern)
export const NAME_FADE_DELAY = 1.3;      // seconds
export const NAME_FADE_DURATION = 1.8;   // seconds

export default function HeroOverlay(): JSX.Element {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [typewriterReady, setTypewriterReady] = useState(false);

  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useGSAP(() => {
    if (reducedMotion) {
      // Skip animation entirely — name visible immediately
      setTypewriterReady(true);
      return;
    }
    gsap.fromTo(
      nameRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: NAME_FADE_DURATION,
        delay: NAME_FADE_DELAY,
        ease: "power2.out",
        onComplete: () => setTypewriterReady(true),
      }
    );
  });

  const subtitle = useTypewriter(
    "Full-stack developer & creative technologist",
    60,
    typewriterReady
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: "clamp(2rem, 4vh, 4rem)",
        left: "clamp(1.5rem, 4vw, 4rem)",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <h1
        ref={nameRef}
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontWeight: 250,
          fontSize: "clamp(3rem, 5vw, 7rem)",
          letterSpacing: "0.2em",
          opacity: reducedMotion ? 1 : 0,  // initial state; GSAP animates to 1
          lineHeight: 1,
          margin: 0,
          color: "#ffffff",
        }}
      >
        Kameron Benjamin
      </h1>
      {/* subtitle and cursor here */}
    </div>
  );
}
```

**Reduced-motion path:** When `reducedMotion` is true, `opacity` is set to 1 in the style prop directly and `setTypewriterReady(true)` fires immediately. No GSAP tween runs. The `useTypewriter` hook also detects `reducedMotion` independently and returns the full text immediately.

---

### Pattern 3: `useTypewriter` Hook with `startSignal` Gating

**What:** Returns an empty string until `startSignal` fires, then steps through text character by character at `charDelayMs` intervals.
**When to use:** Any sequential text reveal that must not flash pre-rendered content during SSR hydration or before the triggering animation completes.

```ts
// src/hooks/useTypewriter.ts  [ASSUMED — standard pattern]
import { useEffect, useState, useRef } from "react";

export function useTypewriter(
  text: string,
  charDelayMs: number,
  startSignal: boolean
): string {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  const reducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  useEffect(() => {
    if (!startSignal) {
      setDisplayed("");
      return;
    }
    if (reducedMotion) {
      setDisplayed(text);
      return;
    }

    // Reset on signal/text change
    indexRef.current = 0;
    setDisplayed("");

    const id = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(id);
      }
    }, charDelayMs);

    return () => clearInterval(id);
  }, [startSignal, text, charDelayMs, reducedMotion]);

  return displayed;
}
```

**Critical:** The `setDisplayed("")` + `indexRef.current = 0` reset runs on every `startSignal`/`text` change. Without this, React 18 Strict Mode's double-invoke of effects would start the second interval mid-string.

**SSR note:** `window.matchMedia` is not available during SSR. The `typeof window !== "undefined"` guard prevents the crash. Initial `displayed` state of `""` means server-rendered HTML shows nothing — correct behavior, since the name must be visible first.

---

### Pattern 4: SVG feTurbulence Film Grain via CSS `::after`

**What:** Full-page fixed grain overlay using an inline SVG data URI and CSS `@keyframes` with `steps()`.
**When to use:** Cinematic atmosphere overlay that must cover the entire scroll journey including the horizontal zone.

```css
/* src/app/globals.css  [CITED: freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/] */
/* [CITED: redstapler.co/css-film-grain-effect/ for keyframes + steps() pattern] */

body::after {
  content: "";
  position: fixed;
  inset: 0;
  /* Oversized so translate keyframes never expose an edge */
  width: 300%;
  height: 300%;
  top: -100%;
  left: -100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox%3D'0 0 250 250' xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cfilter id%3D'noiseFilter'%3E%3CfeTurbulence type%3D'fractalNoise' baseFrequency%3D'0.85' numOctaves%3D'4' stitchTiles%3D'stitch'%2F%3E%3C%2Ffilter%3E%3Crect width%3D'100%25' height%3D'100%25' filter%3D'url(%23noiseFilter)'%2F%3E%3C%2Fsvg%3E");
  background-repeat: repeat;
  background-size: 250px 250px;
  /* calc collapses to 0s when --motion-ok: 0, freezing grain */
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

**Key parameters:**
- `baseFrequency: 0.65–0.95` — higher = finer grain. Start at `0.85` (medium 35mm feel), tune visually.
- `numOctaves: 4` — adds complexity without meaningful performance cost at this scale.
- `stitchTiles='stitch'` — prevents visible seams at tile boundaries.
- `width/height: 300%` with `top/left: -100%` — oversized so translate keyframes never reveal an edge.
- `animation-duration: calc(var(--motion-ok) * 1.5s)` — collapses to `0s` when `--motion-ok: 0`.
- **Use `transform: translate()` — compositor-only, no repaint.** Do NOT use `background-position` — it triggers layout/paint on every frame.

**z-index layering (explicit):**

```
canvas wrapper (MoonSceneClient)   z-index: 0  (fixed, pointer-events: none)
body::after grain                  z-index: 1  (fixed, pointer-events: none)
content wrapper div                z-index: 2  (relative)
HeroOverlay                        z-index: 2  (fixed, pointer-events: none on container)
```

To implement this, update the content wrapper in `layout.tsx` from `zIndex: 1` to `zIndex: 2`. The grain at `z-index: 1` sits between canvas and content.

---

### Pattern 5: Cursor Fade After Typing Completes

**What:** Show a cursor at the end of the typed text, then fade it out after 2 seconds.
**When to use:** Marks the end of the typewriter animation sequence.

```tsx
// Extension of HeroOverlay.tsx  [ASSUMED]
const CURSOR_CHAR = "|";
const CURSOR_FADE_DELAY_MS = 2000;

// In HeroOverlay component:
const [cursorFading, setCursorFading] = useState(false);
const isTypingComplete =
  subtitle.length === "Full-stack developer & creative technologist".length &&
  subtitle.length > 0;

useEffect(() => {
  if (!isTypingComplete) return;
  const id = setTimeout(() => setCursorFading(true), CURSOR_FADE_DELAY_MS);
  return () => clearTimeout(id);
}, [isTypingComplete]);

// JSX:
{typewriterReady && (
  <span
    style={{
      opacity: cursorFading ? 0 : 1,
      transition: `opacity calc(var(--motion-ok) * 0.6s) ease`,
    }}
    aria-hidden="true"
  >
    {CURSOR_CHAR}
  </span>
)}
```

---

### Anti-Patterns to Avoid

- **Animating `background-position` for grain movement:** Triggers layout/paint on every frame. Use `transform: translate()` — compositor-only, no repaint.
- **Initial opacity not set before GSAP starts:** If `opacity: 0` is only applied via GSAP `.from()` but not in the React style prop, there will be a flash of visible content between React render and GSAP initialization. Set the initial `opacity` in the style prop directly.
- **Reading `window.matchMedia` at module level:** Crashes SSR. Always guard with `typeof window !== "undefined"` or read inside `useEffect`/`useGSAP`.
- **Font variable classes on `<body>` instead of `<html>`:** The CSS variable is scoped to the element that receives the class. Use `<html>` so `--font-geist-sans` and `--font-geist-mono` are available in pseudo-elements and everywhere.
- **Grain CSS in a `.module.css` file:** CSS Modules scope and mangle selectors. `body::after` must be in a global stylesheet (`globals.css`).
- **Calling `gsap.registerPlugin(useGSAP)`:** `useGSAP` is a React hook, not a GSAP plugin. Import and call it directly. The existing `LenisProvider` handles plugin registration for `ScrollTrigger`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading with zero CLS | Manual `@font-face` in CSS | `geist` npm package + `next/font` | `next/font` injects optimal preload link, handles font-display, prevents FOUT |
| GSAP cleanup in React 18 Strict Mode | Manual `useEffect` return with `gsap.killTweensOf()` | `useGSAP` from `@gsap/react` | Wraps animations in `gsap.context()`, reverts on unmount; already installed |
| Grain texture as raster image | External PNG/JPEG grain file | Inline SVG feTurbulence data URI | No network request; no image optimization pipeline; deterministic at any resolution |

**Key insight:** The SVG feTurbulence data URI approach avoids sourcing, optimizing, and serving a grain texture image. The data URI is a few hundred bytes, renders deterministically at any DPR, and tiles seamlessly via `stitchTiles='stitch'`.

---

## Common Pitfalls

### Pitfall 1: Flash of Typed Text on Hydration

**What goes wrong:** Subtitle shows partial or full text during SSR/hydration before animations begin.
**Why it happens:** Initial state of `useTypewriter` returned a non-empty string, or `startSignal` gating was not implemented.
**How to avoid:** Initial `useState("")` in `useTypewriter`. Never set `displayed` to any portion of `text` unless `startSignal` is `true`.
**Warning signs:** Text visible immediately on page load before the name fade completes.

---

### Pitfall 2: Geist Import Fails Without `transpilePackages`

**What goes wrong:** Build error: `TypeError: next_font_local__WEBPACK_IMPORTED_MODULE_0___default(...) is not a function` or `SyntaxError: Cannot use import statement outside a module`.
**Why it happens:** The `geist` package ships ESM modules that Next.js 14's webpack cannot process without explicit transpilation.
**How to avoid:** Add `transpilePackages: ["geist"]` to `next.config.mjs` before adding any `geist/font/*` imports.
**Warning signs:** `next dev` may work but `next build` fails.

---

### Pitfall 3: Grain `::after` Covers Interactive Content

**What goes wrong:** Clicks and hover states stop working because the grain overlay intercepts pointer events.
**Why it happens:** Missing `pointer-events: none` on `body::after`.
**How to avoid:** Always pair the fixed grain pseudo-element with `pointer-events: none`. Specified in D-17 — verify during implementation.
**Warning signs:** Buttons not clickable; hover states not triggering.

---

### Pitfall 4: GSAP Flash in React 18 Strict Mode (dev only)

**What goes wrong:** In development, the name element flickers as `useGSAP` runs twice.
**Why it happens:** React 18 Strict Mode double-invokes effects. `useGSAP` correctly reverts the first animation context before the second run. The flash is a dev-only artifact.
**How to avoid:** Set the initial `opacity: 0` directly in the style prop (not only via GSAP `.from()`). The element is invisible from first paint regardless of GSAP state. Acceptable in dev; does not appear in `next build && next start`.
**Warning signs:** Opacity flicker in `next dev` that does not appear in production build.

---

### Pitfall 5: `body::after` Grain Not Rendering in App Router

**What goes wrong:** The grain rule has no effect — DevTools shows `body::after` is absent or the selector is mangled.
**Why it happens:** CSS for `body::after` was placed in a `.module.css` file, which scopes and mangles selectors.
**How to avoid:** Place `body::after` rules in `globals.css` (already imported in `layout.tsx`). Never in any `.module.css`.
**Warning signs:** Selector shown in DevTools as `.Hero_grain__xxxx::after` or similar mangled name.

---

## Code Examples

### Verified: `geist` Package CSS Variable Names

```
[CITED: github.com/vercel/geist-font README v1.7.0 — extracted via npm pack]

GeistSans → CSS variable: --font-geist-sans
GeistMono → CSS variable: --font-geist-mono
```

After adding both `.variable` classes to `<html>`:
```css
font-family: var(--font-geist-sans);  /* Geist Sans */
font-family: var(--font-geist-mono);  /* Geist Mono */
```

---

### Verified: SVG feTurbulence Raw Markup

```svg
<!-- [CITED: freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/] -->
<svg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'>
  <filter id='noiseFilter'>
    <feTurbulence
      type='fractalNoise'
      baseFrequency='0.85'
      numOctaves='4'
      stitchTiles='stitch'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#noiseFilter)'/>
</svg>
```

`baseFrequency` tuning:
- `0.65` → coarser grain (large-grain film)
- `0.85` → medium grain (35mm feel) — recommended starting point
- `1.20` → fine grain (digital noise)

URL-encoded form for CSS `background-image` (ready to paste):
```
url("data:image/svg+xml,%3Csvg viewBox%3D'0 0 250 250' xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Cfilter id%3D'noiseFilter'%3E%3CfeTurbulence type%3D'fractalNoise' baseFrequency%3D'0.85' numOctaves%3D'4' stitchTiles%3D'stitch'%2F%3E%3C%2Ffilter%3E%3Crect width%3D'100%25' height%3D'100%25' filter%3D'url(%23noiseFilter)'%2F%3E%3C%2Fsvg%3E")
```

---

### Verified: `calc(var(--motion-ok))` Pattern

```css
/* [CITED: existing src/styles/tokens.css in project] */
:root { --motion-ok: 1; }
@media (prefers-reduced-motion: reduce) { :root { --motion-ok: 0; } }

/* Grain animation collapses to 0s — grain freezes but remains visible */
animation-duration: calc(var(--motion-ok) * 1.5s);

/* Cursor fade collapses to 0s — cursor disappears instantly */
transition-duration: calc(var(--motion-ok) * 0.6s);
```

---

### Verified: `useGSAP` in Next.js 14 `"use client"` Component

```tsx
// [CITED: gsap.com/resources/React/]
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";

// No gsap.registerPlugin(useGSAP) — useGSAP is a hook, not a plugin

export default function Component() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    // All tweens auto-cleaned on unmount via internal gsap.context()
    gsap.to(ref.current, {
      opacity: 1,
      duration: 1.8,
      delay: 1.3,
      ease: "power2.out",
      onComplete: () => { /* gate next step here */ },
    });
  });
}
```

---

### Verified: Mocking `matchMedia` for Reduced-Motion Tests in Vitest

```ts
// [CITED: rebeccamdeprey.com/blog/mock-windowmatchmedia-in-vitest]
// src/hooks/__tests__/useTypewriter.reduced-motion.test.ts

// Override the global mock (set in vitest.setup.ts) to return matches: true
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

**Constraint:** Tests needing `matches: true` must be in a **separate file** from tests needing `matches: false`. Vitest cannot change hoisted mocks between tests in the same file. The global baseline in `vitest.setup.ts` returns `matches: false`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External grain PNG/JPEG | SVG feTurbulence data URI | ~2019 | No network request, deterministic, resolution-independent |
| `useEffect` + manual `gsap.killTweensOf()` | `useGSAP` from `@gsap/react` | GSAP 3.12 (~2023) | React 18 Strict Mode safe; automatic context cleanup |
| `@next/font` (separate package) | `next/font` (built-in) | Next.js 13.2 | No installation for most fonts; Geist still needs separate `geist` package in Next.js 14 |
| `background-position` animation for grain | `transform: translate()` for grain | ~2020 | Compositor-thread only; no repaint |

**Deprecated/outdated:**
- `background-position` animation for grain: causes repaint on every frame; replaced by `transform`.
- `@studio-freight/lenis`: project already uses `lenis` (correct). No change.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useTypewriter` hook internals (reset via `indexRef.current = 0`) | Pattern 3 | Typing may not restart correctly after Strict Mode double-invoke; low risk, easily fixed during implementation |
| A2 | `body::after` z-index 1 stacks correctly between canvas (z-index 0) and content (z-index 2) | Pattern 4 | Grain may appear above or below intended layers; verify visually in Wave 1 |
| A3 | GSAP `onComplete` fires once per tween lifecycle (not twice in Strict Mode) | Pattern 2 | If `setTypewriterReady(true)` fires twice, `useTypewriter` would re-trigger; mitigation: `useRef` guard flag in hook |
| A4 | Cursor fade via inline `transition` + `opacity` state change (not a GSAP tween) | Pattern 5 | Could equally use GSAP; no functional risk either way |

---

## Open Questions

1. **Name fade: GSAP vs CSS transition (Claude's discretion)**
   - What we know: Both work. GSAP `onComplete` naturally gates the typewriter. CSS transition requires `transitionend` listener or a parallel `setTimeout` to gate the typewriter.
   - Recommendation: Use GSAP. The `onComplete` → `setTypewriterReady(true)` pattern is explicit, avoids timing drift from parallel timers, and is consistent with the project's existing GSAP-first animation philosophy.

2. **z-index: grain at 1, content at 2 — requires updating layout.tsx content div from `zIndex: 1` to `zIndex: 2`**
   - What we know: Current `layout.tsx` has content wrapper at `zIndex: 1`. Adding grain at `z-index: 1` would put them in the same layer.
   - Recommendation: Update content wrapper to `zIndex: 2` as part of this phase. This is a one-line change in `layout.tsx` and makes the layering explicit.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, test | ✓ | v18.20.8 | — |
| npm | Package install | ✓ | 10.8.2 | — |
| Vitest | Test suite | ✓ | 1.6.1 | — |
| `geist` npm package | Font loading | ✗ (not installed) | 1.7.0 available | None — must install; `next/font/local` with manual files is the only alternative |
| `@gsap/react` | `useGSAP` hook | ✓ | 2.1.2 (in package.json) | `useLayoutEffect` with manual `gsap.killTweensOf()` cleanup |
| `gsap` | Animation | ✓ | 3.15.0 (in package.json) | — |

**Missing dependencies with no fallback:**
- `geist` package must be installed and `transpilePackages: ["geist"]` added to `next.config.mjs` before any font imports.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 1.6.1 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-06 | `NAME_FADE_DELAY` and `NAME_FADE_DURATION` constants are within spec ranges | unit | `npm test -- src/components/hero/__tests__/HeroOverlay.constants.test.ts` | ❌ Wave 0 |
| HERO-07 | `useTypewriter` returns `""` before `startSignal=true` | unit | `npm test -- src/hooks/__tests__/useTypewriter.test.ts` | ❌ Wave 0 |
| HERO-07 | `useTypewriter` steps through characters at `charDelayMs` after `startSignal` fires | unit | `npm test -- src/hooks/__tests__/useTypewriter.test.ts` | ❌ Wave 0 |
| HERO-07 | `useTypewriter` returns full text immediately when `prefers-reduced-motion: reduce` | unit | `npm test -- src/hooks/__tests__/useTypewriter.reduced-motion.test.ts` | ❌ Wave 0 |
| HERO-08 | Grain constants (opacity range, z-index) exported and within spec | unit | `npm test -- src/components/hero/__tests__/HeroOverlay.constants.test.ts` | ❌ Wave 0 |
| QUAL-03 | `--motion-ok: 0` in tokens.css — grain animation-duration resolves to `0s` | manual/visual | OS reduced-motion setting + browser DevTools | — |

**Note:** Following the project's established pattern (MoonScene.test.tsx, NebulaScene.test.tsx), Phase 4 tests verify exported constants and hook behavior rather than testing DOM rendering of animations. Animation timing is validated manually and visually.

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/hero/__tests__/HeroOverlay.constants.test.ts` — covers HERO-06 (fade delay/duration within spec), HERO-08 (grain opacity within 0.04–0.07)
- [ ] `src/hooks/__tests__/useTypewriter.test.ts` — covers HERO-07 startSignal gating, char stepping, cursor completion signal
- [ ] `src/hooks/__tests__/useTypewriter.reduced-motion.test.ts` — separate file (matchMedia mock cannot change between tests in same file); covers QUAL-03 hook path

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | Subtitle text is a string literal constant; no user input |
| V6 Cryptography | no | — |

**No security concerns for this phase.** All content is static string literals. Font loading is handled by Next.js build-time optimization. The SVG feTurbulence is an inline data URI with no user-controlled parameters.

---

## Sources

### Primary (HIGH confidence)

- `github.com/vercel/geist-font` README — extracted via `npm pack geist` then `tar -xzf` — Geist CSS variable names, `transpilePackages` requirement, exact import paths
- `nextjs.org/docs/app/api-reference/components/font` — fetched — `next/font/google` variable option, CSS variable method, multiple fonts pattern
- `gsap.com/resources/React/` — fetched — `useGSAP` hook pattern, automatic cleanup, `"use client"` requirement
- `freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/` — fetched — SVG feTurbulence raw markup, data URI encoding, baseFrequency semantics
- `rebeccamdeprey.com/blog/mock-windowmatchmedia-in-vitest` — fetched — matchMedia mocking in Vitest, per-file constraint
- `src/styles/tokens.css` (existing project file) — confirmed `--motion-ok` pattern and existing CSS variables
- `src/app/layout.tsx`, `package.json`, `vitest.config.ts`, `vitest.setup.ts` (existing project files) — confirmed existing wiring

### Secondary (MEDIUM confidence)

- `redstapler.co/css-film-grain-effect/` — fetched — grain keyframes structure with `transform: translate()` and `steps()` timing
- WebSearch results on GSAP Next.js App Router patterns — corroborate primary GSAP docs findings
- WebSearch results on `geist` npm package Next.js 14 usage — corroborate README findings

### Tertiary (LOW confidence)

- None.

---

## Metadata

**Confidence breakdown:**
- Geist font loading: HIGH — verified via npm pack extraction of official README; CSS variable names confirmed
- `useTypewriter` implementation: MEDIUM — standard React hook pattern; hook body is [ASSUMED] but logic is straightforward; risk is low
- SVG grain technique: HIGH — cited from two independent official/tutorial sources; data URI pattern confirmed
- GSAP integration: HIGH — cited from gsap.com; `@gsap/react` 2.1.2 already installed in project
- Reduced-motion CSS pattern: HIGH — `--motion-ok` token already exists in project; `calc()` multiplier confirmed
- Vitest matchMedia mocking: HIGH — cited from official blog post; existing `vitest.setup.ts` confirms baseline mock infrastructure

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable APIs — font loading, CSS pseudo-elements, GSAP hooks are stable)
