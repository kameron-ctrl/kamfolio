---
phase: 4
slug: hero-section
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 1.6.1 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 04-xx-01 | 01 | 0 | HERO-06, HERO-08 | N/A | unit | `npm test -- src/components/hero/__tests__/HeroOverlay.constants.test.ts` | ❌ W0 | ⬜ pending |
| 04-xx-02 | 01 | 0 | HERO-07 | N/A | unit | `npm test -- src/hooks/__tests__/useTypewriter.test.ts` | ❌ W0 | ⬜ pending |
| 04-xx-03 | 01 | 0 | HERO-07, QUAL-03 | N/A | unit | `npm test -- src/hooks/__tests__/useTypewriter.reduced-motion.test.ts` | ❌ W0 | ⬜ pending |
| 04-xx-04 | xx | 1 | HERO-06 | N/A | unit | `npm test -- src/components/hero/__tests__/HeroOverlay.constants.test.ts` | ❌ W0 | ⬜ pending |
| 04-xx-05 | xx | 1 | HERO-07 | N/A | unit | `npm test -- src/hooks/__tests__/useTypewriter.test.ts` | ❌ W0 | ⬜ pending |
| 04-xx-06 | xx | 2 | HERO-08 | N/A | unit | `npm test -- src/components/hero/__tests__/HeroOverlay.constants.test.ts` | ❌ W0 | ⬜ pending |
| 04-xx-07 | xx | 2 | QUAL-03 | N/A | manual/visual | OS reduced-motion setting + browser DevTools | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/hero/__tests__/HeroOverlay.constants.test.ts` — stubs for HERO-06 (fade delay/duration within spec), HERO-08 (grain opacity within 0.04–0.07)
- [ ] `src/hooks/__tests__/useTypewriter.test.ts` — stubs for HERO-07 (startSignal gating, char stepping, cursor completion)
- [ ] `src/hooks/__tests__/useTypewriter.reduced-motion.test.ts` — separate file required (matchMedia mock cannot change between tests in same file); covers QUAL-03 hook path

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `--motion-ok: 0` causes grain animation-duration to resolve to `0s` | QUAL-03 | CSS calc() result requires browser DevTools to verify computed value | Set OS to reduce-motion → open DevTools → Computed tab → check `--motion-ok` is `0` and `animation-duration` is `0s` on grain layer |
| Name appears statically (no fade) with prefers-reduced-motion | QUAL-03 | GSAP animation conditional requires visual verification | Set OS to reduce-motion → load page → verify name visible immediately at full opacity with no fade transition |
| Grain visible in DevTools as `::after` pseudo-element | HERO-08 | CSS pseudo-element inspection | Open DevTools → Elements panel → expand body → find `::after` with `background-image: url('data:image/svg+xml...')` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
