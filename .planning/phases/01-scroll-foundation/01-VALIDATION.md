---
phase: 1
slug: scroll-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (not yet installed — Wave 0 installs) |
| **Config file** | `vitest.config.ts` — Wave 0 creates |
| **Quick run command** | `npm test -- scroll-store` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds (store unit tests only) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- scroll-store`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green + all 5 manual success criteria verified
- **Max feedback latency:** 5 seconds (unit) / manual (scroll feel)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | FOUND-01 | — | N/A | unit stub | `npm test -- scroll-store` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 0 | FOUND-02 | — | N/A | unit stub | `npm test -- scroll-store` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 0 | FOUND-03 | — | N/A | unit stub | `npm test -- scroll-store` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 1 | FOUND-04 | — | N/A | manual | Scroll to 50% → HUD shows phase="transition" | N/A | ⬜ pending |
| 1-01-05 | 01 | 1 | FOUND-05 | — | N/A | manual | Open devtools → scroll → zero duplicate plugin warnings | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/scroll-store.test.ts` — stubs for FOUND-01, FOUND-02, FOUND-03
- [ ] `vitest.config.ts` — framework config
- [ ] `vitest.setup.ts` — jsdom environment, window/document mocks
- [ ] Install: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom`

*Wave 0 must complete before any other tasks run.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| ScrollTrigger fires at Lenis position, not native scrollY | FOUND-04 | No DOM scroll API available in unit test environment | Scroll to 50% of page → confirm HUD shows `phase="transition"` and a test animation is at correct visual offset |
| No duplicate plugin warnings in console | FOUND-05 | Requires browser + HMR reload cycle | Open devtools → scroll → verify zero "GSAP plugin already registered" warnings across full and hot-reload sessions |
| Scrolling feels physically smooth | FOUND-01 | Subjective feel cannot be automated | Native scroll jank not visible at 60fps on desktop + mobile — verify on actual device |
| HUD values update on every scroll tick | FOUND-02 | Requires visual inspection of live DOM | Open Zustand devtools or watch HUD — `velocity`, `scrollY`, `phase`, `progress` all change while scrolling |
| Vertical→horizontal pin has no stutter | FOUND-03 | Requires browser rendering | Scroll through transition zone — no visual jump, no position stutter |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
