/**
 * Nebula sprite texture utility — generates per-layer THREE.CanvasTexture
 * sprites at runtime via document.createElement("canvas") (D-13, D-14).
 *
 * IMPORTANT — SSR safety: do not touch `document` at module load. Only
 * inside createNebulaTextures(), which callers invoke from useMemo inside
 * a `next/dynamic ssr:false` Canvas — so the call site is browser-only.
 *
 * Sprite contract (UI-SPEC Layer Visual Character):
 *   star       16x16 sharp disc, hard edge  (blur stop 0.1)
 *   nebulaBlob 32x32 soft gaussian blob     (blur stop 0.5)
 *   bokeh      64x64 large soft disc + ring (blur stop 0.3)
 *   dustGrain  8x8 tiny grain               (blur stop 0.2)
 */
import * as THREE from "three";

export interface NebulaTextures {
  star: THREE.CanvasTexture;
  nebulaBlob: THREE.CanvasTexture;
  bokeh: THREE.CanvasTexture;
  dustGrain: THREE.CanvasTexture;
}

/**
 * Build a radial-gradient circle sprite as a THREE.CanvasTexture.
 * @param size  Canvas edge length in pixels (square).
 * @param blur  Position [0..1] of the inner-falloff stop. Smaller values
 *              produce harder edges (sharp disc); larger values produce
 *              softer falloff (gaussian blob).
 */
function makeCircleTexture(size: number, blur: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const center = size / 2;
  const gradient = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(blur, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Build a bokeh sprite — soft disc plus a faint inner ring suggestion
 * (lens out-of-focus character). Slightly more involved than the simple
 * radial gradient used for the other sprites.
 */
function makeBokehTexture(size: number, blur: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const center = size / 2;

  const grad = ctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  );
  grad.addColorStop(0, "rgba(255,255,255,0.85)");
  grad.addColorStop(blur, "rgba(255,255,255,0.5)");
  grad.addColorStop(0.85, "rgba(255,255,255,0.2)");
  grad.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Subtle inner ring — hint of lens-aperture character
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = Math.max(1, size * 0.025);
  ctx.beginPath();
  ctx.arc(center, center, center * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createNebulaTextures(): NebulaTextures {
  return {
    star: makeCircleTexture(16, 0.1),
    nebulaBlob: makeCircleTexture(64, 0.72),
    bokeh: makeBokehTexture(64, 0.25),
    dustGrain: makeCircleTexture(8, 0.2),
  };
}
