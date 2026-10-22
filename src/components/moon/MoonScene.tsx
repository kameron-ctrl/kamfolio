'use client';

import { Suspense } from 'react';
import { Moon, type MoonSurface } from './Moon';
import { Stars } from './Stars';

/**
 * Drop this inside your existing global R3F <Canvas>.
 * Requires the canvas camera to be fov 45 at z = 2 (see tuning.ts → MOON.camera).
 */
export default function MoonScene({ surface = 'color', stars = true }: { surface?: MoonSurface; stars?: boolean }) {
  return (
    <Suspense fallback={null}>
      {stars && <Stars />}
      <Moon surface={surface} />
    </Suspense>
  );
}
