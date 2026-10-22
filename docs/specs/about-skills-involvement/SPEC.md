# About, Skills & Campus Involvement — Spec

Added Oct 12, 2026 at Kameron's request. Tokens and type scale follow `docs/specs/project-cards/SPEC.md`; content lives in `src/content/about.ts` (source: `docs/specs/CONTENT.md`).

**Page order:** moon hero → **About** → projects → talks → **Skills** → **Campus involvement** (header, Strikers, Strikers photos, other organizations) → journey.

## About

Right after the hero. Section padding 16vh top/bottom, 8vw sides.

| Piece | Rule |
|---|---|
| Grid (desktop) | 12 columns, 32px gap. Left rail spans 1–4, text spans 5–12. Mobile: one column, rail first. |
| Left rail | Mono kicker `ABOUT` (11px, tracking 0.18em, muted). Below it, a 3-row fact list, each row a mono 11px muted label over a Geist 15px silver value, separated by 1px hairlines: `School` → `Florida A&M University`, `Class of` → `2027`, `Now` → `UCSC Open Source Contributor Catalyst`. |
| Lead | Kameron's first paragraph, verbatim, in Geist Sans 500, `clamp(26px, 2.6vw, 40px)` / 1.25, tracking −0.015em, `--color-silver`, max 30ch. |
| Body | The second paragraph, verbatim, in Geist Sans 18px / 1.65, `--color-text-body`, max 60ch, 32px below the lead. |
| Entrance | When the section top crosses 75% of the viewport: rail, lead and body fade + lift (`opacity 0→1`, `y 16→0`), 600ms `expo.out`, staggered 100ms. Once. |

## Skills

After talks, before Campus involvement. Same section padding.

| Piece | Rule |
|---|---|
| Header | Mono kicker `SKILLS`, then Michroma `The toolkit` with the silver gradient at the projects-heading size (`clamp(28px, 3.4vw, 52px)`). |
| Rows | One row per group, 48px below the header. Each row: 1px hairline top border (the last row also gets a bottom border), 28px vertical padding, grid `220px 1fr` on desktop. Left: group name in mono 11px muted. Right: the items inline in Geist Sans 400 `clamp(18px, 1.6vw, 24px)` / 1.5 `--color-silver`, separated by a muted `·` with 0.6em of space on each side. No bars, percentages or logos. |
| Hover | Desktop: hovering a row brightens the group name to silver and slides it right 4px (150ms). Transform and color only. |
| Entrance | Rows fade + lift in, 80ms apart, once, when the section top crosses 75%. |
| Mobile | Group name sits above the items; items at 18px. |

**Groups** (from the resume, in order): Languages · Frontend & 3D · Backend & Cloud · AI & ML. See `src/content/about.ts` → `SKILLS`.

## Campus involvement

Updated Oct 12, 2026: every organization gets the Strikers treatment, driven by `ORGANIZATIONS` in `src/content/about.ts` (Strikers → Kappa Kappa Psi → FAMU Marching "100").

| Piece | Rule |
|---|---|
| Header | Mono kicker `CAMPUS INVOLVEMENT`, then Michroma `Beyond the classroom` with the silver gradient, same size as `The toolkit`. Padding 16vh top, 8vw sides. |
| Feature row | Per organization: coral mono kicker (role + comma, 14px, tracking 0.24em), name in Geist Sans 800 `clamp(56px, 6vw, 88px)` / 0.92 (44px mobile), one-liner in 16px muted (max 44ch), optional mono meta line (dates, other roles), optional link. Title block 42% wide; the visual takes the rest. Min height 80vh with a visual. |
| Visual | Strikers: the scroll-driven dancer formation (personality-timeline spec). Others: their first photo as a 4:5 lead (max 420px wide) with the caption under it. No photos yet → the title block stands alone, left-aligned. |
| Rhythm | Rows with a visual alternate sides: even index = text left, odd = text right. |
| Photo row | The remaining photos (all of Strikers'): up to 4 staggered portrait columns (frames 2 and 4 sit 14vh lower), more wrap; 1–2 photos narrow the row. Desktop drift alternates 60px / 140px. Caption under the first frame when there's no lead photo. |
| Entrance | Title block and lead photo fade + lift in (100ms apart) when the section top crosses 75%. |

## Reduced motion

No entrances or hover slide: everything visible at rest.

## Acceptance checklist

- [ ] About copy matches Kameron's text exactly (lead = first paragraph, body = second).
- [ ] Skills read as a clean editorial list: four hairline-ruled rows, no bars or percentages.
- [ ] Campus involvement shows the header, then Strikers, Kappa Kappa Psi and the Marching "100" in the same editorial treatment, alternating sides once they have photos.
- [ ] The journey's UCSC line no longer mentions mentoring.
- [ ] 1440×900 and 375px: no overflow; reduced motion shows everything.
- [ ] Typecheck, lint, tests, and build pass; still one WebGL canvas.
