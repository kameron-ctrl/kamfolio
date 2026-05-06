---
phase: 01-scroll-foundation
reviewed: 2026-05-05T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - .gitignore
  - next.config.mjs
  - postcss.config.mjs
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/components/debug/ScrollDebugHUD.tsx
  - src/components/horizontal-track/HorizontalTrack.tsx
  - src/components/lenis-provider/LenisProvider.tsx
  - src/lib/__tests__/scroll-store.test.ts
  - src/lib/gsap.ts
  - src/lib/scroll-store.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-05
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 1 delivers a solid scroll foundation. The Zustand store, phase-boundary logic, Lenis/GSAP wiring, and the pinned horizontal track are all well-structured and clearly documented. The unit-test suite for `scroll-store.ts` is thorough and covers edge cases correctly.

One critical issue stands out: `src/lib/gsap.ts` calls `gsap.registerPlugin(ScrollTrigger)` at module scope, which executes during SSR in Next.js App Router whenever the module is imported — this is the exact pitfall documented in CLAUDE.md and the inline comment, but the code does not guard against it. There are also three warnings: a missing listener cleanup in `LenisProvider` (memory-leak risk under React StrictMode), an implicit `displayVelocity` lerp semantic that could surprise callers who omit `velocity`, and an unlogged negative-total edge case in the scroll-progress calculation. Two info items cover a permanently-on `willChange` on the track element and the `ScrollDebugHUD` being present in the production bundle.

---

## Critical Issues

### CR-01: GSAP plugin registered at module scope — crashes on any server-side import

**File:** `src/lib/gsap.ts:14`

**Issue:** `gsap.registerPlugin(ScrollTrigger)` executes at module load time. In Next.js App Router, if any server component (now or in a future refactor) imports this module, the call runs on the server where `window` and `document` are undefined, producing a hard crash. The file's own comment (line 8) correctly warns this must only be imported from `"use client"` components, but a comment is not a runtime guard. CLAUDE.md explicitly lists this scenario under "What NOT to Use": "GSAP plugins must be registered inside `useEffect` (never at module level — SSR will fail)."

**Fix — option A (minimal, in-place guard):**

```ts
// src/lib/gsap.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default gsap;
export { ScrollTrigger };
```

**Fix — option B (preferred, move registration to the guaranteed client context):**

```ts
// src/lib/gsap.ts — pure re-export, no side effects
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export default gsap;
export { ScrollTrigger };

// src/components/lenis-provider/LenisProvider.tsx
useLayoutEffect(() => {
  gsap.registerPlugin(ScrollTrigger); // ← add as first line, before new Lenis(...)
  const lenis = new Lenis({ ... });
  ...
}, []);
```

Option B is aligned with CLAUDE.md guidance and removes the implicit constraint that `gsap.ts` can never be imported server-side.

---

## Warnings

### WR-01: Second Lenis scroll listener is never removed — memory leak under StrictMode

**File:** `src/components/lenis-provider/LenisProvider.tsx:56-67`

**Issue:** The Zustand state-writer (`lenis.on("scroll", (lenisInstance) => { ... })`) registered at line 56 has no corresponding `lenis.off(...)` in the cleanup function (lines 69-73). The cleanup removes the GSAP ticker and calls `lenis.destroy()`, but `lenis.destroy()` does not reliably remove named listeners in all Lenis versions. In React 18 StrictMode, `useLayoutEffect` runs twice (mount → unmount → remount). On the second mount a new anonymous listener is appended, resulting in duplicate Zustand writes per scroll tick and stale-closure behavior if the `lenis` instance is replaced.

**Fix:** Capture a named reference to the handler and remove it explicitly:

```ts
// Replace the anonymous handler with a named one
const onScrollState = (lenisInstance: Lenis): void => {
  const total = document.body.scrollHeight - window.innerHeight;
  const rawProgress = total > 0 ? lenisInstance.animatedScroll / total : 0;
  const { phase, progress } = computePhase(rawProgress);
  useScrollStore.getState().set({
    scrollY: lenisInstance.animatedScroll,
    velocity: lenisInstance.velocity,
    phase,
    progress,
  });
};

lenis.on("scroll", ScrollTrigger.update);
lenis.on("scroll", onScrollState);

return () => {
  lenis.off("scroll", ScrollTrigger.update);
  lenis.off("scroll", onScrollState);
  gsap.ticker.remove(tickerFn);
  lenis.destroy();
  lenisRef.current = null;
};
```

