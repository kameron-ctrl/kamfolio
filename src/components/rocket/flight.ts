/**
 * Rocket launch math (HIRE-02, HIRE-04) — docs/specs/rocket-cta. Pure, no DOM.
 * Angles are degrees clockwise from "nose up", matching CSS/GSAP `rotate`.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface FlightPlan {
  /** Translation from the launch position, px. */
  x: number;
  y: number;
  rotate: number;
}

const DESKTOP_DRIFT_VW = 0.06;
const DESKTOP_OVERSHOOT_PX = 120;
const DESKTOP_TILT_DEG = 8;
const MOBILE_TRAVEL_VW = 1.1;
const MOBILE_HEADING_DEG = -90;

/** Desktop: up and off the top. Mobile (HIRE-04): turn left and fly off the left edge. */
export function flightPlan(button: Box, viewport: Viewport, mobile: boolean): FlightPlan {
  if (mobile) return { x: -viewport.width * MOBILE_TRAVEL_VW, y: 0, rotate: MOBILE_HEADING_DEG };
  return {
    x: viewport.width * DESKTOP_DRIFT_VW,
    y: -(button.top + DESKTOP_OVERSHOOT_PX),
    rotate: DESKTOP_TILT_DEG,
  };
}

function noseDirection(rotationDeg: number): Point {
  const a = (rotationDeg * Math.PI) / 180;
  return { x: Math.sin(a), y: -Math.cos(a) };
}

/** The exhaust point: `halfLength` behind the center, opposite the nose. */
export function nozzlePoint(center: Point, rotationDeg: number, halfLength: number): Point {
  const nose = noseDirection(rotationDeg);
  return { x: center.x - nose.x * halfLength, y: center.y - nose.y * halfLength };
}

// ── Particle trail ────────────────────────────────────────────────────────────

export interface Particle {
  x: number;
  y: number;
  /** Velocity, px/ms. */
  vx: number;
  vy: number;
  r: number;
  /** ms since spawn. */
  age: number;
}

export const PARTICLE_LIFE_MS = 600;
const PARTICLES_PER_SECOND = 60;
const RADIUS_MIN = 2;
const RADIUS_RANGE = 3;
const SPEED_MIN = 0.06;
const SPEED_RANGE = 0.06;
const SPREAD = 0.08;
const END_ALPHA = 0.3;
const CORAL: readonly [number, number, number] = [255, 107, 107];
const SILVER: readonly [number, number, number] = [241, 240, 224];

/** Whole particles to spawn this frame; the fraction carries to the next. */
export function spawnCount(dtMs: number, carry: number): { count: number; carry: number } {
  const total = carry + (dtMs * PARTICLES_PER_SECOND) / 1000;
  const count = Math.floor(total + 1e-9);
  return { count, carry: Math.max(0, total - count) };
}

/** A particle at the nozzle, pushed out the back of the rocket with a little sideways spread. */
export function makeParticle(nozzle: Point, rotationDeg: number, rand: () => number): Particle {
  const nose = noseDirection(rotationDeg);
  const exhaust = { x: -nose.x, y: -nose.y };
  const side = { x: -exhaust.y, y: exhaust.x };
  const speed = SPEED_MIN + SPEED_RANGE * rand();
  const spread = (rand() - 0.5) * SPREAD;
  return {
    x: nozzle.x,
    y: nozzle.y,
    vx: exhaust.x * speed + side.x * spread,
    vy: exhaust.y * speed + side.y * spread,
    r: RADIUS_MIN + RADIUS_RANGE * rand(),
    age: 0,
  };
}

export function stepParticles(particles: readonly Particle[], dtMs: number): Particle[] {
  return particles
    .map((p) => ({ ...p, x: p.x + p.vx * dtMs, y: p.y + p.vy * dtMs, age: p.age + dtMs }))
    .filter((p) => p.age < PARTICLE_LIFE_MS);
}

/** Coral at spawn, fading to silver at 0.3 alpha by the end of its life. */
export function particleLook(p: Particle): { rgb: [number, number, number]; alpha: number } {
  const t = Math.min(1, Math.max(0, p.age / PARTICLE_LIFE_MS));
  const rgb = CORAL.map((c, i) => Math.round(c + (SILVER[i] - c) * t)) as [number, number, number];
  return { rgb, alpha: 1 - (1 - END_ALPHA) * t };
}
