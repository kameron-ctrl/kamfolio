# Moon Hero — Spec

The approved look is `reference/moon-hero.html`. Open it in a browser (serve the folder, e.g. `npx serve reference`) and treat it as the source of truth. The React Three Fiber port in `src/components/moon/` reproduces it. All tuning numbers are in `src/components/moon/tuning.ts`.

## What the visitor sees

- A dark charcoal sky (radial gradient, #1c1c1f at the top fading to #08080a) with twinkling stars.
- A two-line silver headline, centered, in an extended display face (Michroma), with a vertical gradient fill: #9a9a99 → #f1f0e0 at 75% → #9a9a99.
- Below it, the top of a huge moon rising into the first screen. The moon is wider than the viewport; its upper edge sits roughly halfway down the screen on a 1440×900 desktop.
- The moon's face is dim, its edge glows (backlit), and crater relief is visible.
- Moving the cursor turns the moon slightly toward it, slowly. A fast sideways flick adds a small roll that settles.
- The moon spins very slowly on its own.
- On load the lower-left of the face is in shadow. Scrolling down clears the shadow diagonally, tips the moon forward, and brightens a halo around the edge. Scrolling up reverses it.

## How it's built

| Piece | Rule |
|---|---|
| Canvas | One fixed, full-screen R3F canvas behind the page, `pointer-events: none`, transparent. |
| Camera | Perspective, **fov 45, z = 2**. The close camera is what makes it read as 3D. Don't change it. |
| Target | A DOM box with `data-moon-target`: full width, `aspect-ratio: 1 / 1.2`. Phones: 115% wide, bleeding 7.5% each side, 80px top margin. |
| Size | Moon radius = 30% of the target box height (50% under 768px). |
| Position | Center of the target box, moved up 18% of the view height (down 8% on phones). |
| Parallax | `travel` = how far the box has moved through the viewport (0→1). Moon lags by `(travel − 0.5) × boxHeight × 0.15`. |
| Reveal | `reveal = 0.5 × (1 − travel)`. Diagonal shadow mask, tilt `(1 − reveal) × 0.4` rad, halo strength `(1 − reveal)³`. |
| Gaze | Target = cursor (−1…1) × (0.6, 0.4). Ease 0.05 per 60fps frame (frame-rate independent). Rotation: yaw ×0.15, pitch ×0.1. |
| Roll | From horizontal cursor speed, up to 1.5°, double-smoothed (0.02 then 0.07), applied ×0.4. |
| Spin | 0.04 rad/s around Y. |
| Entrance | Fade in and rise 4% of view height, 0.4s delay, 1.2s ease-out. |
| Lighting | Custom ShaderMaterial: dim front fill using a normal derived from the height map, plus a strong Fresnel limb. Textures are sampled raw and output raw (no color-space conversion, `toneMapped: false`). |
| Textures | `public/textures/moon/moon-color.webp` (surface), `moon-gray.webp` (alt surface), `moon-height.webp` (height map). |
| Motion | `prefers-reduced-motion`: no gaze, roll, or spin. Scroll reveal still works. |

## Acceptance checklist

- [ ] At 1440×900 the moon's top edge is about halfway down the first screen and the moon is wider than the viewport.
- [ ] Side by side with `reference/moon-hero.html`, size, position, brightness, and edge glow match.
- [ ] Cursor movement tilts the moon slowly; it never snaps.
- [ ] Scrolling clears the diagonal shadow and brightens the halo; scrolling back reverses it.
- [ ] At 375px wide the moon is still centered under the headline and the page doesn't scroll sideways.
- [ ] No hydration errors; the canvas is loaded with `ssr: false`.
- [ ] Only one WebGL canvas exists on the page.
- [ ] `next build` passes and the moon chunk is dynamically imported (not in the main bundle).
