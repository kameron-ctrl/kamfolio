# Roadmap: Kameron Benjamin Portfolio

## Overview

Eight tightly-scoped phases follow the dependency-ordered build sequence from research: scroll infrastructure first, then the moon hero that establishes all Three.js patterns, then the nebula system that depends on the velocity pipeline, then hero text that depends on both canvas layers, then the horizontal project zone, personality sections, rocket CTA, and finally a focused polish pass. Every phase delivers one coherent, verifiable capability. No phase is skippable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Scroll Foundation** - Lenis + GSAP wiring, Zustand scroll store, single plugin registration, horizontal track stub
- [ ] **Phase 2: Moon Hero** - Global canvas, NASA textures, photorealistic moon with entrance animation and DPR cap
- [ ] **Phase 3: Nebula System** - 6-layer parallax stack, velocity breathe pipeline, particle clusters
- [ ] **Phase 4: Hero Section** - Name fade-in, subtitle typeout, grain overlay, reduced-motion fallback wired
- [ ] **Phase 5: Project Cards** - Full horizontal track, Green Guardian card, CubeCoach card, placeholder, clipPath entrance, SSR safety
- [ ] **Phase 6: Personality + Timeline** - Beyond the Code strip, Strikers section, journey timeline with planet nodes
- [ ] **Phase 7: Rocket CTA + UI** - Fixed rocket button, launch animation, email reveal, mobile horizontal variant
- [ ] **Phase 8: Polish + Mobile** - 375px layout, OG meta, Lighthouse audit, link verification

## Phase Details

### Phase 1: Scroll Foundation
**Goal**: The scroll infrastructure is wired and all downstream effects have a reliable, synced source of truth
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. Scrolling feels physically smooth — no native scroll jank visible on desktop or mobile
  2. A console log or Zustand devtools panel shows `velocity`, `scrollY`, `phase`, and `progress` updating on every scroll tick
  3. The page transitions from vertical scrolling to a pinned horizontal zone without visual stutter or position jump
  4. GSAP ScrollTrigger fires are verifiably locked to Lenis position (not native scrollY) — a test animation advances at the correct visual offset
  5. Importing GSAP plugins from any component never throws a duplicate-registration warning in the console
**Plans:** 4 plans
  - [x] 01-01-PLAN.md — Scaffold Next.js 14 + TypeScript + Tailwind v3 + install pinned deps + Vitest setup (Wave 0)
  - [x] 01-02-PLAN.md — Single GSAP plugin registration site + Zustand scroll store with displayVelocity lerp + computePhase tests (Wave 1)
  - [x] 01-03-PLAN.md — LenisProvider 5-step init order + ScrollDebugHUD + mount in layout.tsx (Wave 2)
  - [x] 01-04-PLAN.md — HorizontalTrack pin+scrub + page.tsx with vertical spacer and placeholder slots (Wave 3)
**UI hint**: yes

### Phase 2: Moon Hero
**Goal**: A photorealistic moon occupies the hero canvas with entrance animation and responsible GPU usage
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, HERO-05, QUAL-04
**Success Criteria** (what must be TRUE):
  1. Visitor sees crater detail from NASA displacement and normal maps — not a flat sphere
  2. The moon shows a convincing lit hemisphere and shadow side from the PointLight sun simulation
  3. An atmospheric glow rim is visible around the moon's silhouette
  4. On page load, the moon starts small/distant and smoothly grows toward the viewer over ~2.5 seconds
  5. Canvas DPR is capped at 1.5 — inspecting the canvas element on a retina display confirms pixel ratio does not exceed 1.5
**Plans:** 3 plans
  - [x] 02-01-PLAN.md — Wave 0 prerequisites: NASA textures, design tokens, RED test scaffold (Wave 0)
  - [x] 02-02-PLAN.md — MoonScene core: constants, R3F mesh + textures + lights, DPR canvas, Z fly-in entrance, rotation, layout wiring (Wave 1)
  - [x] 02-03-PLAN.md — Atmospheric glow rim: MoonGlow component with BackSide + AdditiveBlending, composed into MoonScene (Wave 2)
**UI hint**: yes

### Phase 3: Nebula System
**Goal**: A 6-layer parallax nebula fills the background and breathes in response to scroll velocity
**Depends on**: Phase 2
**Requirements**: NEB-01, NEB-02, NEB-03, NEB-04, NEB-05
**Success Criteria** (what must be TRUE):
  1. Six distinct depth layers are visible — deep space gradient behind everything, stars, far nebula, mid fog, near bokeh, foreground dust in front
  2. Scrolling fast causes nebula layers to visibly spread apart and scale up, then settle as velocity decays
  3. Purple, teal, and coral particle clusters are each distinguishable in the nebula composition
  4. Star field parallaxes at a slower rate than foreground layers in both the vertical and horizontal scroll zones
  5. Each layer moves at a distinctly different rate — the depth illusion holds when scrolling slowly
