# Rocket "Hire Me" CTA — Spec (Phase 7)

Scope: HIRE-01…04. The email comes from `docs/specs/CONTENT.md`.

## Layout

| Piece | Rule |
|---|---|
| Mount | In `layout.tsx`, outside the Lenis/pinned content tree, so `position: fixed` can't be broken by a transformed ancestor (the pin uses transforms). |
| Button | `<button aria-label="Hire me — show contact email">`, 64px circle, fixed `right: calc(24px + env(safe-area-inset-right))`, `bottom: calc(24px + env(safe-area-inset-bottom))`, z-index 50. Fill `rgba(28,28,31,0.72)` + `backdrop-filter: blur(12px)`, 1px hairline border. Rocket SVG is 28px, `--color-silver`, nose up. |
| Label | On hover/focus, a pill reading `HIRE ME` (mono 11px, tracking 0.18em) slides out 12px to the left of the button: opacity plus x 8px→0, 200ms. |
| States | Hover: border goes `--color-silver` at 0.4, rocket lifts y −2px. Active: scale 0.94. Focus-visible: 2px teal outline, 3px offset. |
| Contact panel | 360px wide, anchored 16px above the button, right-aligned with it. Surface `rgba(18,18,20,0.92)` + blur 16px, hairline border, radius 6px, 24px padding. Contents: mono `SAY HELLO`, the email in Geist Mono 16px `--color-silver`, then two buttons: `Copy` and `Email me ↗` (mailto with subject `[C:mail subject]`). Close × sits top-right. `role="dialog"`, `aria-labelledby`. |

## Launch sequence (desktop)

| t (ms) | What happens |
|---|---|
| 0–180 | Rocket in the button squashes (scaleY 0.9, scaleX 1.05) and shakes ±1.5px. The button is disabled from here to the end. |
| 180 | A 40px fixed-layer rocket clone takes over from the button's position. The in-button icon fades out. |
| 180–1080 | Clone flies to `y: −(button top + 120px)`, `x: +6vw`, `rotate: 8°`, ease `power2.in`, exiting off the top. |
| 180–1500 | Particle trail on a **2D** `<canvas>` overlay (not WebGL, so the one-WebGL-canvas rule holds), added at launch and removed at the end. About 60 particles/s spawn at the nozzle, radius 2–5px, color `--color-nebula-coral` fading to `--color-silver` at 0.3, lifetime 600ms, drifting slightly outward. |
| 1100–1450 | Contact panel enters: opacity 0→1, y 12px→0, `--ease-out-expo`. Focus moves to the Copy button. |
| 1500 | Overlay canvas removed. The rocket fades back into the button (300ms). |

**Copy:** uses `navigator.clipboard.writeText`. On success the label becomes `Copied ✓` for 2s with an `aria-live="polite"` announcement. On failure it selects the email text and shows `Press ⌘C`. **Close:** Esc, ×, or a click outside. Focus returns to the rocket button. Clicking the button again while the panel is open just closes it (no relaunch).

## Mobile (<768px) — HIRE-04

Button is 56px at 16px insets. The rocket rotates −90° to point left (150ms), then flies `x: −110vw` with `power2.in` over 800ms. The trail runs the same way, horizontally. The panel becomes a bottom sheet: full width minus 16px gutters, sitting 88px above the bottom edge, with the same content plus 44px-tall buttons.

## Reduced motion

No squash, flight, or particles. The panel fades in over 150ms. Copy and close work the same.

## Acceptance checklist

- [ ] Button is visible bottom-right at the top of the page, mid-hero, during the pinned horizontal track, and at the end.
- [ ] Click → rocket launches with a visible particle trail and leaves the screen, then the email panel appears.
- [ ] Copy puts the exact email on the clipboard and shows `Copied ✓`; `Email me` opens a mailto with the subject.
- [ ] Esc / × / outside click closes it and returns focus to the button; works with keyboard only.
- [ ] 375px: rocket flies horizontally to the left; the panel is a bottom sheet with no overflow.
- [ ] Reduced motion: no flight, the panel still opens.
- [ ] One WebGL canvas (the trail canvas is 2D and temporary); typecheck, lint, tests, and build pass.
