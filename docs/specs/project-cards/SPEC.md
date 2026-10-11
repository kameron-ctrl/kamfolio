# Project Cards — Spec (Phase 5)

Scope: PROJ-01…07, QUAL-01, plus FOUND-03's card skew (cards didn't exist when Phase 1 shipped). Content placeholders are marked `[C:…]` and come from `docs/specs/CONTENT.md`.

## Layout (desktop, 1440×900)

The horizontal track replaces the three colored placeholder panels. Left to right:

| Panel | Width | Contents |
|---|---|---|
| Intro | 50vw (720px) | Mono label `SELECTED WORK` + Michroma line `Things I've built`, left-aligned at 8vw, vertically centered |
| Card 1 | card | Green Guardian |
| Gap | 40vw (576px) | Empty. Charcoal sky + stars only (nebula clusters stay off — decided) |
| Card 2 | card | CubeCoach |
| Gap | 40vw | Empty |
| Card 3 | card | Placeholder ("in progress") |
| Gap | 40vw | Empty, then the Phase 6 panels |

**Card frame:** `width: min(62vw, 920px)` (893px), `height: min(70vh, 640px)` (630px), vertically centered. Two columns: media 56% / text 44%, 40px inner padding, 32px column gap. Background `--color-surface` (`rgba(241,240,224,0.03)`), 1px border `--color-hairline` (`rgba(241,240,224,0.12)`), radius 4px, `backdrop-filter: blur(6px)`.

**Text column, top to bottom:** mono index `01 / 03` (11px, tracking 0.18em, `--color-text-muted`), title in Michroma `clamp(28px, 2.5vw, 40px)` / 1.0 (36px at 1440; 40px overflowed "CUBECOACH") with the headline's silver gradient, description in Geist Sans 16px/1.55 `rgba(241,240,224,0.78)` (max 3 sentences), tech pills (mono 11px uppercase, tracking 0.14em, 6px×12px padding, 1px hairline border, radius 999px, gap 8px), then links `Live ↗` and `GitHub ↗` (Geist Sans 14px, underline offset 4px; hover turns the underline teal over 150ms). A link with no URL is not rendered.

**Tokens to add to `tokens.css`** (values taken from MoonHero): `--color-silver: #f1f0e0`, `--color-silver-dim: #9a9a99`, `--color-text-muted: #9b978e`, `--color-surface`, `--color-hairline` (above).

## Behavior

| Piece | Rule |
|---|---|
| Track | GSAP pin + scrub (existing `HorizontalTrack`), `scrub: 1`. The tween is shared via context so children can use `containerAnimation`. |
| Phase store | `phase`/`progress` for the horizontal zone come from the track's ScrollTrigger (`onUpdate`), not fixed 40/55% document fractions. Those fractions break once the track gets longer. `transition` = the 100vh before pin start. |
| Reveal wipe | When a card's left edge reaches 85% of the viewport: `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, 900ms, `--ease-out-expo`. Runs once. |
| Velocity skew | `skewX = clamp(−displayVelocity × 0.15, −4°, 4°)` on each card's inner frame, applied in a gsap.ticker callback (no React re-render). |
| Green Guardian | After the wipe: 2px `--color-nebula-teal` line with a 24px glow sweeps top→bottom over the plant image in 1600ms (`power1.inOut`), with a 12%-tall brightened band trailing it. 400ms after the sweep, label `[C:disease label]` fades in (opacity 0→1, y 8px→0, 500ms). |
| CubeCoach cube | 3×3×3 cube drawn **in the global canvas** (moon's HUD layer, fov 45, z 2), placed by tracking a `[data-cube-target]` DOM box with `getBoundingClientRect`, the same way the moon tracks its target. Cubie size 0.94 with 0.06 gap. Standard face colors, `roughness 0.45`. Cube edge on screen = 62% of the slot's smaller side. Idle: tilted 0.45 rad on X, spins 0.15 rad/s on Y. Not drawn while the slot is off screen. |
| Scramble / solve | Pointer enters the media slot: 20 random quarter turns at 90ms each (`power2.out`). Pointer leaves: the recorded moves play back inverted at 350ms each (`power2.inOut`) until solved. Entering mid-solve resumes scrambling from the current state. Touch: a tap toggles. |
| Placeholder | Same frame. Media = 3 skeleton blocks pulsing opacity 0.04↔0.08 over 1.6s. Title `[C:placeholder title]`, no pills, no links. |
| SSR | No new canvas. The cube is a component in the existing dynamic `ssr:false` scene. |

## Mobile (375px, and anything under 768px)

The pin is turned off with `gsap.matchMedia`. Panels stack vertically: intro, then cards with 24px gaps, 16px side gutters. Cards are full width with auto height, and the media sits above the text at a 4:3 ratio. Title is 28px. Gaps shrink to 48px vertical spacers. Wipe triggers at 85% of viewport height. No skew. Cube stays live, and a tap toggles it. No horizontal page scroll.

## Reduced motion

No wipe: cards are visible. No skew, no idle spin. The scan line doesn't run and the disease label is visible from the start. Cube moves snap with 0ms turns. The track still pins and scrubs, because that is scrolling, not decoration.

## Acceptance checklist

- [ ] 1440×900: scrolling down moves the track left; intro, three cards, and the gaps appear in order with no jump at pin start or end.
- [ ] Each card wipes in left→right once; Green Guardian's scan line sweeps, then its label appears.
- [ ] Hovering the CubeCoach media scrambles the cube; leaving slowly solves it to a clean state.
- [ ] Placeholder card renders with skeleton blocks and no broken layout.
- [ ] Fast scrolling skews cards by at most 4° and they settle at rest.
- [ ] `useScrollStore` reports `horizontal` with progress 0→1 across exactly the pinned range.
- [ ] 375px: vertical stack, no sideways scroll, cube works on tap.
- [ ] Reduced motion: everything is visible without animation; the cube snaps.
- [ ] Exactly one WebGL canvas; `next build` passes; first-load JS stays under 300kb gzipped.
