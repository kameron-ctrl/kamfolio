---
phase: 2
slug: moon-hero
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 1.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | HERO-01 | — | N/A | manual | `ls public/textures/moon/*.png` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | HERO-01 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | HERO-02 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | HERO-03 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | HERO-04 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | QUAL-04 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | HERO-05 | — | N/A | unit | `pnpm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/moon/MoonScene.test.tsx` — stubs for HERO-01 through HERO-05, QUAL-04
- [ ] `public/textures/moon/` directory — NASA texture files (color, displacement, normal PNGs)
- [ ] Vitest + @testing-library/react already installed from Phase 1 — no new installs needed

*Existing Vitest infrastructure from Phase 1 covers the framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Crater detail visible from NASA displacement/normal maps | HERO-01 | Requires visual GPU rendering | Load http://localhost:3000, visually inspect moon surface |
| Convincing lit hemisphere and shadow side | HERO-02 | Requires visual GPU rendering | Verify dark/light split with PointLight sun position |
| Atmospheric glow rim around silhouette | HERO-03 | Requires visual rendering | Check BackSide mesh glow ring visible on dark background |
| Entrance animation — moon grows from small to full over ~2.5s | HERO-04 | Requires animation playback | Hard-reload page, observe scale/position animation duration |
| DPR capped at 1.5 on retina display | QUAL-04 | Requires DevTools inspection | Inspect canvas element, verify `devicePixelRatio` ≤ 1.5 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
