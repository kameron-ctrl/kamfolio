/**
 * Strikers silhouette formation (PERS-03) — docs/specs/personality-timeline.
 * Pure: scroll progress in, dancer foot positions on the 520×420 stage out.
 * Keys: V (0) → line (0.5) → diamond (1), power1.inOut between keys.
 */

export interface StagePoint {
  x: number;
  y: number;
}

export const STAGE_WIDTH = 520;
export const STAGE_HEIGHT = 420;
export const DANCER_COUNT = 7;
export const POSE_COUNT = 3;

const LINE_KEY = 0.5;

/** Index i is the same dancer in every formation, so each one walks its own path. */
export const FORMATIONS: Readonly<Record<"v" | "line" | "diamond", readonly StagePoint[]>> = {
  v: [
    { x: 260, y: 390 },
    { x: 205, y: 340 },
    { x: 315, y: 340 },
    { x: 150, y: 290 },
    { x: 370, y: 290 },
    { x: 95, y: 240 },
    { x: 425, y: 240 },
  ],
  line: [
    { x: 260, y: 310 },
    { x: 200, y: 310 },
    { x: 320, y: 310 },
    { x: 140, y: 310 },
    { x: 380, y: 310 },
    { x: 80, y: 310 },
    { x: 440, y: 310 },
  ],
  diamond: [
    { x: 260, y: 400 },
    { x: 260, y: 160 },
    { x: 260, y: 280 },
    { x: 195, y: 220 },
    { x: 325, y: 220 },
    { x: 130, y: 280 },
    { x: 390, y: 280 },
  ],
};

/** GSAP's power1.inOut (quadratic in-out). */
function power1InOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function blend(from: readonly StagePoint[], to: readonly StagePoint[], t: number): StagePoint[] {
  const e = power1InOut(t);
  return from.map((a, i) => ({ x: a.x + (to[i].x - a.x) * e, y: a.y + (to[i].y - a.y) * e }));
}

export function formationAt(progress: number): StagePoint[] {
  const p = clamp01(progress);
  if (p < LINE_KEY) return blend(FORMATIONS.v, FORMATIONS.line, p / LINE_KEY);
  return blend(FORMATIONS.line, FORMATIONS.diamond, (p - LINE_KEY) / (1 - LINE_KEY));
}

/** Each dancer starts on a staggered pose and steps to the next one at the line formation. */
export function poseAt(progress: number, dancer: number): number {
  const base = dancer % POSE_COUNT;
  return progress >= LINE_KEY ? (base + 1) % POSE_COUNT : base;
}
