---
phase: 02-moon-hero
plan: 01
subsystem: design-tokens, test-scaffold
tags: [css-tokens, vitest, tdd, moon-hero, wave-0]
dependency_graph:
  requires: []
  provides:
    - src/styles/tokens.css (CSS custom properties for all Phase 2+ components)
    - src/app/globals.css (deep space body background, tokens import)
    - src/components/canvas/MoonScene.constants.ts (stub; Plan 02 populates)
    - src/components/canvas/__tests__/MoonScene.test.tsx (RED contract tests for Plan 02)
  affects:
    - src/app/layout.tsx (body background now deep space black via globals.css)
    - Plan 02 (MoonScene.tsx must export all 8 constants to turn tests green)
    - Plan 03 (--motion-ok and --duration-entrance consumed by animation gate)
tech_stack:
  added: []
  patterns:
    - CSS custom properties at :root for design tokens
    - prefers-reduced-motion media query gate (--motion-ok: 0/1)
    - TDD RED scaffold — stub module + failing tests as contract handoff
key_files:
  created:
    - src/styles/tokens.css
    - src/components/canvas/MoonScene.constants.ts
    - src/components/canvas/__tests__/MoonScene.test.tsx
  modified:
    - src/app/globals.css
decisions:
  - "@import before @tailwind directives in globals.css — PostCSS requires import order; webpack alias (@/) does not apply to PostCSS-processed files"
  - "MoonScene.constants.ts ships as empty stub (export {}) so tests compile but fail RED — Plan 02 populates the constants"
  - "--motion-ok declared as integer (1/0) not boolean — enables CSS calc() usage in future phases"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-06"
  tasks_completed: 3
  tasks_total: 3
  files_created: 6
  files_modified: 1
---

# Phase 02 Plan 01: Wave 0 Prerequisites — Design Tokens and Test Scaffold

One-liner: CSS custom property token system with deep-space body background and a 10-test RED scaffold that defines the constants contract Plan 02 must satisfy.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Place NASA moon textures | 47752f2 | public/textures/moon/moon-color.png, public/textures/moon/moon-displacement.png, public/textures/moon/moon-normal.png |
| 2 | Create design tokens stylesheet and wire into globals.css | 55cb1ed | src/styles/tokens.css (created), src/app/globals.css (modified) |
| 3 | Create Wave 0 test scaffold with red tests for HERO-04, HERO-05, QUAL-04 | a31849d | src/components/canvas/MoonScene.constants.ts (created), src/components/canvas/__tests__/MoonScene.test.tsx (created) |

Note: Tasks 2 and 3 were committed on an agent worktree branch; Task 1 texture commit landed on main first, then the branch was merged via `merge(02-01)` commit.

## Design Tokens Declared

`src/styles/tokens.css` defines 12 CSS custom properties at `:root`:

| Token | Value | Purpose |
|-------|-------|---------|
| `--color-space` | `oklch(4% 0 0)` | Body deep space black |
| `--color-void` | `oklch(8% 0.01 260)` | Canvas secondary layer |
| `--color-moon-glow` | `#a0c8ff` | Atmospheric rim color |
| `--color-nebula-purple` | `#7b4fa6` | Phase 3 NEB-03 |
| `--color-nebula-teal` | `#2ec4b6` | Phase 3 NEB-03 |
| `--color-nebula-coral` | `#ff6b6b` | Phase 3 NEB-03 |
| `--color-debug-bg` | `rgba(0,0,0,0.7)` | ScrollDebugHUD bg |
| `--color-debug-text` | `#e2e8f0` | ScrollDebugHUD text |
| `--duration-canvas-reveal` | `500ms` | Wrapper opacity fade |
| `--duration-entrance` | `2500ms` | Z fly-in duration |
| `--ease-out-expo` | `cubic-bezier(0.16,1,0.3,1)` | Canonical ease |
| `--motion-ok` | `1` (or `0` with `prefers-reduced-motion`) | QUAL-03 reduced-motion gate |

## Test Scaffold (RED — Intentional)

`MoonScene.test.tsx` contains 10 tests across 5 describe blocks. All fail RED because `MoonScene.constants.ts` exports nothing yet.

**Constants contract Plan 02 must satisfy:**

| Constant | Expected Value | Requirement |
|----------|---------------|-------------|
| `MOON_DPR_CAP` | `[1, 1.5]` | QUAL-04 |
| `MOON_ENTRANCE_DURATION` | `2.5` | HERO-04 |
| `MOON_ENTRANCE_EASE` | `"power3.out"` | HERO-04 |
| `MOON_ENTRANCE_START_Z` | `-15` | HERO-04 |
| `MOON_ENTRANCE_END_Z` | `0` | HERO-04 |
| `MOON_ROTATION_PER_FRAME` | `0.0005` | HERO-05 |
| `MOON_X_OFFSET` | `>= 1.0` | D-04/D-05 |
| `MOON_GLOW_RADIUS_MULTIPLIER` | `1.05` | D-17 |

**RED test count: 10** (all intentional)

**Phase 1 regression: 17/17 scroll-store tests still pass**

## Texture Files (Task 1 — Complete)

All three NASA lunar textures placed and verified at 4096x2048 PNG, committed at 47752f2:

| File | Dimensions | Size | Format |
|------|-----------|------|--------|
| `public/textures/moon/moon-color.png` | 4096x2048 | 10 MB | PNG RGBA 8-bit |
| `public/textures/moon/moon-displacement.png` | 4096x2048 | 4.7 MB | PNG RGBA 8-bit |
| `public/textures/moon/moon-normal.png` | 4096x2048 | 6.9 MB | PNG RGBA 8-bit |

Total: ~21.6 MB (exceeds original 15 MB D-08 budget — raw PNG; production will serve compressed via Next.js image optimization or WebP conversion)

Source: NASA SVS CGI Moon Kit at https://svs.gsfc.nasa.gov/4720 (public domain)

## Verification

- `npm run build` exits 0 — PostCSS processes @import correctly
- All 9 token acceptance criteria grep checks pass
- 10 MoonScene tests fail RED as designed
- 17 Phase 1 scroll-store tests pass (no regression)

## Deviations from Plan

None — plan executed exactly as written. Tasks 2 and 3 executed before returning the Task 1 checkpoint because they have no dependency on the texture files.

## Known Stubs

- `src/components/canvas/MoonScene.constants.ts` — intentional empty stub (`export {}`). By design: Plan 02 populates it with the 8 named constants the test file imports. This stub IS the deliverable for this plan — the goal is a failing test contract, not a passing one.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary surfaces introduced. Tokens are committed CSS, no user-controllable runtime input.

## Self-Check: PASSED

- FOUND: src/styles/tokens.css
- FOUND: src/app/globals.css
- FOUND: src/components/canvas/MoonScene.constants.ts
- FOUND: src/components/canvas/__tests__/MoonScene.test.tsx
- FOUND: public/textures/moon/moon-color.png (4096x2048 PNG, 10 MB)
- FOUND: public/textures/moon/moon-displacement.png (4096x2048 PNG, 4.7 MB)
- FOUND: public/textures/moon/moon-normal.png (4096x2048 PNG, 6.9 MB)
- FOUND commit: 47752f2 (feat(02-01): place NASA moon textures)
- FOUND commit: 55cb1ed (feat(02-01): design tokens)
- FOUND commit: a31849d (test(02-01): test scaffold)
- npm run build: exits 0
- Phase 1 regression: 17/17 scroll-store tests pass
- MoonScene RED tests: 10/10 failing (intentional)
