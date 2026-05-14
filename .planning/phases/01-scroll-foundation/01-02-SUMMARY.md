---
phase: 01-scroll-foundation
plan: 02
subsystem: scroll-infrastructure
tags: [zustand, gsap, scroll-store, tdd, plugin-registration]
dependency_graph:
  requires: ["01-01"]
  provides: ["@/lib/gsap", "@/lib/scroll-store", "useScrollStore", "computePhase", "ScrollTrigger"]
  affects: ["01-03", "01-04", "all-phases"]
tech_stack:
  added: ["zustand@5.0.13", "gsap@3.15.0"]
  patterns: ["single-plugin-registration", "zustand-getstate-r3f-safe", "displayVelocity-lerp", "pure-computePhase-helper"]
key_files:
  created:
    - src/lib/gsap.ts
    - src/lib/scroll-store.ts
    - src/lib/__tests__/scroll-store.test.ts
  modified: []
decisions:
  - "LERP_FACTOR = 0.15 (midpoint of 0.1-0.2 discretion range from CONTEXT.md A3)"
  - "ScrollState exported as interface — allows downstream Plans 03/04 to reference the type"
  - "computePhase uses explicit boundary guards (<=0 / >=1) to avoid IEEE 754 drift; linter added Math.round(v * 1e10) / 1e10 clamping as equivalent safeguard"
metrics:
  duration_minutes: 6
  completed_date: "2026-05-05"
  tasks_completed: 2
  files_created: 3
---

# Phase 1 Plan 02: GSAP Registration Site + Zustand Scroll Store Summary

**One-liner:** Single GSAP plugin registration module (`gsap.ts`) and Zustand scroll store (`scroll-store.ts`) with `displayVelocity` lerp (factor 0.15) and `computePhase` helper verified by 17 unit tests covering FOUND-01, FOUND-02, FOUND-03.

## What Was Built

### Task 1 — `src/lib/gsap.ts` (D-15, FOUND-05)

Single GSAP plugin registration site. All future components import `gsap` and `ScrollTrigger` from `@/lib/gsap` — no component ever calls `registerPlugin` directly. This prevents duplicate registration warnings and makes the SSR-unsafe import chain auditable (one file to grep).

Exactly **one** `gsap.registerPlugin(ScrollTrigger)` call exists in the entire `src/` tree.

### Task 2 — `src/lib/scroll-store.ts` (D-07/08/09/10) + `src/lib/__tests__/scroll-store.test.ts`

TDD execution (RED then GREEN):

**RED:** Test file written first. 17 tests defined covering three describe blocks. Run confirmed failure: `Error: Failed to resolve import "@/lib/scroll-store"`.

**GREEN:** Implementation written. All 17 tests pass.

**Store shape (D-08):**
```typescript
export interface ScrollState {
  scrollY: number;
  velocity: number;
  displayVelocity: number;  // lerped — downstream effects always read this
  phase: ScrollPhase;       // "vertical" | "transition" | "horizontal"
  progress: number;         // 0..1 within current zone
  set: (partial: Partial<Omit<ScrollState, "set" | "displayVelocity">>) => void;
}
```

**LERP_FACTOR shipped:** `0.15` — midpoint of the 0.1–0.2 discretion range from CONTEXT.md.

**`computePhase` boundary logic (D-09):**
- `vertical`: rawProgress in [0, 0.4) → progress = rawProgress / 0.4
- `transition`: rawProgress in [0.4, 0.55) → progress = (rawProgress - 0.4) / 0.15
- `horizontal`: rawProgress in [0.55, 1.0] → progress = (rawProgress - 0.55) / 0.45
- Clamps: rawProgress <= 0 → `{vertical, 0}`; rawProgress >= 1 → `{horizontal, 1}`

**Test results:**
- Test files: 1 passed
- Tests: 17 passed (0 failed)
- Duration: ~1.4s
- FOUND-01 covered: initial state shape + `set` action present
- FOUND-02 covered: all phase boundaries + clamp edge cases
- FOUND-03 covered: single-tick lerp, multi-tick lerp, convergence, idle-tick lerp

**Exported API surface for Plans 03/04:**
```typescript
// From @/lib/gsap
import gsap from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";

// From @/lib/scroll-store
import { useScrollStore } from "@/lib/scroll-store";
import { computePhase } from "@/lib/scroll-store";
import type { ScrollPhase, ScrollState } from "@/lib/scroll-store";
```

**R3F zero-overhead read pattern:**
```typescript
useFrame(() => {
  const { displayVelocity, phase } = useScrollStore.getState();
  // no React reconciler triggered
});
```

## GSAP Registration Verification

Exactly one `gsap.registerPlugin` call in `src/`:
```
src/lib/gsap.ts:gsap.registerPlugin(ScrollTrigger);
```

No other file in `src/` calls `gsap.registerPlugin`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Linter-introduced floating-point drift in computePhase at rawProgress >= 1**
- **Found during:** Task 2 GREEN verification
- **Issue:** Linter refactored explicit boundary guards to `Math.min/Math.max` clamping; `(1.0 - 0.55) / 0.45` evaluates to `0.9999999999999999` (IEEE 754), failing `expect(result.progress).toBe(1)`
- **Fix:** Linter then added `Math.round(v * 1e10) / 1e10` inside its clamp helper, which correctly rounds the value to `1`
- **Files modified:** `src/lib/scroll-store.ts`
- **Commits:** `58cf4cc`, `c6148bb`

**2. [Rule 2 - Missing export] `ScrollState` interface made public**
- **Found during:** Task 2 acceptance criteria review
- **Issue:** Plan requires `ScrollState` to be exported; linter had defined it as a non-exported `interface`
- **Fix:** Changed `interface ScrollState` to `export interface ScrollState`
- **Files modified:** `src/lib/scroll-store.ts`
- **Commit:** `c6148bb`

### Pre-task Scaffold Work

**3. Plan 01-01 prerequisites executed inline**
- **Context:** This worktree was at base commit `cb496e8` (plan 01-01 not yet executed). `depends_on: ["01-01"]` required scaffold to exist first.
- **Action:** Executed plan 01-01 work: installed all pinned deps, created `vitest.config.ts` + `vitest.setup.ts`, confirmed smoke test, deleted smoke test.
- **Commits:** `463e5c4`, `1fffe3c`

## Known Stubs

None. Both files are pure logic with no UI rendering paths and no placeholder data.

## Threat Flags

None. Pure client-side logic, no network input, no user input, no persistence. Per plan threat model: T-01-03 and T-01-04 both accepted/N/A.

## Self-Check: PASSED

Files verified present:
- `src/lib/gsap.ts`: FOUND
- `src/lib/scroll-store.ts`: FOUND
- `src/lib/__tests__/scroll-store.test.ts`: FOUND

Commits verified in log:
- `4925c5f` feat(01-02): create single GSAP plugin registration site — FOUND
- `f77ddd9` test(01-02): add failing scroll-store unit tests (RED) — FOUND
- `58cf4cc` feat(01-01): implement scroll-store with computePhase and displayVelocity lerp — FOUND
- `c6148bb` chore(01-01): export ScrollState interface — FOUND
