# Features Research — Kameron Benjamin Portfolio

## Key Findings

1. **Name + role legibility within 5 seconds is the #1 table stake.** The moon hero must not sacrifice readability for aesthetics — both can coexist, but legibility wins if there is conflict.

2. **The horizontal scroll transition and velocity-responsive nebula are genuine differentiators at the awwwards tier.** ~5% of award-winning portfolios use non-linear scroll flows. When executed without jank, it drives "how did they do that?" sharing.

3. **Mobile strategy: replace, not degrade.** The 3D scene does not belong on mobile. A CSS-only moon with radial-gradient nebula and vertical card stack is the right call — removes GSAP ScrollTrigger complexity from mobile entirely.

4. **Contact should resolve to email reveal + copy button + mailto link.** No backend, no form. The rocket animation is the delight; the reveal must be instant once it lands. Calendly is acceptable as a secondary option only.

5. **The "Beyond the Code" and Strikers Dance Troupe sections are underestimated differentiators.** Sousaphone + dance troupe president + gardening is what recruiters remember and repeat to colleagues. Most portfolios have zero of this.

---

## Table Stakes (must have or visitors leave confused)

| Feature | Complexity | Notes |
|---------|------------|-------|
| Name + role legible within 5 seconds | LOW | Does not compete with aesthetics — both are achievable |
| 2–3 real projects with tech stack + links | LOW (content) | Green Guardian + CubeCoach qualify |
| Contact reachability | LOW | Rocket CTA must resolve to something real |
| Mobile usable at 375px | HIGH | Replace 3D with CSS equivalents |
| Load time not punishing | HIGH | Dynamic import + compressed NASA textures |
| Working links (no 404s) | LOW | Pre-launch audit |
| Tech stack visible | LOW | Tech pills on cards; site itself implies the stack |
| Reduced motion fallback | MEDIUM | Cross-cutting — must be Phase 1, cannot be retrofitted |
| OG image + meta | LOW | Static moon screenshot, 1200×630px |

---

## Differentiators (what makes this memorable)

| Feature | Complexity | Notes |
|---------|------------|-------|
| Photorealistic moon hero (NASA textures, entrance lerp) | HIGH | The entrance is what gets screenshotted |
| Velocity-responsive nebula breathe | HIGH | Scroll-speed reactivity signals pipeline mastery |
| Live R3F Rubik's cube in CubeCoach card | HIGH | Demo inside portfolio — most portfolios link away |
| Vertical → horizontal scroll transition | HIGH | The pin/transition zone (40–55%) is the risky part |
| "Beyond the Code" personality strip | MEDIUM | Sousaphone/dance/garden — what recruiters repeat |
| Rocket hire button with particle trail | HIGH | Delight at the contact moment |
| Journey timeline with planet nodes | MEDIUM | Space-themed career progression reads as intentional |
| Strikers Dance Troupe editorial section | MEDIUM | Leadership signal elevated above resume-bullet level |
| CSS grain/scanline overlay | LOW | "Cinematic" not "dark mode" |
| Interstitial nebula gaps between cards | LOW | Continuity = immersion |

---

## Anti-Features (hurt more than help)

| Feature | Why Avoid | Alternative |
|---------|-----------|-------------|
| Blog / writing section | Empty blog signals neglect | Link to dev.to/Medium later |
| Dark/light toggle | Dilutes the intentional aesthetic | Single direction already decided |
| Contact form with backend | Infrastructure complexity for no conversion gain | Email reveal + mailto |
| Preloader / loading screen | Makes the wait feel longer | Progressive reveal |
| >4 project cards | Dilutes impact of each | Placeholder slot is the right call |
| Custom cursor | Breaks cross-browser, overused 2020–2022 | Rocket + velocity effects do the same job |
| Auto-playing audio | Violates autoplay policy, universally disliked | Visual atmosphere carries cinematic weight |
| Popup newsletter subscribe | Wrong context for hiring-intent visitor | One CTA: the rocket |
| Calendly as primary CTA | Friction for recruiters who want to forward email | Email reveal primary, Calendly secondary |

---

## Feature Dependencies (critical for phase ordering)

- **Lenis is the keystone** — every velocity-reactive feature depends on `lenis.velocity`. Must be Phase 1.
- **Horizontal scroll zone is the second keystone** — all personality sections and project cards live inside it. Must be working before any children are built.
- **R3F scenes are independent** — moon hero and CubeCoach card do not share a canvas; dynamic import each separately.
- **Rocket CTA contact resolution must be decided before the animation** — the reveal state design depends on what it reveals.
- **Reduced motion is cross-cutting** — use a `--motion-ok: 1` CSS custom property toggled at `:root` by media query. Cannot be retrofitted in a polish phase.

---

## Mobile Strategy

Use **Pattern A: Replace, not degrade**:

- Moon → PNG + CSS glow + CSS rotation oscillation
- Nebula → CSS `radial-gradient` with `animation: float`
- Horizontal scroll zone → vertical card stack
- Velocity effects → removed entirely
- Design 375px as a fully independent layout

The cinematic atmosphere survives in CSS alone. The GSAP ScrollTrigger pin complexity does not exist on mobile.

---

## Contact Pattern

Email reveal on rocket animation completion. Copy-to-clipboard + mailto link. No form. No backend. Optional secondary Calendly link after email is revealed.

> **Open question**: What email address or service should the rocket CTA reveal? Must be decided before building the reveal animation.

---

## SEO

Next.js App Router handles SSR for metadata even when canvas is client-only. Priority items:
- Correct `<title>` and `<meta description>` with recruiter keywords
- `og:image` (static moon screenshot 1200×630)
- Canonical URL
- Semantic HTML containers around canvas
- `rel="me"` links to GitHub / LinkedIn

---

## Open Questions

1. What email/service should the rocket CTA reveal? (mailto / Formspree / custom) — must be decided before Phase 2 contact work.
2. Will NASA textures at full resolution fit within the <300kb JS budget, or does KTX2 compression need to be factored into Phase 1 asset pipeline?
3. Should CubeCoach R3F card use a `<Canvas>` inside the card DOM, or a portal to a shared offscreen canvas?

---

*Research completed: 2026-05-05 | Confidence: HIGH for table stakes + differentiators, MEDIUM for contact conversion patterns*
