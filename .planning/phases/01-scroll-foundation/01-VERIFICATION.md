---
phase: 01-scroll-foundation
verified: 2026-05-06T11:50:45Z
status: human_needed
score: 8/9 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Open http://localhost:3000 with `npm run dev`, scroll the page"
    expected: "ScrollDebugHUD (top-right) shows scrollY, velocity, displayVelocity, phase, and progress updating in real time"
    why_human: "Lenis smooth scroll feel and live store updates require a running browser — cannot verify with static code analysis"
  - test: "Scroll to approximately 40% page depth"
    expected: "HUD `phase` field changes from `vertical` to `transition`"
    why_human: "Phase boundary correctness at runtime depends on actual document height and Lenis scroll events"
  - test: "Continue scrolling to approximately 55% page depth"
    expected: "HUD `phase` changes to `horizontal`, the section pins (viewport stops moving), and the inner track slides leftward"
    why_human: "GSAP pin + scrub visual behavior and phase transition require a running browser"
  - test: "Scroll past the pin and continue to page end"
    expected: "No visual stutter or position jump at pin entry or exit; vertical scrolling resumes into trailing spacer"
    why_human: "Visual smoothness cannot be verified programmatically"
  - test: "Open browser DevTools Console during the scroll-through"
    expected: "Zero 'GSAP plugin already registered' warnings at any point"
    why_human: "Duplicate plugin registration warnings are runtime console events — not visible in static code"
  - test: "Inspect DevTools for ScrollTrigger debug markers in dev mode"
    expected: "Markers align with the visual section boundaries, confirming FOUND-04: ScrollTrigger fires at Lenis position (not native scrollY)"
    why_human: "ScrollTrigger marker alignment with visual offsets requires side-by-side browser comparison"
---

# Phase 1: Scroll Foundation Verification Report

