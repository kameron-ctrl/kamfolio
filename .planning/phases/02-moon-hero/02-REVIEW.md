---
phase: 02-moon-hero
reviewed: 2026-05-06T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/app/globals.css
  - src/app/layout.tsx
  - src/components/canvas/__tests__/MoonScene.test.tsx
  - src/components/canvas/MoonGlow.tsx
  - src/components/canvas/MoonScene.client.tsx
  - src/components/canvas/MoonScene.constants.ts
  - src/components/canvas/MoonScene.tsx
  - src/styles/tokens.css
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-06
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Phase 02 delivers the photorealistic moon hero: NASA-textured sphere, GSAP Z fly-in entrance, atmospheric glow, and a DPR-capped global R3F canvas. The architecture is solid — SSR concerns are correctly handled with `dynamic({ ssr: false })`, constants are centralized, and the reduced-motion path is wired. No critical security or data-loss issues were found.

Three warnings deserve attention before the phase is merged: a debug component (`ScrollDebugHUD`) ships unconditionally to production; there is a one-frame flash risk from a race between `useEffect` and `useGSAP` when setting the initial mesh position; and `prefersReducedMotion()` is called at render time for the rotation path rather than reactively. Four informational items cover minor quality gaps.

---

## Warnings

### WR-01: Debug HUD ships unconditionally to production

**File:** `src/app/layout.tsx:6,23`
**Issue:** `ScrollDebugHUD` is imported and rendered in `RootLayout` with no environment guard. Every production visitor downloads and mounts the debug component. Even if the component renders nothing visually in production (e.g. via an internal guard), the import still contributes to the JS bundle and the component still executes.
**Fix:**
```tsx
// Option A — environment guard at render site
{process.env.NODE_ENV !== "production" && <ScrollDebugHUD />}

// Option B — dynamic import so the module is excluded from the prod bundle entirely
const ScrollDebugHUD = dynamic(
  () => import("@/components/debug/ScrollDebugHUD"),
  { ssr: false }
);
// Then guard at render site:
{process.env.NODE_ENV !== "production" && <ScrollDebugHUD />}
```

---

### WR-02: One-frame flash risk — initial mesh position set in `useEffect` instead of synchronously

**File:** `src/components/canvas/MoonScene.tsx:94-98`
**Issue:** `useEffect` fires after the browser has committed the first paint. On that first frame the mesh renders at its default `position (0, 0, 0)` — centered, full size — before the effect snaps it to `(MOON_X_OFFSET, 0, MOON_ENTRANCE_START_Z)`. The canvas wrapper starts at `opacity: 0` which suppresses this in most cases, but the opacity transition to visible begins after `onReady` fires (texture upload), and a slow GPU or a fast React reconciler could produce a visible frame at the wrong position. The more robust fix is to set the initial position synchronously inside `useGSAP`, which already has access to `meshRef.current` and runs before any tween starts, eliminating the separate `useEffect`.
**Fix:**
```tsx
useGSAP(
  () => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Set starting position synchronously — no separate useEffect needed.
    mesh.position.set(MOON_X_OFFSET, 0, MOON_ENTRANCE_START_Z);

    if (prefersReducedMotion()) {
      mesh.position.z = MOON_ENTRANCE_END_Z;
      return;
    }

    gsap.to(mesh.position, {
      z: MOON_ENTRANCE_END_Z,
      duration: MOON_ENTRANCE_DURATION,
      ease: MOON_ENTRANCE_EASE,
    });
  },
  { scope: meshRef },
);

// Remove the standalone useEffect block (lines 94-98).
```

---

### WR-03: `prefersReducedMotion()` called at render time — not reactive to mid-session OS changes

**File:** `src/components/canvas/MoonScene.tsx:125`
**Issue:** `prefersReducedMotion()` is called directly in the component function body on every render to compute `rotationDelta`. This is not reactive: if a user enables "reduce motion" in their OS settings while the page is open, the rotation continues until the component re-renders for another reason. Additionally, calling `window.matchMedia(...)` on every render is wasteful. (The entrance path inside `useGSAP` only calls this once at mount, which is fine.)
**Fix:**
```tsx
// Read once at mount with useMemo.
// For full reactivity, replace with a useReducedMotion hook that
// subscribes to the MediaQueryList "change" event.
const rotationDelta = useMemo(
  () => (prefersReducedMotion() ? 0 : MOON_ROTATION_PER_FRAME),
  [] // intentionally empty — read once at mount
);
```
Or introduce a `useReducedMotion` hook in `src/hooks/` (consistent with the project file structure convention) that subscribes to the `MediaQueryList` change event.

---

## Info

### IN-01: Hardcoded `color: #ffffff` in globals.css — missing `--color-text` token

**File:** `src/app/globals.css:9`
**Issue:** `color: #ffffff` is a raw hex literal. The design token system in `tokens.css` defines the space palette (`--color-space`, `--color-void`, `--color-moon-glow`) but has no `--color-text` token. Per the project's CSS custom properties convention, text color should be tokenized alongside the background.
**Fix:**
```css
/* tokens.css — add to :root */
--color-text: #ffffff;

/* globals.css — replace literal */
body {
  background-color: var(--color-space);
  color: var(--color-text);
}
```

---

### IN-02: Debug tokens ship in production CSS

**File:** `src/styles/tokens.css:13-14`
**Issue:** `--color-debug-bg` and `--color-debug-text` are declared at `:root` unconditionally. These tokens are only consumed by `ScrollDebugHUD`. Every production visitor receives these declarations. The impact is minimal (two CSS custom properties) but it couples debug tooling to the production token sheet.
**Fix:** Move debug tokens to a dedicated `src/styles/debug.css` imported only inside `ScrollDebugHUD`, or co-locate them in the debug component's own stylesheet.

---

### IN-03: Redundant callback wrapper passed to `useTexture`

**File:** `src/components/canvas/MoonScene.tsx:88`
**Issue:** `() => onReady()` wraps `onReady` in an anonymous function unnecessarily. `onReady` is already a stable reference from `useCallback` in the parent (`MoonScene.client.tsx:31`). The wrapper creates a new function allocation on every render.
**Fix:**
```tsx
// Before
const textures = useTexture({ ... }, () => onReady());

// After
const textures = useTexture({ ... }, onReady);
```

---

### IN-04: Scene-local constants not exported from `MoonScene.constants.ts`

**File:** `src/components/canvas/MoonScene.tsx:42-62`
**Issue:** `MOON_RADIUS`, `MOON_SEGMENTS`, `MOON_DISPLACEMENT_SCALE`, `SUN_POSITION`, `SUN_INTENSITY`, `SUN_COLOR`, and `AMBIENT_INTENSITY` are declared as module-level constants inside `MoonScene.tsx` rather than in `MoonScene.constants.ts`. The constants file is documented as the "single source of truth" for the scene, and several of these values are spec-locked by `CONTEXT.md` (e.g. D-05 specifies `MOON_RADIUS = 1.5`). Keeping them in the component file means they cannot be tested without importing the full Three.js-dependent module into the test suite.
**Fix:** Migrate the scene-local constants to `MoonScene.constants.ts` and import them back into `MoonScene.tsx`. Add corresponding assertions in `MoonScene.test.tsx` for spec-locked values (e.g. `MOON_RADIUS`, `MOON_SEGMENTS`).

---

_Reviewed: 2026-05-06_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
