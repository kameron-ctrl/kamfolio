# Requirements: Kameron Benjamin Portfolio

**Defined:** 2026-05-05
**Core Value:** A visitor should immediately feel the combination that makes Kameron distinctive: serious full-stack engineering ability expressed through genuine creative craft.

---

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Site scrolls smoothly with Lenis, exposing velocity to all visual effects
- [ ] **FOUND-02**: Page transitions from vertical scroll (0–40%) to pinned horizontal (55–100%) without jank, with a transition zone at 40–55%
- [ ] **FOUND-03**: Scroll velocity drives visual effects: skewX on content cards, blur on 3D elements, nebula layer spread
- [ ] **FOUND-04**: GSAP ScrollTrigger fires at correct visual offsets (synced to Lenis position, not native scrollY)
- [ ] **FOUND-05**: Single GSAP plugin registration site (`lib/gsap.ts`) — no duplicate registrations across component files

### Hero

- [ ] **HERO-01**: Moon renders with NASA displacement + normal maps showing photorealistic craters
- [ ] **HERO-02**: Moon shows a realistic lit/dark hemisphere from a simulated PointLight sun
- [ ] **HERO-03**: Atmospheric glow rim renders as a second slightly-larger sphere with AdditiveBlending
- [ ] **HERO-04**: On load, moon starts small/distant and lerps toward camera over ~2.5s
- [ ] **HERO-05**: Moon self-rotates subtly on Y axis (~0.0005/frame)
- [ ] **HERO-06**: Kameron's name fades in over the moon, large scale, thin letter-spacing
- [ ] **HERO-07**: Subtitle types itself out with the typing animation
- [ ] **HERO-08**: CSS grain/scanline overlay renders via `::after` pseudo-element for cinematic texture

### Nebula

- [ ] **NEB-01**: 6-layer parallax nebula stack renders: deep space gradient → stars → far nebula → mid fog → near bokeh → foreground dust
- [ ] **NEB-02**: Each layer has a distinct parallax coefficient (0.05x → 0.8x) active during both vertical and horizontal scroll phases
- [ ] **NEB-03**: Three nebula clusters (~800 particles each) render with AdditiveBlending in purple #7b4fa6, teal #2ec4b6, and coral #ff6b6b
- [ ] **NEB-04**: Nebula breathes at high scroll velocity — layers scale up then settle back as velocity decays
- [ ] **NEB-05**: Star field parallaxes at 0.05x in vertical zone and continues correctly in horizontal zone

### Projects

- [ ] **PROJ-01**: Horizontal track advances left as visitor scrolls vertically within the horizontal zone
- [ ] **PROJ-02**: Green Guardian card shows a leaf scan-line animation sweeping down a plant image on enter, with disease label fading in
- [ ] **PROJ-03**: CubeCoach card shows a live embedded R3F Rubik's cube that scrambles on hover and slowly solves on mouse leave
- [ ] **PROJ-04**: At least one placeholder project card slot renders correctly as a styled skeleton
- [ ] **PROJ-05**: Each project card reveals with a clipPath wipe from left → right on scroll-into-view
- [ ] **PROJ-06**: Interstitial nebula-only gaps appear between project cards
- [ ] **PROJ-07**: Each project card displays: project description, tech stack pills, live link, and GitHub link

### Personality

- [ ] **PERS-01**: "Beyond the Code" strip shows 7 circular icons: Sousaphone, Dance, Garden, Skates, Sewing, Tea, Design
- [ ] **PERS-02**: Each icon expands on hover to reveal a one-liner description
- [ ] **PERS-03**: Strikers Dance Troupe section shows a CSS-animated silhouette figure formation that shifts on scroll progress
- [ ] **PERS-04**: Strikers section displays "President, Strikers Dance Troupe" in bold editorial font treatment
- [ ] **PERS-05**: Journey timeline shows labeled nodes for: FAMU → Adobe → Outamation → Google CodePath → now → future
- [ ] **PERS-06**: Timeline nodes are moon/planet icons that pulse when active

### Hire Me

