# Personality + Journey — Spec (Phase 6)

Scope: PERS-01…06, plus TALK-01 (talks panel) and the Strikers photo gallery (added Oct 2026). These panels continue the horizontal track after the last project gap. Tokens and type scale follow `docs/specs/project-cards/SPEC.md`. Content placeholders `[C:…]` come from `docs/specs/CONTENT.md`.

## Layout (desktop, 1440×900)

| Panel | Width | Contents |
|---|---|---|
| Talks & writing | 100vw | See `docs/specs/talks/SPEC.md`. Comes first, right after the last project gap. |
| Past the Code | 100vw | Mono label `PAST THE CODE` at top 22vh, left 8vw. Row of 7 circles centered vertically. |
| Strikers | 100vw | Left 45%: title block. Right 55%: silhouette formation. |
| Strikers gallery | 90vw | Photos from `public/strikers/` (1–4). See **Gallery** below. |
| Journey | 180vw (2592px) | Horizontal line with 6 nodes, then a 30vw end margin. |

**Gallery:** an editorial collage of real photos following the silhouettes, so the formation reads as the abstraction and the photos as the real thing. Photos are portrait-cropped `object-cover` frames, 1px hairline border, radius 4px, no shadow. Layout for N photos: 1 → a single frame 64vh tall, 30vw from the left edge; 2–4 → staggered frames 52vh tall, 6vw apart, alternating `top: 16vh` / `top: 32vh`. Each frame drifts at a parallax rate of 0.85 (moves 15% slower than the track, via `containerAnimation`), transform only. Caption under the first frame in mono 11px muted: `STRIKERS DANCE TROUPE · TALLAHASSEE`. Images go through `next/image` with `sizes="(min-width: 768px) 30vw, 100vw"` and `loading="lazy"`. Alt text describes the moment, e.g. "Kameron mid-performance in a wide stance on stage in a Strikers jersey". Mobile: photos stack full-width at 4:5 below the Strikers stage, 16px apart, no parallax.

**Past the Code circles:** 7 `<button>`s, 104px diameter, 40px gap (row = 968px, centered). 1px hairline border, `--color-surface` fill, inline SVG line icon 40px with a 1.5px stroke in `--color-silver`. Order: Sousaphone, Dance, Garden, Skates, Sewing, Tea, Design. A mono name (11px, tracking 0.18em) sits 16px below each circle.

**Strikers title block:** mono `PRESIDENT,` (14px, tracking 0.24em, `--color-nebula-coral`), then `Strikers Dance Troupe` in Geist Sans **800**, 88px / 0.92, letter-spacing −0.04em, `--color-silver`, max 3 lines. Under it, `[C:strikers one-liner]` in Geist Sans 16px muted, max 44ch. This is the "bold editorial" treatment; it adds no new font family.

**Formation:** 7 dancer silhouettes (inline SVG, 3 pose variants), 132px tall, `--color-silver` at 0.85 opacity on a 520×420 stage.

**Journey:** a 1px hairline across the panel at 56% height, plus a 1px `--color-silver` "progress" line over it. Nodes are spaced 360px apart, starting at 12vw. Each node is a 44px CSS planet (radial-gradient sphere, highlight at 30% 30%). Title in Geist Sans 20px/600 above the node, date in mono 12px above that, and a one-liner in 14px muted (max 32ch) below.

| Node | Planet tint | Content |
|---|---|---|
| FAMU | `#f47c20` → `#0b6a3a` | `[C:FAMU role, dates, line]` |
| Outamation | `#2ec4b6` (teal) | `[C:Outamation …]` |
| Google CodePath | `#7aa2ff` | `[C:CodePath …]` |
| UCSC OSPO | `#ff6b6b` (coral) | `[C:UCSC OSPO …]` |
| Now | moon silver `#f1f0e0` → `#9a9a99` | `[C:now …]` |
| Future | 1px dashed silver ring, no fill | `[C:future …]` |

## Behavior

| Piece | Rule |
|---|---|
| Expand | Hover **or** focus: circle scales 1→1.12 (300ms, `--ease-out-expo`). A caption bubble (max 260px, 12px×16px padding, surface + hairline, Geist Sans 14px) reveals below it with `clip-path: inset(0 0 100% 0)` → `inset(0)` in 350ms. Only one is open at a time. Esc or blur closes it. The caption is linked with `aria-describedby`. Transforms only, no width animation. |
| Formation | Scrubbed by the Strikers panel's own progress through the viewport (`containerAnimation`). It moves through 3 formations, V (0) → line (0.5) → diamond (1), using `translate` only and `power1.inOut` between keys. Each dancer's pose swaps at 0.5. |
| Journey progress | The silver line's `scaleX` follows the panel's scroll progress (origin left). |
| Active node | The node nearest the viewport center, within ±180px, is active. Active planet scales 1.12. A ring around it pulses: scale 1→1.8, opacity 0.6→0, 1.8s, infinite. Inactive nodes sit at 0.55 opacity; the change takes 300ms. |

## Mobile (<768px)

Everything stacks vertically. **Circles:** a 4 + 3 grid of 72px circles with 20px gaps. Tap toggles the caption, which opens below its row at full width. **Strikers:** title at 44px, with the stage (100% wide, 4:3) below it; the formation scrubs with vertical scroll. **Journey:** the line runs vertically at `left: 28px`, nodes are 96px apart (or text height), and text sits to the right of each node. The active node is the one nearest 50% of viewport height.

## Reduced motion

Circles don't scale and captions appear without a clip animation. The formation shows the line formation and doesn't scrub. The journey progress line is full. Every node is at full opacity with no pulse ring.

## Acceptance checklist

- [ ] 1440×900: after the projects, the track shows Talks & writing, the circle strip, Strikers, the photo gallery, then the journey.
- [ ] All 7 circles are visible with correct icons; hover **and** keyboard Tab+focus each reveal the right one-liner.
- [ ] "Strikers Dance Troupe" reads as a bold editorial headline, clearly distinct from body text.
- [ ] Scrolling through Strikers visibly shifts the formation V → line → diamond; scrolling back reverses it.
- [ ] All six nodes are labeled; the centered node pulses and the progress line advances with scroll.
- [ ] 375px: everything stacks, the timeline is vertical, and there's no sideways scroll.
- [ ] Reduced motion: static and fully readable.
- [ ] Gallery photos drift slower than the track and stay sharp at 1440 (no upscaling past source size).
- [ ] Typecheck, lint, tests, and build pass; still one WebGL canvas.
