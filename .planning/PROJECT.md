# Kameron Benjamin — Portfolio

## What This Is

A personal portfolio website for Kameron Benjamin, a full-stack developer with a strong creative tech focus. It demonstrates engineering depth through real interactive 3D elements (a photorealistic moon hero, volumetric nebula layers, a live Rubik's cube) and a cinematic scroll experience that transitions from vertical to horizontal — built for general visibility, discovery, and letting the work speak for itself.

## Core Value

A visitor should immediately feel the combination that makes Kameron distinctive: serious full-stack engineering ability expressed through genuine creative craft.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Foundation**
- [ ] Lenis smooth scroll integrated with velocity exposed to all effects
- [ ] Vertical → horizontal scroll transition: vertical (0–40%), pin/transition zone (40–55%), horizontal (55–100%)
- [ ] GSAP ScrollTrigger driving the sticky horizontal pin
- [ ] Velocity pipeline: `displayVelocity` lerped from scroll delta, piped to skewX, blur, and nebula spread multipliers

**Hero — The Moon**
- [ ] THREE.SphereGeometry moon with NASA displacement + normal maps (public domain)
- [ ] PointLight sun simulation with lit/dark hemisphere (visible moon phase)
- [ ] Atmospheric glow rim: second larger sphere, MeshBasicMaterial, AdditiveBlending
- [ ] Entrance animation: moon starts small/distant, lerps toward camera over ~2.5s
- [ ] Subtle Y-axis self-rotation (~0.0005/frame)
- [ ] Name fades in over the moon, large, thin letter-spacing
- [ ] Subtitle types itself out (typing animation)
- [ ] CSS grain/scanline overlay (::after pseudo-element) for cinematic texture

**Nebula Depth System**
- [ ] 6-layer parallax stack: deep space gradient (fixed) → distant stars → far nebula → mid volumetric fog particles → near bokeh → foreground dust motes
- [ ] Per-layer parallax coefficients (0.05x → 0.8x) for vertical and horizontal phases
- [ ] Three nebula clusters (~800 particles each), AdditiveBlending: purple #7b4fa6, teal #2ec4b6, coral #ff6b6b
- [ ] Velocity response: at high velocity, layers spread/scale up then settle back (nebula "breathes")

**Project Cards (horizontal zone)**
- [ ] Green Guardian card: leaf scan-line animation sweeps down plant image on enter, disease label fades in
- [ ] CubeCoach card: embedded live R3F Rubik's cube, scrambles on hover, slowly solves on mouse leave
- [ ] Placeholder card slot(s) for TBD projects — skeleton that can be filled later
- [ ] clipPath wipe entrance (left → right) on card scroll-into-view
- [ ] Interstitial nebula-only gaps between cards for breathing room
- [ ] Card content: project description, tech stack pills, live link + GitHub link

**Personality Sections (horizontal zone)**
- [ ] "Beyond the Code" strip: circular expandable icons (Sousaphone, Dance, Garden, Skates, Sewing, Tea, Design) with one-liner on hover
- [ ] Strikers Dance Troupe section: CSS-animated silhouette formation, editorial font treatment, "President, Strikers Dance Troupe"
- [ ] Horizontal journey timeline: FAMU → Adobe → Outamation → Google CodePath → now → future, with moon/planet node icons that pulse when active

**Hire Me**
- [ ] Fixed bottom-right rocket button, always visible
- [ ] On click: SVG rocket launches from button with R3F/canvas particle trail, flies off-screen
- [ ] Button transitions to "Launching..." then reveals contact form or email
- [ ] Mobile variant: rocket fires horizontally instead of vertically

**Polish & Responsive**
- [ ] Mobile breakpoints throughout
- [ ] CSS backdrop-filter color grading pass
- [ ] Performance: dynamic imports for heavy R3F scenes, `loading="eager"` + `fetchpriority="high"` for hero only

### Out of Scope

- CMS or admin panel — static personal site, content is hardcoded
- Blog — not in scope for this build
- Analytics dashboard — unnecessary complexity for a portfolio
- Server-side API routes — contact handled via external service (email/mailto)
- Multiple themes / dark-mode toggle — single intentional visual direction

## Context

- **Background**: FAMU → Adobe → Outamation → Google CodePath. Also President of Strikers Dance Troupe. Interests span sousaphone, dance, gardening, skating, sewing, tea, and design.
- **Existing projects**: CubeCoach has a live frontend at `~/downloads/cubecoach/frontend`. Green Guardian is a plant disease detection app.
- **Design reference**: Cinematic feel inspired by Shalon's site; intentional scanline/grain texture, not typical clean-minimal aesthetic.
- **Inspiration**: The moon/nebula concept is original; NASA textures are public domain.
- **Timeline**: Weeks, not months. Urgency without a hard deadline.

## Constraints

- **Stack**: Next.js 14 (App Router), React Three Fiber + Drei, Three.js, GSAP ScrollTrigger, Framer Motion, Lenis, Tailwind CSS — all decided upfront
- **Assets**: NASA lunar textures (public domain, no licensing concerns)
- **Performance**: JS budget < 300kb gzipped for app pages; heavy R3F scenes must use dynamic import
- **Timeline**: Weeks not months — phases must deliver visible, deployable increments

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Lenis for smooth scroll | Exposes `lenis.velocity` out of the box — eliminates hand-rolled delta tracking | — Pending |
| Horizontal scroll via CSS translateX mapped from scrollY | Avoids true scroll hijacking; keeps native scroll events intact | — Pending |
| NASA lunar textures | Public domain, photorealistic, free — no alternatives needed | — Pending |
| React Three Fiber over vanilla Three.js | Declarative 3D integrates cleanly with React/Next.js component model | — Pending |
| Single visual direction (no dark/light toggle) | The moon/nebula aesthetic is the brand — a toggle would dilute it | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-05 after initialization*