**Phase Goal:** The scroll infrastructure is wired and all downstream effects have a reliable, synced source of truth
**Verified:** 2026-05-06T11:50:45Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Repository is a runnable Next.js 14 App Router project with TypeScript | VERIFIED | `package.json` has `"next": "14.2.35"`, `npm run build` exits 0 (953B route, zero SSR errors), `tsconfig.json` has `@/*` alias |
| 2 | All Phase 1+ runtime dependencies installed at exact/pinned versions | VERIFIED | `three@0.168.0` (exact, no caret), `gsap@3.15.0`, `lenis@1.3.23`, `zustand@5.0.13`, `@react-three/fiber@^8.18.0`, `motion@^12`; node_modules verified matching |
| 3 | Tailwind CSS v3 configured with content array | VERIFIED | `tailwind.config.ts` has `content` array covering `./src/**`; `globals.css` has `@tailwind base/components/utilities`; `"tailwindcss": "^3.4.19"` in package.json |
| 4 | Vitest configured with jsdom + @/* alias; `npm test` exits 0 | VERIFIED | `vitest.config.ts` has `environment: "jsdom"` and `"@"` alias; `vitest.setup.ts` has matchMedia + IntersectionObserver polyfills; 17/17 tests pass |
| 5 | `@/lib/gsap` exports gsap + ScrollTrigger; exactly one registration site | VERIFIED | `src/lib/gsap.ts` exports `default gsap` and `{ ScrollTrigger }`; exactly one `gsap.registerPlugin(ScrollTrigger)` call in all of `src/` — in `LenisProvider.tsx` inside `useLayoutEffect` per CLAUDE.md |
| 6 | `@/lib/scroll-store` exports correct shape; `computePhase` covers all phase boundaries | VERIFIED | Store exports `useScrollStore`, `computePhase`, `ScrollPhase`, `ScrollState`; shape has all 5 fields + `set`; `LERP_FACTOR=0.15`; 17 unit tests pass covering all boundaries + edge cases |
| 7 | LenisProvider implements 5-step init order with Zustand writes and full cleanup | VERIFIED | `autoRaf: false`, bridge at step 2, `gsap.ticker.add`, `gsap.ticker.lagSmoothing(0)`, `useScrollStore.getState().set({scrollY, velocity, phase, progress})` on scroll; cleanup: `lenis.off` + `ticker.remove` + `lenis.destroy` |
| 8 | HorizontalTrack uses `useGSAP`, outer-pin / inner-animate, correct ScrollTrigger config | VERIFIED | `useGSAP` from `@gsap/react`; separate `sectionRef` (pinned) and `trackRef` (animated `x`); `pin:true`, `scrub:1`, `ease:"none"`, `anticipatePin:1`, `invalidateOnRefresh:true`; imports from `@/lib/gsap` only |
| 9 | Scrolling feels smooth AND HUD shows live updates AND phase transitions correctly | HUMAN NEEDED | All structural code is in place and verified. Runtime behavior requires browser — see Human Verification section |

**Score:** 8/9 must-haves verified (9th requires human)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | Pinned dep manifest with `three@0.168.0` exact | VERIFIED | No caret, exact pin confirmed |
| `tsconfig.json` | TypeScript config with `@/*` path alias | VERIFIED | `"@/*": ["./src/*"]` confirmed |
| `vitest.config.ts` | Vitest config with jsdom environment | VERIFIED | `environment: "jsdom"` + `@` alias + `passWithNoTests: true` |
| `vitest.setup.ts` | Test setup with polyfills | VERIFIED | matchMedia + IntersectionObserver mocks confirmed |
| `tailwind.config.ts` | Tailwind v3 format with content array | VERIFIED | v3 format, `content` array covers `./src/**` |
| `src/app/layout.tsx` | Server Component with LenisProvider + ScrollDebugHUD | VERIFIED | No `"use client"`, wraps children in `<LenisProvider>`, renders `<ScrollDebugHUD />` |
| `src/app/page.tsx` | Demo page: 250vh spacer + HorizontalTrack with 3 slots | VERIFIED | No `"use client"`, 250vh vertical spacer, 3 `PLACEHOLDER_SLOTS` via `.map()` |
| `src/lib/gsap.ts` | GSAP re-export hub | VERIFIED (with documented deviation) | Exports `default gsap` and `{ ScrollTrigger }`; registration moved to LenisProvider per CLAUDE.md |
| `src/lib/scroll-store.ts` | Zustand store with full shape and `computePhase` | VERIFIED | All fields, `LERP_FACTOR=0.15`, `computePhase` exported |
| `src/lib/__tests__/scroll-store.test.ts` | 17 unit tests for FOUND-01/02/03 | VERIFIED | 17/17 pass (initial state, lerp, phase boundaries, clamp edge cases) |
| `src/components/lenis-provider/LenisProvider.tsx` | 5-step Lenis+GSAP wiring hub | VERIFIED | All 5 steps + Zustand write step + full cleanup |
| `src/components/debug/ScrollDebugHUD.tsx` | Dev-only HUD, all 5 store fields | VERIFIED | Hooks called unconditionally, env guard before render, all 5 fields displayed |
| `src/components/horizontal-track/HorizontalTrack.tsx` | GSAP pin+scrub with correct separation | VERIFIED | `useGSAP`, outer pin, inner animate, correct config |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `LenisProvider.tsx` | `lenis` | `new Lenis({ autoRaf: false })` | WIRED | Line 36-41 confirmed |
| `LenisProvider.tsx` | `@/lib/gsap.ts` | `import gsap, { ScrollTrigger } from "@/lib/gsap"` | WIRED | Line 20 confirmed (double-quote import) |
| `LenisProvider.tsx` | `@/lib/scroll-store.ts` | `useScrollStore.getState().set(...)` | WIRED | Line 76, called inside named scroll callback |
| `LenisProvider.tsx` | `ScrollTrigger.update` | `lenis.on("scroll", ScrollTrigger.update)` | WIRED | Line 45, bridge wired before any triggers |
| `layout.tsx` | `LenisProvider` | `<LenisProvider>{children}</LenisProvider>` | WIRED | Lines 19-22 confirmed |
| `src/lib/gsap.ts` | `gsap/ScrollTrigger` | registerPlugin at module level | DEVIATED | Intentional: CLAUDE.md mandates registration inside effect, not module scope. One registration site exists (LenisProvider:33). FOUND-05 achieved. |
| `scroll-store.test.ts` | `@/lib/scroll-store` | `import { useScrollStore, computePhase }` | WIRED | Line 2 confirmed (double-quote import; gsd-tools false negative on quote style) |
| `HorizontalTrack.tsx` | `@/lib/gsap.ts` | `import gsap, { ScrollTrigger } from "@/lib/gsap"` | WIRED | Line 28 confirmed |
| `HorizontalTrack.tsx` | `@gsap/react` | `import { useGSAP }` | WIRED | Line 27 confirmed |
| `HorizontalTrack.tsx` | ScrollTrigger pin | `pin: true, scrub: 1` inside `gsap.to` | WIRED | Lines 54-55 confirmed |
| `page.tsx` | `HorizontalTrack` | `<HorizontalTrack>` with 3 slot children | WIRED | Lines 56-79 confirmed |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `ScrollDebugHUD.tsx` | `scrollY`, `velocity`, `displayVelocity`, `phase`, `progress` | `useScrollStore` selectors | Yes — store populated by Lenis scroll events in LenisProvider | FLOWING |
| `HorizontalTrack.tsx` | `x` transform on trackRef | `gsap.to(track, { x: () => -getDistance() })` | Yes — computed from `track.scrollWidth - window.innerWidth` at runtime | FLOWING |
| `useScrollStore` | `scrollY`, `velocity`, `phase`, `progress` | `lenis.on("scroll", onScrollState)` callback | Yes — `lenisInstance.animatedScroll` and `lenisInstance.velocity` are real Lenis values | FLOWING |
| `useScrollStore` | `displayVelocity` | `set()` lerp formula in `scroll-store.ts` | Yes — lerps toward `velocity` each tick; verified by 6 unit tests | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 17 scroll-store unit tests pass | `npm test -- --run` | 17/17 passed, exit 0 | PASS |
| Production build has zero SSR errors | `npm run build` | Exit 0, route 932B, zero errors | PASS |
| Exactly one GSAP registration call in `src/` | `grep -rn "gsap\.registerPlugin(" src/` | 1 result: `LenisProvider.tsx:33` inside `useLayoutEffect` | PASS |
| `layout.tsx` has no `"use client"` (server boundary intact) | grep check | No match | PASS |
| `page.tsx` has no `"use client"` (server boundary intact) | grep check | No match | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| FOUND-01 | 01-01, 01-02, 01-03 | Site scrolls smoothly with Lenis, exposing velocity to all visual effects | SATISFIED (code) + HUMAN (runtime feel) | LenisProvider wires Lenis `autoRaf:false`; `velocity` written to store on every tick; store shape unit-tested |
| FOUND-02 | 01-02, 01-04 | Page transitions vertical→horizontal with correct phase boundaries without jank | SATISFIED (code) + HUMAN (visual) | `computePhase` boundaries verified by 9 unit tests; HorizontalTrack pin+scrub wired; 250vh spacer aligns pin at ~55% |
| FOUND-03 | 01-02 | Scroll velocity drives visual effects via `displayVelocity` lerp | SATISFIED | `displayVelocity` lerp with `LERP_FACTOR=0.15`; verified by 6 unit tests; exported for downstream consumption |
| FOUND-04 | 01-03, 01-04 | GSAP ScrollTrigger fires at Lenis position (not native scrollY) | SATISFIED (code) + HUMAN (visual) | Bridge `lenis.on("scroll", ScrollTrigger.update)` at step 2 before any triggers; HorizontalTrack registers after bridge |
| FOUND-05 | 01-01, 01-02 | Single GSAP plugin registration site — no duplicate registrations | SATISFIED | Exactly one `gsap.registerPlugin(ScrollTrigger)` call in `src/`; in `useLayoutEffect` in LenisProvider |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|---------|--------|
| `src/app/page.tsx` | 21-24 | `PLACEHOLDER_SLOTS` name contains "PLACEHOLDER" | INFO | Intentional per D-13 — Phase 1 mandates placeholder content; real cards arrive in Phase 5 |
| `src/components/debug/ScrollDebugHUD.tsx` | 25 | `return null` guarded by `NODE_ENV` check | INFO | Intentional production guard per D-14 — Next.js tree-shakes in production builds |

No blockers. Both flagged patterns are required by design decisions in the plan.

### Human Verification Required

#### 1. Lenis Smooth Scroll Feel + Live Store Updates

**Test:** Run `npm run dev`, open http://localhost:3000, scroll the page
**Expected:** The scroll feels physically smooth — no native scroll jank. The ScrollDebugHUD overlay in the top-right updates `scrollY`, `velocity`, `displayVelocity`, `phase`, and `progress` in real time on each scroll tick.
**Why human:** Lenis smooth scroll "feel" and live Zustand store updates visible in the HUD require a running browser — cannot be confirmed by static code analysis alone.

#### 2. Phase Boundary Transitions (FOUND-02)

**Test:** Starting from the top, scroll slowly down through the full page
**Expected:** HUD `phase` field changes from `vertical` to `transition` at approximately 40% scroll depth, then to `horizontal` at approximately 55% scroll depth
**Why human:** Actual phase transitions depend on runtime document height, Lenis scroll event firing, and HUD rendering.

#### 3. Horizontal Pin + Scrub Behavior (FOUND-02, FOUND-04)

**Test:** Continue scrolling past 55% depth
**Expected:** The `<section>` pins to the viewport; the inner placeholder track slides leftward. After all 3 placeholder slots pass, the page unpins and resumes vertical scrolling into the trailing spacer. No visual stutter or position jump at pin entry or exit.
**Why human:** GSAP pin + scrub visual behavior and absence of stutter require a running browser.

#### 4. No Duplicate GSAP Registration Warnings (FOUND-05)

**Test:** Open browser DevTools Console. Scroll through the full page sequence.
**Expected:** Zero "GSAP plugin already registered" or related warnings at any point.
**Why human:** Browser console warnings are runtime events — cannot be verified statically.

#### 5. ScrollTrigger Markers Confirm Lenis Sync (FOUND-04)

**Test:** With dev server running, observe ScrollTrigger start/end markers (enabled in dev via `process.env.NODE_ENV === "development"`)
**Expected:** Markers appear at the visual section boundary, confirming FOUND-04 — trigger fires at Lenis `animatedScroll` offsets, not native `window.scrollY`
**Why human:** Marker position vs. visual element alignment requires side-by-side browser inspection.

### Gaps Summary

No automated gaps found. The one plan-vs-actual deviation (`gsap.registerPlugin` location) is an intentional correction to follow CLAUDE.md's SSR guidance and does not constitute a gap — the FOUND-05 goal of a single registration site is still achieved.

The phase goal is structurally complete: build compiles, 17 unit tests pass, all wiring is confirmed present. Six human verification items confirm the infrastructure performs correctly under actual user interaction.

---

_Verified: 2026-05-06T11:50:45Z_
_Verifier: Claude (gsd-verifier)_
