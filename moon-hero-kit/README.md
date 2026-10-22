# Moon hero kit

Everything needed to put the backlit 3D moon hero into the portfolio (Next.js 14 · React Three Fiber 8 · drei 9 · three ≤ 0.168 · Tailwind 3).

| Path | What it is |
|---|---|
| `PROMPT.md` | Prompt to paste into Claude in VS Code |
| `MOON_HERO_SPEC.md` | Behavior, exact numbers, acceptance checklist |
| `CLAUDE.additions.md` | Section to paste into your CLAUDE.md (outside the GSD markers) |
| `reference/moon-hero.html` | The approved look, plain Three.js. Serve the folder to view it: `npx serve reference` |
| `src/components/moon/` | R3F components: `Moon`, `Stars`, `MoonScene`, `MoonCanvas(Lazy)`, `MoonTarget`, `MoonHero`, `tuning.ts`, `shaders.ts` |
| `public/textures/moon/` | Your textures as WebP: surface (color), alt surface (grayscale), height map |

## Use it

1. Unzip and put `moon-hero-kit/` at the root of the portfolio repo.
2. Paste `CLAUDE.additions.md` into `CLAUDE.md`, outside the GSD markers.
3. Open Claude in VS Code and paste `PROMPT.md`.

## Manual wiring (if you'd rather do it yourself)

```tsx
// app/page.tsx
import { MoonHero, MoonCanvasLazy } from '@/components/moon';

export default function Home() {
  return (
    <main>
      <MoonCanvasLazy />   {/* or <MoonScene /> inside your existing global <Canvas> */}
      <MoonHero />
      {/* rest of the page */}
    </main>
  );
}
```

Page background should be the charcoal gradient from the spec, and nothing above the hero should paint an opaque background over the fixed canvas.
