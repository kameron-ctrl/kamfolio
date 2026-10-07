# Polish, Mobile + Launch — Spec (Phase 8)

Scope: QUAL-02, QUAL-05, QUAL-06, QUAL-07, plus closing gaps left by the moon-hero integration. Decisions marked **(Q)** depend on answers in `docs/specs/CONTENT.md`.

## Mobile (375px) — QUAL-02

| Piece | Rule |
|---|---|
| Moon | **Decided:** keep the 3D moon on phones, using the approved mobile rules in `MOON_HERO_SPEC.md` (radius 0.5, offset −0.08, 115% target). Show a CSS-only moon only when WebGL isn't available or the device reports `navigator.hardwareConcurrency ≤ 4` and `deviceMemory ≤ 4`. CSS moon: a circle 115vw wide with `radial-gradient(circle at 50% 35%, #d9d6c8 0%, #8f8c84 45%, #2a2a2c 75%)` plus an outer glow `box-shadow: 0 0 80px 10px rgba(160,200,255,0.18)`, rising 4vh over 1.2s (same as the 3D entrance). |
| Sections | Use the stacked layouts in the Phase 5–7 specs. Test widths: 320, 375, 768, 1024, 1440, 1920. No horizontal scroll at any of them (`document.documentElement.scrollWidth === innerWidth`). |
| Touch | Every tap target is ≥ 44×44px. |

## Meta + OG — QUAL-05

- `metadataBase` = **(Q)** production URL.
- `title`: `Kameron Benjamin — Full-Stack Developer & Creative Technologist`.
- `description` (≤ 160 chars): **(Q)** default `Full-stack developer (React, Next.js, TypeScript, Python, Three.js) building AI-powered products with real creative craft. FAMU · Adobe · CodePath.`
- `openGraph` + `twitter: summary_large_image`, both using `/og.png`.
- `og.png`: 1200×630, a Playwright screenshot of the hero at a 1200×630 viewport after the entrance settles (t = 2.5s), saved to `public/og.png`, < 300KB. Made by `scripts/og-shot.mjs` so it can be regenerated.

## Link check — QUAL-06

`scripts/check-links.mjs` collects every external `href` from the content module and sends `HEAD` requests (falling back to `GET`). It fails on anything that isn't 2xx/3xx. All external links use `target="_blank" rel="noopener noreferrer"`.

## Performance — QUAL-07

- Lighthouse desktop on `next start`: Performance ≥ 80, Accessibility ≥ 95, CLS < 0.1, LCP < 2.5s. The LCP element is the headline text, not an image.
- First-load JS for `/` < 300kb gzipped, taken from `next build` output. Recorded in the report.
- The project image goes through `next/image` with explicit size, `loading="lazy"`, AVIF/WebP.
- The moon textures stay as they are (already WebP, loaded after first paint inside the dynamic chunk).

## Cleanup (no new features)

Delete orphaned Phase 2 code that the moon kit replaced, and only after confirming nothing imports it: `canvas/MoonScene.tsx`, `canvas/MoonGlow.tsx`, their tests, `moon/MoonCanvas*.tsx`, `public/textures/moon/*.png`. **(Q)** Also delete `hero/HeroOverlay.tsx` and `useTypewriter` if you want the hero to stay exactly as the reference. Keep `ScrollDebugHUD` (dev only). Update ROADMAP/REQUIREMENTS checkboxes to match reality.

## Launch

Deploy to Vercel **(Q)**, set the domain, re-run the link check and Lighthouse against the production URL, and check the OG preview with a link-preview debugger.

## Acceptance checklist

- [ ] 320–1920px: usable, no sideways scroll, and every section is readable at 375.
- [ ] Shared URL previews show the moon OG image, the title, and the description.
- [ ] `check-links` passes with zero failures.
- [ ] Lighthouse desktop ≥ 80 performance; no render-blocking LCP resources.
- [ ] First-load JS < 300kb gzipped; one WebGL canvas; no console errors.
- [ ] Reduced motion verified across every section.
- [ ] Typecheck, lint, tests, and `next build` pass; site is live at the production URL.
