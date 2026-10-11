# Talks & Writing — Spec (Phase 6, TALK-01)

One 100vw panel on the horizontal track, placed after the last project gap and before Past the Code. It's the bridge from "things I built" to "who I am": Green Guardian, the card just before it, is also the project in the talk. Tokens and type follow `docs/specs/project-cards/SPEC.md`. Content comes from `docs/specs/CONTENT.md` → "Talks & writing".

## Layout (desktop, 1440×900)

- Mono kicker `ON STAGE & IN PRINT` at top 22vh, left 8vw (11px, tracking 0.18em, `--color-text-muted`).
- Two entries side by side, starting at left 8vw, 40vw wide each with a 4vw gap, top aligned at 34vh. No card chrome: entries sit directly on the sky and are separated by a 1px vertical hairline, 48vh tall.

**Entry (talk, left):**
1. Mono meta: `TALK · JUN 30, 2026 · UC SANTA CRUZ` (11px, tracking 0.18em, `--color-nebula-teal`)
2. Photo `public/talks/talk-04.jpg`: 16:10 `object-cover` frame (focus `center 35%`), 100% of the entry width, max 28vh tall, hairline border, radius 4px. Alt: "Kameron presenting Green Guardian to a lecture hall at UC Santa Cruz"
3. Title: `Green Guardian at the inaugural PyTorch Santa Cruz Meetup` in Geist Sans 600, 32px/1.1, `--color-silver`, max 2 lines
4. Line: `[C:talk line]` in Geist Sans 16px/1.55, `rgba(241,240,224,0.78)`, max 44ch
5. Button `View slides (13)`, styled like the card links, which opens the slide viewer

**Entry (article, right):**
1. Mono meta: `FEATURED · AUG 2026 · PYTORCH FOUNDATION BLOG` (`--color-nebula-coral`)
2. Title: `PyTorch by the Sea` in Geist Sans 600, 32px/1.1
3. Pull quote: `[C:pull quote]` in Geist Sans 300 italic, 22px/1.4, `--color-silver`, with a 2px coral rule on the left, 20px padding-left, max 36ch
4. Attribution: mono 11px muted, `— PYTORCH FOUNDATION BLOG`
5. Link `Read the post ↗`, linking to the pytorch.org URL

## Behavior

| Piece | Rule |
|---|---|
| Entrance | When the panel crosses 70% of the viewport (`containerAnimation`), each entry fades and lifts in: `opacity 0→1`, `y 16→0`, 600ms `--ease-out-expo`, right entry 120ms after the left. Once only. |
| Divider | The vertical hairline draws with `scaleY 0→1` (origin top), 700ms, in sync with the left entry. |
| Links | External: `target="_blank" rel="noopener noreferrer"`. Hover turns the underline teal over 150ms; focus-visible gets a 2px teal outline, 4px offset. |

## Slide viewer

A native `<dialog>` opened with `showModal()`, so focus is trapped and Esc closes it for free. Backdrop `rgba(5,5,7,0.86)` with 8px blur. The current slide is centered at `min(88vw, 1080px)` wide, 16:9, hairline border, radius 4px. The slides are 720×405, so above 720px they upscale slightly, which is acceptable for a deck. Under it: a mono counter `03 / 13`, plus prev/next buttons (44px, hairline circle). ←/→ keys move between slides. Only the current slide and its neighbors load (`next/image`, `loading="lazy"`, neighbors with `priority` off). Switching slides crossfades opacity over 200ms. Closing returns focus to `View slides`. Each slide's alt text is its headline, e.g. "Slide 10: A small model, useful accuracy — ~97% validation accuracy, 15 classes". The lightbox doesn't use the WebGL canvas.

## Mobile (<768px)

The entries stack, with a 1px horizontal hairline between them and 48px gaps. Titles drop to 24px and the pull quote to 18px. The entrance uses the same fade with no stagger, triggered at 85% of the viewport.

## Reduced motion

No entrance and no divider draw: everything is visible at rest.

## Acceptance checklist

- [ ] 1440×900: after the third project gap, the panel shows both entries side by side with the divider, and nothing overflows.
- [ ] `Read the post ↗` opens the pytorch.org post in a new tab.
- [ ] The pull quote matches the blog wording exactly.
- [ ] 375px: entries stack with no sideways scroll.
- [ ] Reduced motion: static and fully readable.
- [ ] Keyboard: Tab reaches each link with a visible focus ring.
- [ ] Slide viewer: opens on click, ←/→ steps 1↔13, Esc closes and focus returns; no phone number visible on any slide.
