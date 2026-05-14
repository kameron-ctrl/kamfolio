/**
 * Nebula sprite texture utility — generates per-layer THREE.CanvasTexture
 * sprites at runtime via document.createElement("canvas") (D-13, D-14).
 *
 * IMPORTANT — SSR safety: do not touch `document` at module load. Only
 * inside createNebulaTextures(), which callers invoke from useMemo inside
 * a `next/dynamic ssr:false` Canvas — so the call site is browser-only.
 *
 * Plan 01 ships this typed stub; Plan 02 fills in the canvas-drawing logic
 * for each sprite (star sharp disc, nebulaBlob soft gaussian, bokeh large
 * soft disc, dustGrain tiny grain).
 */
import * as THREE from "three";

export interface NebulaTextures {
  star: THREE.CanvasTexture;
  nebulaBlob: THREE.CanvasTexture;
  bokeh: THREE.CanvasTexture;
  dustGrain: THREE.CanvasTexture;
}

/**
 * Build a single radial-gradient circle sprite as a THREE.CanvasTexture.
 * Plan 02 implements the gradient draw; for Wave 0 it returns a minimal
 * valid texture so module-shape tests can run.
 */
function makeCircleTexture(size: number, _blur: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  // Plan 02 will draw a real radial gradient here.
  return new THREE.CanvasTexture(canvas);
}

export function createNebulaTextures(): NebulaTextures {
  return {
    star: makeCircleTexture(16, 0.1),
    nebulaBlob: makeCircleTexture(32, 0.5),
    bokeh: makeCircleTexture(64, 0.3),
    dustGrain: makeCircleTexture(8, 0.2),
  };
}
