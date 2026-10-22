Paste everything below the line into Claude in VS Code, after putting the `moon-hero-kit` folder at the root of your portfolio repo.

---

I'm explicitly asking you to skip the GSD workflow for this task and edit the repo directly. This is a focused integration with a finished reference, not a new phase.

**Goal:** Put the moon hero from `moon-hero-kit/` into my portfolio so it looks and moves exactly like `moon-hero-kit/reference/moon-hero.html`.

**Read first:**
1. `moon-hero-kit/MOON_HERO_SPEC.md` (what it must do, plus the acceptance checklist)
2. `moon-hero-kit/reference/moon-hero.html` (the approved look; plain Three.js)
3. `moon-hero-kit/src/components/moon/` (the React Three Fiber port; already typechecks against Next 14, R3F 8, drei 9, three 0.168)

**Then inspect my repo and tell me in a few lines, before editing anything:**
- Next.js, React, three, @react-three/fiber, @react-three/drei, and lenis versions
- Whether there is already a global R3F `<Canvas>`, where it is, and what camera it uses
- How Lenis and GSAP ScrollTrigger are set up
- Where the current hero lives and what it renders
- The components folder and import alias I use (e.g. `@/components`)

**Then integrate:**
1. Move `moon-hero-kit/public/textures/moon/*` to `public/textures/moon/`.
2. Move `moon-hero-kit/src/components/moon/` into my components folder and fix imports to my alias.
3. Move `MOON_HERO_SPEC.md` and the `reference/` folder to `docs/specs/moon-hero/` so they stay in the repo.
4. Canvas:
   - If a global `<Canvas>` exists, render `<MoonScene />` inside it and don't add a second canvas. The moon needs the camera at fov 45, z = 2. If other scenes in that canvas depend on a different camera, stop and ask me before changing it.
   - If there's no global canvas, render `<MoonCanvasLazy />` once on the home page (it's already `ssr: false`).
5. Replace my current hero with `<MoonHero />`, or move its markup into my hero if that fits better. Keep my headline text if I have one; otherwise keep the placeholder.
6. Make sure nothing above the hero has an opaque background covering the fixed canvas, and the page background matches the spec (charcoal radial gradient).
7. If my three version is older than 0.152, tell me: `THREE.NoColorSpace` needs 0.152+.

**Rules:**
- Do not change values in `tuning.ts` or the shaders unless my page doesn't match the reference. If you do, tell me which value and why.
- Do not add dependencies unless one is missing from the list above.
- Do not touch unrelated sections.

**Verify, then report:**
- Run typecheck, lint, and `next build`. Fix anything you broke.
- Start the dev server and compare against the reference at 1440×900 and at 375px wide.
- Go through every item in the spec's acceptance checklist and mark each pass or fail with one line of evidence.
- List the files you created, moved, and changed.
