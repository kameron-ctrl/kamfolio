'use client';

import { Canvas } from '@react-three/fiber';
import MoonScene from './MoonScene';
import { MOON } from './tuning';

/**
 * Standalone fixed, full-screen canvas for the moon.
 * Use this only if the site does not have a global <Canvas> yet.
 * If it does, render <MoonScene /> inside that canvas instead (one WebGL context per page).
 */
export default function MoonCanvas() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, premultipliedAlpha: true }}
      camera={{ fov: MOON.camera.fov, near: 0.05, far: 100, position: [0, 0, MOON.camera.z] }}
    >
      <MoonScene />
    </Canvas>
  );
}
