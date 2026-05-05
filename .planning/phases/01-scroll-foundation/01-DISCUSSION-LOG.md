# Phase 1: Scroll Foundation — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-05
**Phase:** 01-scroll-foundation
**Areas discussed:** Project scaffold, LenisProvider architecture, HorizontalTrack Phase 1 scope, Velocity pipeline outputs

---

## Project Scaffold

| Option | Description | Selected |
|--------|-------------|----------|
| create-next-app with defaults | TypeScript, ESLint, Tailwind, src/, App Router | ✓ |
| create-next-app minimal | No Tailwind/ESLint during scaffold, configure by hand | |

**User's choice:** create-next-app with defaults (TypeScript, ESLint, Tailwind, src/, App Router)

| Option | Description | Selected |
|--------|-------------|----------|
| All deps upfront | One install covering full stack | ✓ |
| Phase-by-phase installs | Only install what each phase needs | |

**User's choice:** All deps installed upfront

| Option | Description | Selected |
|--------|-------------|----------|
| Scaffold into ~/portfolio/ | create-next-app . — planning docs stay in place | ✓ |
| Into a subdirectory | ~/portfolio/app/ or similar | |

**User's choice:** Scaffold into ~/portfolio/ directly

---

## LenisProvider Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated LenisProvider.tsx | Client component, layout stays server component | ✓ |
| Directly in layout.tsx | Fewer files, forces layout to be client component | |

**User's choice:** Dedicated LenisProvider.tsx

| Option | Description | Selected |
|--------|-------------|----------|
| useLayoutEffect + useGSAP | StrictMode-safe, correct timing | ✓ |
| Single useEffect for everything | Simpler but StrictMode unsafe | |

**User's choice:** useLayoutEffect for Lenis init, useGSAP for all ScrollTrigger work

| Option | Description | Selected |
|--------|-------------|----------|
| Zustand only — no context | Provider writes to store, children read store | ✓ |
| Lenis instance via React context | Children can call lenis.scrollTo() | |
| Both — Zustand + context | Covers scrollTo use cases too | |

**User's choice:** Zustand-only interface — no React context for lenis instance

---

## HorizontalTrack Phase 1 Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full pin + translateX wired | GSAP ScrollTrigger driving movement, fully verifiable | ✓ |
| Container div only | Pin stubbed as TODO, built in Phase 5 | |

**User's choice:** Full pin + translateX wired in Phase 1

| Option | Description | Selected |
|--------|-------------|----------|
| src/components/horizontal-track/ | Feature-collocated | ✓ |
| src/components/layout/ | Treat as layout primitive | |

**User's choice:** src/components/horizontal-track/HorizontalTrack.tsx

| Option | Description | Selected |
|--------|-------------|----------|
| Visible placeholder band | Styled bar with text, pin movement verifiable | ✓ |
| Zero-height invisible div | Technically correct, nothing to verify | |

**User's choice:** Visible placeholder band

---

## Velocity Pipeline Phase 1 Outputs

| Option | Description | Selected |
|--------|-------------|----------|
| Zustand store + dev HUD overlay | HUD shows all values live, satisfies success criterion #2 | ✓ |
| Zustand store only | Values in devtools only, nothing on screen | |

**User's choice:** Zustand store + dev-only HUD overlay (ScrollDebugHUD.tsx)

| Option | Description | Selected |
|--------|-------------|----------|
| Both velocity + displayVelocity | Raw and lerped both in store | ✓ |
| displayVelocity only | Simpler store | |
| Raw velocity only | Each consumer lerps their own | |

**User's choice:** Both — `velocity` (raw Lenis) and `displayVelocity` (lerped)

| Option | Description | Selected |
|--------|-------------|----------|
| String union type | "vertical" or "transition" or "horizontal" | ✓ |
| Number (0, 1, 2) | Compact, easy < comparisons | |

**User's choice:** String union: "vertical" | "transition" | "horizontal"

---

## Claude's Discretion

- Lerp factor for displayVelocity
- CSS pin approach (sticky vs. GSAP pin:true)
- ScrollDebugHUD visual style

## Deferred Ideas

None
