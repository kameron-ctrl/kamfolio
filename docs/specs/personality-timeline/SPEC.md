# Personality + Journey — Spec (Phase 6)

Scope: PERS-03…06, plus TALK-01 (`docs/specs/talks/SPEC.md`) and the Strikers photo gallery. PERS-01/02 (Past the Code) were dropped Oct 11, 2026. Tokens and type scale follow `docs/specs/project-cards/SPEC.md`. Content placeholders `[C:…]` come from `docs/specs/CONTENT.md`.

> **Decision (Oct 11, 2026):** the page scrolls vertically end to end. The pinned horizontal track is gone, and "Past the Code" is removed (Kameron has another idea for that slot).

## Layout (desktop, 1440×900)

Sections stack vertically after the talks section:

| Section | Size | Contents |
|---|---|---|
| Strikers | min 100vh, 10vh vertical padding | Left 45% (8vw inset): title block. Right 55%: silhouette formation. |
| Strikers gallery | 8vw sides, 16vh bottom | 4-column row of portrait photos from `public/strikers/`. See **Gallery**. |
| Journey | 16vh top/bottom, 8vw sides | Mono label `THE JOURNEY`, then a vertical spine (max 1040px, centered) with 6 nodes. |

**Strikers title block:** mono `PRESIDENT,` (14px, tracking 0.24em, `--color-nebula-coral`), then `Strikers Dance Troupe` in Geist Sans **800**, 88px / 0.92, letter-spacing −0.04em, `--color-silver`, max 3 lines. Under it, `[C:strikers one-liner]` in Geist Sans 16px muted, max 44ch. This is the "bold editorial" treatment; it adds no new font family.

**Formation:** 7 dancer silhouettes (inline SVG, 3 pose variants), 132 units tall on a 520×420 stage that scales with its box, `--color-silver` at 0.85 opacity.

**Gallery:** four portrait (4:5) frames in a 4-column grid with a 2.5vw gap; frames 2 and 4 sit 14vh lower. 1px hairline border, radius 4px, `object-cover`, `next/image` lazy with `sizes="(min-width: 768px) 22vw, 100vw"`. Caption under the first frame in mono 11px muted: `STRIKERS DANCE TROUPE · TALLAHASSEE`. Mobile: frames stack full-width, 16px apart.

**Journey:** a 1px hairline spine down the center, plus a 1px `--color-silver` progress line over it. Each node is a row (min 200px) on a `1fr 44px 1fr` grid with a 48px column gap: the 44px CSS planet (radial-gradient sphere, highlight at 30% 30%) sits on the spine, and the text alternates sides: even nodes on the left (right-aligned), odd nodes on the right. Text: date in mono 12px, title in Geist Sans 20px/600, role in 13px muted, then the one-liner in 14px (max 38ch).

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
| Formation | Scrubbed by the Strikers section's trip through the viewport (top enters bottom → bottom leaves top). V (0) → line (0.5) → diamond (1), `power1.inOut` between keys, positions only. Each dancer's pose swaps at 0.5. |
| Gallery drift | Desktop only: frames drift vertically as the row scrolls past, alternating 60px / 140px total travel, transform only, scrubbed. |
| Journey progress | The silver line's `scaleY` (origin top) follows the spine's progress from its top at viewport center to its bottom at viewport center. |
| Active node | The planet nearest the viewport's vertical center, within ±180px, is active. Active planet scales 1.12. A ring around it pulses: scale 1→1.8, opacity 0.6→0, 1.8s, infinite. Inactive nodes sit at 0.55 opacity; the change takes 300ms. |

## Mobile (<768px)

**Strikers:** title at 44px, with the stage (100% wide) below it; the formation scrubs the same way. **Gallery:** photos stack full-width, no drift. **Journey:** the spine runs at `left: 28px`, planets sit on it, and text sits to the right of each planet; rows are at least 96px apart.

## Reduced motion

The formation shows the line formation and doesn't scrub. The journey progress line is full. Every node is at full opacity with no pulse ring.

## Acceptance checklist

- [ ] 1440×900: after the talks section the page shows Strikers, the photo row, then the journey, all scrolling vertically. No pinned or sideways motion anywhere.
- [ ] "Strikers Dance Troupe" reads as a bold editorial headline, clearly distinct from body text.
- [ ] Scrolling through Strikers visibly shifts the formation V → line → diamond; scrolling back reverses it.
- [ ] Gallery photos drift at two rates and stay sharp at 1440 (no upscaling past source size).
- [ ] All six nodes are labeled and alternate sides; the node at screen center pulses and the progress line fills with scroll.
- [ ] 375px: everything stacks, the timeline runs down the left, and there's no sideways scroll.
- [ ] Reduced motion: static and fully readable.
- [ ] Typecheck, lint, tests, and build pass; still one WebGL canvas.
