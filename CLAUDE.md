<!-- GSD:project-start source:PROJECT.md -->
## Project

**Kameron Benjamin — Portfolio**

A personal portfolio website for Kameron Benjamin, a full-stack developer with a strong creative tech focus. It demonstrates engineering depth through real interactive 3D elements (a photorealistic moon hero, volumetric nebula layers, a live Rubik's cube) and a cinematic scroll experience that transitions from vertical to horizontal — built for general visibility, discovery, and letting the work speak for itself.

**Core Value:** A visitor should immediately feel the combination that makes Kameron distinctive: serious full-stack engineering ability expressed through genuine creative craft.

### Constraints

- **Stack**: Next.js 14 (App Router), React Three Fiber + Drei, Three.js, GSAP ScrollTrigger, Framer Motion, Lenis, Tailwind CSS — all decided upfront
- **Assets**: NASA lunar textures (public domain, no licensing concerns)
- **Performance**: JS budget < 300kb gzipped for app pages; heavy R3F scenes must use dynamic import
- **Timeline**: Weeks not months — phases must deliver visible, deployable increments
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Validated Stack (2025)
## Core Framework
### Next.js 14 (App Router)
- **Version**: 14.x stable ✓
- **Confidence**: High
- **Notes**: App Router is the correct choice. Pages Router has no advantages here.
- **SSR concern**: R3F Canvases must be dynamically imported with `{ ssr: false }` — WebGL APIs don't exist on the server.
## 3D Layer
### React Three Fiber 8.x + Three.js
- **Package**: `@react-three/fiber`
- **Confidence**: High
- **Critical**: Pin Three.js to a version compatible with R3F 8.x. R3F 8.x has known incompatibilities with Three.js 0.169+. Check R3F's peer deps before installing.
- **Pattern**: One global `<Canvas>` at layout level, not per-section. Per-section canvases cause expensive WebGL context creation/destruction.
- **SSR**: Every canvas must use `dynamic` with `{ ssr: false }`.
### Drei
- **Package**: `@react-three/drei`
- **Confidence**: High
- **Useful helpers for this project**:
## Scroll System
### Lenis
- **Package**: `lenis` (**NOT** `@studio-freight/lenis` — that package is dead/unmaintained)
- **Version**: Latest stable
- **Confidence**: High
- **Why**: Exposes `lenis.velocity` natively — no manual delta tracking needed
- **Critical wiring**: Must be initialized in root layout BEFORE GSAP ScrollTrigger. Wrong order breaks scroll triggers.
### GSAP ScrollTrigger
- **Package**: `gsap` (ScrollTrigger is included)
- **Version**: 3.x stable
- **Confidence**: High
- **Next.js App Router concern**: GSAP plugins must be registered inside `useEffect` (never at module level — SSR will fail). Use `gsap.registerPlugin(ScrollTrigger)` inside `useLayoutEffect` or `useEffect`.
- **StrictMode concern**: React 18 StrictMode double-invokes effects. Always return cleanup: `return () => { trigger.kill() }`.
## Animation
### Framer Motion
- **Package**: `motion` (package was renamed from `framer-motion` — check latest)
- **Version**: 11.x+ (major rewrite with new `motion` package name)
- **Confidence**: High for UI elements
- **Scope**: Use for card entrances, text animations, personality section. Do NOT use for scroll-driven 3D effects (use R3F useFrame + Lenis velocity instead).
## Styling
### Tailwind CSS
- **Version**: **v3.x** — do NOT use v4 (still in beta/RC, breaking changes, ecosystem not ready)
- **Confidence**: High (v3), Low (v4)
- **Config**: Use `tailwind.config.js` with content paths including `./src/**/*.{js,ts,jsx,tsx}`
## Assets
### NASA Lunar Textures
- **Source**: NASA Scientific Visualization Studio (svs.gsfc.nasa.gov)
- **License**: Public domain — no attribution required
- **Files needed**:
- **Format**: Use WebP or optimized PNG. Source files can be very large — resize to 2048×1024 or 4096×2048 max.
- **Loading**: Use Drei's `useTexture` hook, wrap scene in `<Suspense>`.
## What NOT to Use
| Library | Reason |
|---------|--------|
| `@studio-freight/lenis` | Unmaintained — use `lenis` instead |
| Tailwind v4 | Still beta, ecosystem not ready |
| Three.js 0.169+ | Potential R3F 8.x peer dep conflicts — pin version |
| `react-spring` for scroll | Lenis + GSAP covers this better for complex scroll systems |
| Multiple R3F Canvases | Expensive WebGL context creation — use one global Canvas |
| GSAP at module level (SSR) | Must register plugins inside useEffect |
## Missing Pieces (not in original blueprint)
- **`@react-three/postprocessing`** — if you want bloom/vignette on the nebula (optional but impactful)
- **`sharp`** — Next.js image optimization for project card screenshots
- **`clsx` / `tailwind-merge`** — conditional class utilities (standard in Next.js projects)
## Recommended `package.json` Starting Point
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
