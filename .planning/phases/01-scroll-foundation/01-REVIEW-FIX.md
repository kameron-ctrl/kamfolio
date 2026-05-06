---
phase: 01-scroll-foundation
fixed_at: 2026-05-05T00:00:00Z
review_path: .planning/phases/01-scroll-foundation/01-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-05-05
**Source review:** .planning/phases/01-scroll-foundation/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4 (CR-01, WR-01, WR-02, WR-03)
- Fixed: 4
- Skipped: 0

## Fixed Issues

### CR-01: GSAP plugin registered at module scope — crashes on any server-side import

**Files modified:** `src/lib/gsap.ts`, `src/components/lenis-provider/LenisProvider.tsx`
**Commit:** f19efb4
**Applied fix:** Removed `gsap.registerPlugin(ScrollTrigger)` from module scope in `gsap.ts` (Option B from REVIEW.md). The file is now a pure re-export with no side effects. Registration was moved to the first statement inside `useLayoutEffect` in `LenisProvider.tsx`, which is the guaranteed client-only context. The comment in `gsap.ts` was updated to document the new contract.

---

### WR-01: Second Lenis scroll listener is never removed — memory leak under StrictMode

**Files modified:** `src/components/lenis-provider/LenisProvider.tsx`
**Commit:** 7e0c824
**Applied fix:** Replaced the anonymous scroll handler passed to `lenis.on("scroll", ...)` with a named function `onScrollState`. Added explicit `lenis.off("scroll", ScrollTrigger.update)` and `lenis.off("scroll", onScrollState)` calls at the top of the cleanup function, before `gsap.ticker.remove` and `lenis.destroy`. This prevents listener accumulation under React 18 StrictMode's double-invoke behavior.

---

### WR-02: `displayVelocity` lerp behavior when `velocity` is absent is implicit and undocumented at the call site

**Files modified:** `src/components/lenis-provider/LenisProvider.tsx`
**Commit:** 227ad10
**Applied fix:** Added an explanatory comment block directly above the `useScrollStore.getState().set(...)` call inside `onScrollState`, stating that `velocity` must always be included and explaining the stale-lerp consequence of omitting it. Added an inline comment on the `velocity` property line: `// required — drives displayVelocity lerp`.

---

### WR-03: Negative `total` (content shorter than viewport) is silently treated as no-scroll — not logged in dev

**Files modified:** `src/components/lenis-provider/LenisProvider.tsx`
**Commit:** 7856910
**Applied fix:** Added a `process.env.NODE_ENV === "development"` guarded `console.warn` block immediately after `total` is computed inside `onScrollState`. The warning fires when `total <= 0` and includes a message pointing at layout min-heights as the likely cause. Production behavior is unchanged.

---

_Fixed: 2026-05-05_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