---

### WR-02: `displayVelocity` lerp behavior when `velocity` is absent is implicit and undocumented at the call site

**File:** `src/lib/scroll-store.ts:33-40` and `src/components/lenis-provider/LenisProvider.tsx:61-66`

**Issue:** The `set` action lerps `displayVelocity` using `partial.velocity ?? state.velocity`. When a caller omits `velocity` from `partial`, the lerp advances toward the currently stored `state.velocity`. This is covered by the test at line 81 of the test file, so the behavior is intentional and correct today. The risk is that any future caller who writes `set({ scrollY: x })` without `velocity` will silently trigger a lerp step toward whatever velocity was last stored — including stale velocity values from a previous scroll session. This implicit statefulness is not documented at the `LenisProvider` call site (line 61), making it easy to introduce a regression.

**Fix:** Add a comment at the `LenisProvider` call site making the requirement explicit, and consider narrowing the `set` type so `velocity` is required when any scroll-position update is written:

```ts
// LenisProvider.tsx line 61 — velocity MUST be included; omitting it
// causes displayVelocity to lerp toward stale state.
useScrollStore.getState().set({
  scrollY: lenisInstance.animatedScroll,
  velocity: lenisInstance.velocity, // required — drives displayVelocity lerp
  phase,
  progress,
});
```

---

### WR-03: Negative `total` (content shorter than viewport) is silently treated as no-scroll — not logged in dev

**File:** `src/components/lenis-provider/LenisProvider.tsx:57`

**Issue:** `const total = document.body.scrollHeight - window.innerHeight` can be negative when content is shorter than the viewport (e.g., during dev when a section fails to render or min-height is removed). The guard `total > 0` correctly returns `rawProgress = 0`, but the negative case is indistinguishable from the valid zero-scroll case in the debug HUD, silently masking a layout regression. This is a dev-workflow concern rather than a production bug.

**Fix:** Log a dev-mode warning when total is non-positive:

```ts
const total = document.body.scrollHeight - window.innerHeight;
if (process.env.NODE_ENV === "development" && total <= 0) {
  console.warn(
    "[LenisProvider] document.body.scrollHeight <= window.innerHeight — phase tracking disabled. Check layout min-heights."
  );
}
const rawProgress = total > 0 ? lenisInstance.animatedScroll / total : 0;
```

---

## Info

### IN-01: `willChange: "transform"` is permanently set on the inner track element

**File:** `src/components/horizontal-track/HorizontalTrack.tsx:76`

**Issue:** `willChange: "transform"` is a static inline style that persists for the entire page lifetime. Per project rules (`web/performance.md`), `will-change` should be "used narrowly and removed when done." After the horizontal pin zone is scrolled past, the compositor layer created by `willChange` remains active, consuming GPU memory unnecessarily.

**Fix:** Set and clear `willChange` around the active pin range via ScrollTrigger callbacks, or let GSAP manage it:

```ts
scrollTrigger: {
  // ... existing config ...
  onEnter: () => { track.style.willChange = "transform"; },
  onLeave: () => { track.style.willChange = "auto"; },
  onLeaveBack: () => { track.style.willChange = "auto"; },
},
```

---

### IN-02: `ScrollDebugHUD` unconditional import may retain the component in the production bundle

**File:** `src/app/layout.tsx:4,21`

**Issue:** `ScrollDebugHUD` is imported at the module level and rendered unconditionally in JSX. The component itself returns `null` in production (line 25 of the component), but whether the module is fully tree-shaken depends on bundler dead-code elimination. The safest approach for a dev-only tool is to prevent the module from entering the production bundle entirely.

**Fix:** Guard the JSX render with a build-time constant (Webpack/Turbopack eliminates `false` branches and their imports):

```tsx
{process.env.NODE_ENV === "development" && <ScrollDebugHUD />}
```

Or use `next/dynamic` with an environment-gated import for guaranteed exclusion:

```tsx
import dynamic from "next/dynamic";

const ScrollDebugHUD =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/debug/ScrollDebugHUD"), { ssr: false })
    : () => null;
```

---

_Reviewed: 2026-05-05_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
