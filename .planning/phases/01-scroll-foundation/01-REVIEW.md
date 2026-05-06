---
phase: 01-scroll-foundation
reviewed: 2026-05-06T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - .eslintrc.json
  - .gitignore
  - next.config.mjs
  - package.json
  - postcss.config.mjs
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/components/debug/ScrollDebugHUD.tsx
  - src/components/horizontal-track/HorizontalTrack.tsx
  - src/components/lenis-provider/LenisProvider.tsx
  - src/lib/__tests__/scroll-store.test.ts
  - src/lib/gsap.ts
  - src/lib/scroll-store.ts
  - tailwind.config.ts
  - tsconfig.json
  - vitest.config.ts
  - vitest.setup.ts
findings:
  critical: 0
  warning: 1
  info: 4
  total: 5
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-06
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

This is a re-review following the fix pass for CR-01, WR-01, WR-02, and WR-03. All four previous findings are confirmed resolved:

- **CR-01 (FIXED):** `gsap.registerPlugin(ScrollTrigger)` is now inside `useLayoutEffect` in `LenisProvider.tsx`, not at module scope. `src/lib/gsap.ts` is a clean, side-effect-free re-export.
- **WR-01 (FIXED):** The Lenis scroll listener for Zustand state writing is now a named `onScrollState` function with a corresponding `lenis.off("scroll", onScrollState)` in the cleanup block.
- **WR-02 (FIXED):** A comment at the `LenisProvider` call site now explicitly documents that `velocity` must always be included in the `set()` call, and why.
- **WR-03 (FIXED):** A `process.env.NODE_ENV === "development"` guard with `console.warn` now fires when `document.body.scrollHeight <= window.innerHeight`.

The overall architecture is clean. The Zustand store, phase boundary logic, `computePhase` helper, Lenis/GSAP wiring, and `HorizontalTrack` pin/scrub are all well-structured and correctly implemented. The unit-test suite for `scroll-store.ts` is thorough and all test expectations match the implementation.

One warning surfaces: `ScrollDebugHUD` is unconditionally imported in `layout.tsx`, meaning its Zustand selector subscriptions ship in the production bundle despite the component rendering `null`. The remaining findings are informational — an unpinned `sharp` dependency, missing CSS design tokens, and permanent `willChange` on the track element.

---

## Warnings

### WR-01: `ScrollDebugHUD` unconditional import ships Zustand subscriptions in the production bundle

**File:** `src/app/layout.tsx:4,21`

**Issue:** `ScrollDebugHUD` is statically imported and unconditionally included in JSX. The component checks `process.env.NODE_ENV !== "development"` and returns `null` in production, which prevents visible output. However, the static `import` at line 4 means the module and all its code — including five `useScrollStore(...)` selector hooks — are included in the production JavaScript bundle. Next.js / Webpack can tree-shake unused exports from a module but cannot eliminate a module that is imported and mounted in JSX, even if its render result is `null`.

In production, these five selector hooks are called on every render of the layout tree, each subscribing to the Zustand store and scheduling re-renders when scroll state changes — even though the component produces no DOM.

**Fix:** Gate the JSX render on the environment constant. Bundlers eliminate branches where `process.env.NODE_ENV === "development"` is `false` at build time, including the import itself when the module is only referenced inside the eliminated branch:

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          {children}
          {process.env.NODE_ENV === "development" && <ScrollDebugHUD />}
        </LenisProvider>
      </body>
    </html>
  );
}
```

If guaranteed bundle exclusion is required, use `next/dynamic`:

```tsx
import dynamic from "next/dynamic";

const ScrollDebugHUD =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/debug/ScrollDebugHUD"), { ssr: false })
    : () => null;
```

---

## Info

### IN-01: `"sharp": "latest"` uses an unpinned tag — risks silent breaking changes

**File:** `package.json:24`

**Issue:** All other dependencies use caret ranges (`^`) which constrain updates within a major version. `sharp` uses the literal `"latest"` tag, which resolves to whatever is the highest published version at install time — including new major versions with breaking API changes. A future `npm install` or CI cache invalidation could silently pick up a major `sharp` upgrade.

**Fix:** Replace with a caret range pinned to the current major. Run `npm ls sharp` to confirm the installed version, then pin it:

```json
"sharp": "^0.33.0"
```

---

### IN-02: `willChange: "transform"` is permanently set on the horizontal track element

**File:** `src/components/horizontal-track/HorizontalTrack.tsx:77`

**Issue:** `willChange: "transform"` is a static inline style that persists for the full page lifetime. Per project rules (`web/performance.md`): "Use `will-change` narrowly and remove it when done." After the horizontal pin zone is scrolled past, the compositor layer created by `willChange` remains active, holding GPU memory for a transform that is no longer animating.

**Fix:** Set and clear `willChange` via ScrollTrigger lifecycle callbacks so the compositor layer is promoted only while the pin is active:

```ts
scrollTrigger: {
  // ... existing config ...
  onEnter:     () => { track.style.willChange = "transform"; },
  onLeave:     () => { track.style.willChange = "auto"; },
  onLeaveBack: () => { track.style.willChange = "auto"; },
  onEnterBack: () => { track.style.willChange = "transform"; },
},
```

---

### IN-03: No CSS custom property tokens defined — design system groundwork missing

**File:** `src/app/globals.css:1-3` and `tailwind.config.ts:8-10`

**Issue:** `globals.css` contains only Tailwind directives. `tailwind.config.ts` has an empty `theme.extend`. Per the web coding style guide, design tokens (palette, spacing, typography scale, easing, durations) must be defined as CSS custom properties in `:root` before design-phase work begins. Placeholder inline styles in `page.tsx` use raw hex strings (`"#0a0a1a"`, `"#1a1a3e"`, etc.) that will accumulate as magic values if a token system is not established before Phase 2.

**Fix:** Establish a minimal token foundation in `globals.css` before Phase 2:

```css
:root {
  /* Palette */
  --color-void:    #0a0a1a;
  --color-surface: #1a1a3e;
  --color-text:    #ffffff;
  --color-accent:  oklch(68% 0.21 250);

  /* Motion */
  --duration-fast:   150ms;
  --duration-normal: 300ms;
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

### IN-04: `ScrollDebugHUD` comment overstates "zero runtime cost" in production

**File:** `src/components/debug/ScrollDebugHUD.tsx:9-11`

**Issue:** The comment on lines 9-11 states "zero runtime cost, zero info leakage" for production builds. This claim is accurate only if the module is excluded from the production bundle. As implemented, the module is statically imported and mounted unconditionally (see WR-01), so the five selector hooks do execute at runtime. The comment creates a false guarantee that could mislead future maintainers into assuming the component is already production-safe without the JSX gate.

**Fix:** Resolved by WR-01. Once the JSX gate is in place, the comment's claim becomes accurate. No independent change needed beyond WR-01.

---

_Reviewed: 2026-05-06_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
