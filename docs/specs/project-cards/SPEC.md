# Project Cards — Spec (Phase 5)

Scope: PROJ-02…07 (PROJ-01, the horizontal track, was dropped Oct 11, 2026), QUAL-01, plus FOUND-03's card skew (cards didn't exist when Phase 1 shipped). Content placeholders are marked `[C:…]` and come from `docs/specs/CONTENT.md`.

> **Decision (Oct 11, 2026):** the page scrolls vertically end to end. The pinned horizontal track is gone, and "Past the Code" is removed (Kameron has another idea for that slot).

## Layout (desktop, 1440×900)

One vertical column after the moon hero, top to bottom:

| Block | Size | Contents |
|---|---|---|
| Intro | padding 20vh top, 10vh bottom, 8vw sides | Mono label `SELECTED WORK` + Michroma line `Things I've built`, left-aligned |
| Card 1 | card, centered | Green Guardian (media left) |
| Gap | 12vh | Empty. Charcoal sky + stars only (nebula clusters stay off — decided) |
| Card 2 | card, centered | CubeCoach (media right) |
| Gap | 12vh | Empty, then the talks section |

The "in progress" placeholder card was removed Oct 12, 2026.

**Card frame (vertical page, Oct 12, 2026):** full content width (84vw, max 1240px; 1210×554 at 1440), horizontally centered, height set by the media. Two columns, media 7 : text 5, with the media side alternating per card (odd cards media right). Media keeps 4:3. 40px inner padding, 48px column gap, text column vertically centered. Background `--color-surface` (`rgba(241,240,224,0.03)`), 1px border `--color-hairline` (`rgba(241,240,224,0.12)`), radius 4px, `backdrop-filter: blur(6px)`.

**Text column, top to bottom:** mono index `01 / 03` (11px, tracking 0.18em, `--color-text-muted`), title in Michroma `clamp(28px, 3vw, 44px)` / 1.0 (43px at 1440 in the wider text column) with the headline's silver gradient, description in Geist Sans 16px/1.55 `rgba(241,240,224,0.78)` (max 3 sentences), tech pills (mono 11px uppercase, tracking 0.14em, 6px×12px padding, 1px hairline border, radius 999px, gap 8px), then links `Live ↗` and `GitHub ↗` (Geist Sans 14px, underline offset 4px; hover turns the underline teal over 150ms). A link with no URL is not rendered.

**Tokens to add to `tokens.css`** (values taken from MoonHero): `--color-silver: #f1f0e0`, `--color-silver-dim: #9a9a99`, `--color-text-muted: #9b978e`, `--color-surface`, `--color-hairline` (above).

## Behavior

| Piece | Rule |
|---|---|
| Phase store | `phase` is always `vertical`; `progress` is the whole-page scroll fraction (`pageProgress`). |
| Reveal wipe | When a card's left edge reaches 85% of the viewport: `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, 900ms, `--ease-out-expo`. Runs once. |
| Velocity skew | Desktop only: `skewY = clamp(−velocity × 0.15, −4°, 4°)` on each card's inner frame, eased 0.15 per tick in a gsap.ticker callback (no React re-render). |
| Green Guardian | After the wipe: 2px `--color-nebula-teal` line with a 24px glow sweeps top→bottom over the plant image in 1600ms (`power1.inOut`), with a 12%-tall brightened band trailing it. 400ms after the sweep, label `[C:disease label]` fades in (opacity 0→1, y 8px→0, 500ms). |
| CubeCoach cube | 3×3×3 cube drawn **in the global canvas** (moon's HUD layer, fov 45, z 2), placed by tracking a `[data-cube-target]` DOM box with `getBoundingClientRect`, the same way the moon tracks its target. Cubie size 0.94 with 0.06 gap. Standard face colors, `roughness 0.45`. Cube edge on screen = 62% of the slot's smaller side. Idle: tilted 0.45 rad on X, spins 0.15 rad/s on Y. Not drawn while the slot is off screen. |
| Scramble / solve | Pointer enters the media slot: 20 random quarter turns at 90ms each (`power2.out`). Pointer leaves: the recorded moves play back inverted at 350ms each (`power2.inOut`) until solved. Entering mid-solve resumes scrambling from the current state. Touch: a tap toggles. |
| SSR | No new canvas. The cube is a component in the existing dynamic `ssr:false` scene. |

## Mobile (375px, and anything under 768px)

Same vertical order as desktop: intro, then cards with 24px gaps, 16px side gutters. Cards are full width with auto height, and the media sits above the text at a 4:3 ratio. Title is 28px. Gaps shrink to 48px vertical spacers. Wipe triggers at 85% of viewport height. No skew. Cube stays live, and a tap toggles it. No horizontal page scroll.

## Reduced motion

No wipe: cards are visible. No skew, no idle spin. The scan line doesn't run and the disease label is visible from the start. Cube moves snap with 0ms turns. Scrolling itself is unchanged.

## Acceptance checklist

- [ ] 1440×900: scrolling down shows the intro, then two full-width cards (media alternating sides) separated by 12vh of empty sky; nothing pins or moves sideways.
- [ ] Each card wipes in left→right once; Green Guardian's scan line sweeps, then its label appears.
- [ ] Hovering the CubeCoach media scrambles the cube; leaving slowly solves it to a clean state.
- [ ] Fast scrolling skews cards by at most 4° and they settle at rest.
- [ ] `useScrollStore` reports `vertical` for the whole page, with progress 0→1 from top to bottom.
- [ ] 375px: vertical stack, no sideways scroll, cube works on tap.
- [ ] Reduced motion: everything is visible without animation; the cube snaps.
- [ ] Exactly one WebGL canvas; `next build` passes; first-load JS stays under 300kb gzipped.