- [ ] **HIRE-01**: Rocket button is fixed in the bottom-right corner and visible at all scroll positions
- [ ] **HIRE-02**: On click, SVG rocket launches from the button with a particle trail and flies off-screen
- [ ] **HIRE-03**: After the rocket animation, an email address is revealed with a copy-to-clipboard button and a mailto link
- [ ] **HIRE-04**: On mobile, rocket fires horizontally instead of vertically

### Quality

- [ ] **QUAL-01**: All R3F Canvas components use `next/dynamic` with `{ ssr: false }` — `next build` completes without server-side errors
- [ ] **QUAL-02**: Site renders usably at 375px with CSS-only moon (radial-gradient + animation) and vertical card stack
- [ ] **QUAL-03**: `prefers-reduced-motion` disables all animations and shows a static fallback — implemented via `--motion-ok: 1` CSS custom property at `:root`
- [ ] **QUAL-04**: Canvas DPR is capped at `[1, 1.5]` — no uncapped retina rendering on mobile
- [ ] **QUAL-05**: OG image (1200×630 static moon screenshot) and `<title>` / `<meta description>` with recruiter keywords are set correctly
- [ ] **QUAL-06**: All external links (GitHub, live projects) are verified working before launch
- [ ] **QUAL-07**: Lighthouse performance score ≥ 80 on desktop; no LCP-blocking resources

---

## v2 Requirements

### Content

- **CONT-01**: Writing or blog section linking to external articles (dev.to / Medium)
- **CONT-02**: Additional project cards beyond the 2 main + placeholder slots
- **CONT-03**: Secondary Calendly link visible after email reveal for scheduling meetings

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| CMS or admin panel | Static personal site — hardcoded content |
| Contact form with backend | Email reveal + mailto has no conversion disadvantage; eliminates all infrastructure |
| Dark/light theme toggle | Single intentional visual direction — toggle dilutes the aesthetic |
| Analytics dashboard | Unnecessary complexity for a portfolio |
| Custom cursor | Overused 2020–2022; rocket + velocity effects do the same work |
| Auto-playing audio | Violates browser autoplay policy; visual atmosphere is sufficient |
| Blog (built-in) | Empty blog signals neglect — link to external platform in v2 instead |
| Multiple R3F canvases for nebula | Silently exhausts browser WebGL context limit |
| Preloader / loading screen | Makes the wait feel longer — progressive reveal preferred |
| Server-side API routes | No backend needed; contact handled via mailto |

---

## Traceability

*(Populated by roadmapper)*

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | — | Pending |
| FOUND-02 | — | Pending |
| FOUND-03 | — | Pending |
| FOUND-04 | — | Pending |
| FOUND-05 | — | Pending |
| HERO-01 | — | Pending |
| HERO-02 | — | Pending |
| HERO-03 | — | Pending |
| HERO-04 | — | Pending |
| HERO-05 | — | Pending |
| HERO-06 | — | Pending |
| HERO-07 | — | Pending |
| HERO-08 | — | Pending |
| NEB-01 | — | Pending |
| NEB-02 | — | Pending |
| NEB-03 | — | Pending |
| NEB-04 | — | Pending |
| NEB-05 | — | Pending |
| PROJ-01 | — | Pending |
| PROJ-02 | — | Pending |
| PROJ-03 | — | Pending |
| PROJ-04 | — | Pending |
| PROJ-05 | — | Pending |
| PROJ-06 | — | Pending |
| PROJ-07 | — | Pending |
| PERS-01 | — | Pending |
| PERS-02 | — | Pending |
| PERS-03 | — | Pending |
| PERS-04 | — | Pending |
| PERS-05 | — | Pending |
| PERS-06 | — | Pending |
| HIRE-01 | — | Pending |
| HIRE-02 | — | Pending |
| HIRE-03 | — | Pending |
| HIRE-04 | — | Pending |
| QUAL-01 | — | Pending |
| QUAL-02 | — | Pending |
| QUAL-03 | — | Pending |
| QUAL-04 | — | Pending |
| QUAL-05 | — | Pending |
| QUAL-06 | — | Pending |
| QUAL-07 | — | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 0 (roadmapper will fill)
- Unmapped: 41 ⚠️

---
*Requirements defined: 2026-05-05*
*Last updated: 2026-05-05 after initial definition*
