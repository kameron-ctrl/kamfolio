<!-- Paste this into your CLAUDE.md OUTSIDE the GSD:...-start / GSD:...-end markers.
     GSD regenerates everything between its markers, so anything you add inside them gets wiped. -->

## Source of truth for visuals

- **Moon hero:** `docs/specs/moon-hero/MOON_HERO_SPEC.md` and `docs/specs/moon-hero/reference/moon-hero.html`. Match the reference. The numbers in `src/components/moon/tuning.ts` are approved; don't change them without asking.
- Future visual features get the same treatment: a spec with exact numbers, a working reference, and an acceptance checklist in `docs/specs/<feature>/` before any code.

## Corrections to the research notes above

- **Tailwind:** staying on v3 is a project decision. v4 has been stable since January 2025; don't migrate without asking.
- **Lenis + ScrollTrigger:** what matters is syncing them, not init order. Create Lenis with `autoRaf: false`, then
  `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add((t) => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`.
- **Global R3F canvas camera:** perspective, fov 45, z = 2. The moon hero depends on it.

## Workflow

- When I say "skip GSD" for a task, edit the repo directly.
- Visual work that must match a reference is done as: implement → run the dev server → compare to the reference at 1440×900 and 375px → report against the spec's checklist. Don't open a new GSD phase for visual tuning.
- Before saying a visual task is done, run typecheck, lint, and `next build`.