**Plans**: TBD
**UI hint**: yes

### Phase 4: Hero Section
**Goal**: The hero overlay is complete — name, subtitle, grain texture, and a reduced-motion fallback all work correctly
**Depends on**: Phase 3
**Requirements**: HERO-06, HERO-07, HERO-08, QUAL-03
**Success Criteria** (what must be TRUE):
  1. Kameron's name appears in large, thin-letter-spaced type overlaid on the moon and fades in on load
  2. The subtitle text types itself out character by character after the name fades in
  3. A CSS grain/scanline texture is visually present over the hero (verified with devtools: `::after` pseudo-element on the overlay)
  4. With `prefers-reduced-motion: reduce` set in OS preferences, all animations stop and a static view renders — no typing, no fade, no scroll effects
**Plans**: TBD
**UI hint**: yes

### Phase 5: Project Cards
**Goal**: The horizontal project zone is fully interactive — two real cards, a placeholder, and correct SSR behavior
**Depends on**: Phase 4
**Requirements**: PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, PROJ-06, PROJ-07, QUAL-01
**Success Criteria** (what must be TRUE):
  1. Scrolling down in the horizontal zone advances the project track leftward — cards move correctly
  2. Green Guardian card shows a leaf scan-line sweeping down the plant image on scroll-into-view, then a disease label fades in
  3. CubeCoach card contains a live, interactive Rubik's cube that scrambles on hover and slowly solves on mouse leave
  4. A styled placeholder card slot renders in the track without broken layout
  5. Each card reveals via a clipPath wipe from left to right as it enters view
  6. Nebula-only gaps between cards create visible breathing room in the track
  7. `next build` completes with zero server-side errors — no R3F canvas attempts to render on the server
**Plans**: TBD
**UI hint**: yes

### Phase 6: Personality + Timeline
**Goal**: The personality strip and journey timeline are complete and correctly placed in the horizontal zone
**Depends on**: Phase 5
**Requirements**: PERS-01, PERS-02, PERS-03, PERS-04, PERS-05, PERS-06
**Success Criteria** (what must be TRUE):
  1. Seven circular icons (Sousaphone, Dance, Garden, Skates, Sewing, Tea, Design) are visible in the personality strip
  2. Hovering each icon expands it to show its one-liner description
  3. The Strikers section shows a CSS-animated silhouette formation that shifts as scroll progress advances
  4. "President, Strikers Dance Troupe" renders in a bold editorial font treatment distinct from body text
  5. Journey timeline shows all six labeled nodes (FAMU, Adobe, Outamation, Google CodePath, now, future) with moon/planet icons that pulse when in active view
**Plans**: TBD
**UI hint**: yes

### Phase 7: Rocket CTA + UI
**Goal**: The hire-me rocket button is functional end-to-end — animation, reveal, and mobile variant all work
**Depends on**: Phase 6
**Requirements**: HIRE-01, HIRE-02, HIRE-03, HIRE-04
**Success Criteria** (what must be TRUE):
  1. The rocket button is visible in the bottom-right corner at every scroll position on every page section
  2. Clicking the button triggers a rocket SVG launch animation with a visible particle trail that flies off-screen
  3. After the animation completes, an email address is revealed with a working copy-to-clipboard button and a working mailto link
  4. On a 375px-wide device, the rocket fires horizontally instead of vertically
**Plans**: TBD
**UI hint**: yes

### Phase 8: Polish + Mobile
**Goal**: The site is launch-ready — mobile layout holds at 375px, meta is correct, performance passes, no dead links
**Depends on**: Phase 7
**Requirements**: QUAL-02, QUAL-05, QUAL-06, QUAL-07
**Success Criteria** (what must be TRUE):
  1. At 375px viewport width, the site renders usably — CSS-only moon (radial-gradient) replaces the 3D canvas and project cards stack vertically
  2. Sharing the URL on Slack or iMessage shows the correct OG image (1200x630 moon screenshot), title, and recruiter-keyword meta description
  3. Every external link (GitHub, live project URLs) opens correctly — no 404s
  4. Lighthouse desktop performance score is 80 or higher with no LCP-blocking resources flagged
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scroll Foundation | 0/4 | Not started | - |
| 2. Moon Hero | 0/3 | Not started | - |
| 3. Nebula System | 0/? | Not started | - |
| 4. Hero Section | 0/? | Not started | - |
| 5. Project Cards | 0/? | Not started | - |
| 6. Personality + Timeline | 0/? | Not started | - |
| 7. Rocket CTA + UI | 0/? | Not started | - |
| 8. Polish + Mobile | 0/? | Not started | - |
