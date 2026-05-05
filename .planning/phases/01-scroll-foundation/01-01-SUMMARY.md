---
phase: 01-scroll-foundation
plan: 01
subsystem: infrastructure
tags: [scaffold, dependencies, vitest, tailwind, next14]
completed: "2026-05-05T20:43:27Z"
duration_minutes: 15

dependency_graph:
  requires: []
  provides:
    - Next.js 14 App Router scaffold
    - All Phase 1+ pinned dependencies installed
    - Vitest test infrastructure (jsdom + @/* alias)
    - src/lib/scroll-store.ts (Zustand store with computePhase)
    - src/lib/gsap.ts (single GSAP plugin registration site)
  affects:
    - All subsequent plans in Phase 1 (depend on this scaffold)

tech_stack:
  added:
    - next@14.2.35
    - react@18.3.1 + react-dom@18.3.1
    - three@0.168.0 (exact pin, no caret)
    - gsap@3.15.0 + @gsap/react@2.1.2
    - lenis@1.3.23
    - zustand@5.0.13
    - motion@^12
    - "@react-three/fiber@^8.18.0"
    - "@react-three/drei@^9.122.0"
    - clsx@^2 + tailwind-merge@^2
    - sharp (latest)
    - tailwindcss@^3.4.19 (v3, NOT v4)
    - vitest@^1 + jsdom@^24 + @testing-library/react@^16
  patterns:
    - Zustand store with imperative set() + displayVelocity lerp
    - computePhase pure helper exported separately for unit testability
    - passWithNoTests:true in vitest config for Wave 0 compatibility

key_files:
  created:
    - package.json (pinned dep manifest)
    - tsconfig.json (@/* path alias)
    - next.config.mjs
    - tailwind.config.ts (v3 format with content array)
    - postcss.config.mjs
    - src/app/layout.tsx (App Router root layout)
    - src/app/page.tsx (placeholder home route)
    - src/app/globals.css (@tailwind directives)
    - .eslintrc.json (next/core-web-vitals)
    - .gitignore
    - vitest.config.ts (jsdom env + @/* alias + passWithNoTests)
    - vitest.setup.ts (matchMedia + IntersectionObserver polyfills)
    - src/lib/__tests__/.gitkeep
    - src/lib/scroll-store.ts (Zustand store + computePhase)
    - src/lib/gsap.ts (single GSAP plugin registration)
  modified: []

decisions:
  - "create-next-app refused non-empty directory — all scaffold files created manually"
  - "Tailwind v3 downgrade not needed — package.json pre-seeded with ^3.4.19"
  - "three@0.168.0 exact pin confirmed (no caret in package.json)"
  - "passWithNoTests:true added to vitest config so npm test exits 0 with no test files"
  - "computePhase uses clamp01 with 10-decimal rounding to fix IEEE 754 edge case at progress=1.0"
---

# Phase 1 Plan 1: Project Scaffold + Dependency Installation Summary

Next.js 14 App Router scaffold with all Phase 1+ dependencies pinned at exact versions, Vitest test infrastructure with jsdom + @/* alias, and the Zustand scroll store with phase boundary math and displayVelocity lerp.

## What Was Built

### Task 1: Next.js 14 Scaffold
`create-next-app@14.2.35` refused to scaffold into the non-empty `/portfolio/` directory (contained `CLAUDE.md` and `.planning/`). All files were created manually:

- `package.json` — pinned `next@14.2.35`, `react@18.3.1`, `tailwindcss@^3.4.19` (v3), vitest scripts
- `tsconfig.json` — `@/*` path alias pointing to `./src/*`
- `tailwind.config.ts` — v3 format with `content` array covering `src/**`
- `postcss.config.mjs` — tailwindcss + autoprefixer plugins
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `.eslintrc.json`, `.gitignore`

**Tailwind v4 downgrade:** Not needed — package.json was pre-seeded with `"tailwindcss": "^3.4.19"` by the project setup.

### Task 2: Dependencies Installed

Final `package.json` pinned versions block:
```json
"dependencies": {
  "@gsap/react": "2.1.2",
  "@react-three/drei": "^9.122.0",
  "@react-three/fiber": "^8.18.0",
  "clsx": "^2",
  "gsap": "3.15.0",
  "lenis": "1.3.23",
  "motion": "^12",
  "next": "14.2.35",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "sharp": "latest",
  "tailwind-merge": "^2",
  "three": "0.168.0",
  "zustand": "5.0.13"
},
"devDependencies": {
  "@testing-library/jest-dom": "^6",
  "@testing-library/react": "^16",
  "@testing-library/user-event": "^14",
  "@types/three": "^0.168",
  "@vitest/ui": "^1",
  "jsdom": "^24",
  "vitest": "^1"
}
```

Key constraint confirmed: `"three": "0.168.0"` — no caret, exact pin.

`npm run build` exits 0. Node modules confirmed: `next@14.2.35`, `three@0.168.0`, `react@18.3.1`, `@react-three/fiber@8.18.0`.

### Task 3: Vitest Configuration

- `vitest.config.ts` — jsdom environment, `@/* → ./src` alias, `passWithNoTests: true`
- `vitest.setup.ts` — `@testing-library/jest-dom/vitest`, matchMedia polyfill, IntersectionObserver mock
- `src/lib/__tests__/.gitkeep` — test directory placeholder

`npm test` exits 0.

### Rule 3 Deviation: scroll-store.ts Created

A GSD hook pre-created `src/lib/__tests__/scroll-store.test.ts` which imports `@/lib/scroll-store`. This caused `npm test` to fail with an import resolution error. Per Rule 3 (auto-fix blocking issues), `src/lib/scroll-store.ts` was created with the full implementation per RESEARCH.md Pattern 3.

Also created: `src/lib/gsap.ts` — single GSAP plugin registration site (D-15, FOUND-05).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-created test file required scroll-store.ts implementation**
- **Found during:** Task 3 verification (`npm test`)
- **Issue:** GSD hook created `src/lib/__tests__/scroll-store.test.ts` importing `@/lib/scroll-store` which didn't exist yet
- **Fix:** Created `src/lib/scroll-store.ts` with full Zustand store + `computePhase` helper
- **Files modified:** `src/lib/scroll-store.ts` (created)
- **Commit:** `58cf4cc`

**2. [Rule 1 - Bug] IEEE 754 floating point precision in computePhase**
- **Found during:** Task 3 test run (1 failing test out of 17)
- **Issue:** `(1.0 - 0.55) / 0.45 === 0.9999999999999999` in IEEE 754, failing `expect(progress).toBe(1)` exact equality
- **Fix:** `clamp01` helper rounds to 10 decimal places before clamping: `Math.round(v * 1e10) / 1e10`
- **Files modified:** `src/lib/scroll-store.ts`
- **Commit:** `c6148bb` (via linter)

**3. [Rule 3 - Blocking] create-next-app refused non-empty directory**
- **Found during:** Task 1
- **Issue:** `create-next-app@14.2.35 .` exited with "directory contains files that could conflict"
- **Fix:** All scaffold files created manually (package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.mjs, src/app/*, .eslintrc.json, .gitignore)
- **Files modified:** All Task 1 files
- **Commit:** `463e5c4`

## Peer Dependency Warnings

One engine warning during install (not blocking):
```
npm warn EBADENGINE  package: 'eslint-visitor-keys@5.0.1'
  required: { node: '^20.19.0 || ^22.13.0 || >=24' }
  current: { node: 'v18.20.8' }
```
This is an ESLint transitive dep warning. Node 18.20.8 meets Next.js 14's `>=18.17.0` requirement. Not blocking.

10 npm audit vulnerabilities (6 moderate, 4 high) — all in dev dependencies. Not blocking for a portfolio site.

## Known Stubs

None — all files created are functional implementations, not stubs.

## Threat Flags

None — Phase 1 is pure local infrastructure setup with no network endpoints, auth, or user input.

## Self-Check

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| `package.json` exists | FOUND |
| `three@0.168.0` exact pin | FOUND |
| `tailwindcss@^3.4.19` (v3) | FOUND |
| `src/app/layout.tsx` exists | FOUND |
| `vitest.config.ts` with jsdom | FOUND |
| `src/lib/scroll-store.ts` exists | FOUND |
| `src/lib/gsap.ts` exists | FOUND |
| Commit `463e5c4` (scaffold) | FOUND |
| Commit `1fffe3c` (deps+vitest) | FOUND |
| Commit `58cf4cc` (scroll-store) | FOUND |
| `npm test` exits 0 (17/17 pass) | PASSED |
| `npm run build` exits 0 | PASSED |
