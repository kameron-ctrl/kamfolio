---
phase: 3
slug: nebula-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-07
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 1.x with jsdom |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx src/lib/__tests__/nebula-textures.test.ts` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx src/lib/__tests__/nebula-textures.test.ts`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

### Known Latency Exception

- **Plan 03-04 Task 2** intentionally chains `npx next build` into its `<automated>` verify. The build is expected to run ~30–60 seconds on this project. This is a deliberate exception for the Wave 3 final integration gate — it acts as the QUAL-01 SSR regression guard (RESEARCH.md Pitfall 2 — texture creation must not execute during SSR) and is the only build invocation in Phase 3. Routine per-task sampling stays under the 10-second target; only the final integration verify pays the build cost.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-W0-01 | W0 | 0 | QUAL-04 | — | N/A | unit (regression) | `npx vitest run src/components/canvas/__tests__/MoonScene.test.tsx` | ✅ (failing) | ⬜ pending |
| 3-W0-02 | W0 | 0 | NEB-01 | — | N/A | unit (stub) | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ W0 | ⬜ pending |
| 3-W0-03 | W0 | 0 | NEB-01 | — | N/A | unit (stub) | `npx vitest run src/lib/__tests__/nebula-textures.test.ts` | ❌ W0 | ⬜ pending |
| 3-01-01 | 01 | 1 | NEB-01 | — | N/A | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | NEB-02 | — | N/A | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 1 | NEB-03 | — | N/A | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ W0 | ⬜ pending |
| 3-01-04 | 01 | 1 | NEB-04 | — | N/A | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ W0 | ⬜ pending |
| 3-01-05 | 01 | 1 | NEB-05 | — | N/A | unit | `npx vitest run src/components/canvas/__tests__/NebulaScene.test.tsx` | ❌ W0 | ⬜ pending |
| 3-01-06 | 01 | 1 | NEB-01 | — | N/A | unit | `npx vitest run src/lib/__tests__/nebula-textures.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> **Note on WebGL tests:** jsdom has no WebGL context. NebulaScene tests are module-shape tests (constants, exports, prop types) not render tests. Visual correctness verified manually via browser per success criteria. Same pattern as existing `MoonScene.test.tsx`.

---

## Wave 0 Requirements

- [ ] `src/components/canvas/__tests__/NebulaScene.test.tsx` — stubs covering NEB-01 through NEB-05 (constants assertions + module shape)
- [ ] `src/lib/__tests__/nebula-textures.test.ts` — stub covering NEB-01 (texture utility module shape)
- [ ] Fix `MOON_DPR_CAP` drift: `MoonScene.constants.ts` currently exports `[1, 2]` — QUAL-04 requires `[1, 1.5]`. 3 existing tests are failing.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Six distinct depth layers visually separate while scrolling | NEB-01 | WebGL render output not testable in jsdom | Load page in browser, scroll slowly, confirm 6 layers at distinct depths |
| Nebula breathes visibly at fast scroll velocity | NEB-04 | Scroll velocity animation not testable without browser | Scroll rapidly, confirm scale/spread pulse then settle in ~0.6–0.8s |
| Purple, teal, coral clusters each distinguishable | NEB-03 | Color perception is visual | Inspect canvas in browser, confirm three named color regions visible |
| Star field parallaxes slower than foreground layers | NEB-05 | Parallax rate comparison is visual | Scroll slowly, confirm stars move less than dust motes |
| Horizontal zone: layers spread on X axis | NEB-02 | Horizontal scroll interaction requires real browser | Enter horizontal zone (project cards), scroll, confirm X-axis layer spread |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
