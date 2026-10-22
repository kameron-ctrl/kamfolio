import { describe, it, expect } from "vitest";
import {
  flightPlan,
  nozzlePoint,
  spawnCount,
  makeParticle,
  stepParticles,
  particleLook,
  PARTICLE_LIFE_MS,
  type Particle,
} from "@/components/rocket/flight";

const BUTTON = { left: 1352, top: 812, width: 64, height: 64 };
const VIEWPORT = { width: 1440, height: 900 };

describe("flightPlan", () => {
  it("desktop: flies up off the top, drifting 6vw right and tilting 8°", () => {
    const plan = flightPlan(BUTTON, VIEWPORT, false);
    expect(plan.y).toBe(-(812 + 120));
    expect(plan.x).toBeCloseTo(1440 * 0.06, 6);
    expect(plan.rotate).toBe(8);
  });

  it("mobile: turns to point left and flies 110vw left with no vertical travel", () => {
    const plan = flightPlan(BUTTON, { width: 375, height: 812 }, true);
    expect(plan.rotate).toBe(-90);
    expect(plan.x).toBeCloseTo(-375 * 1.1, 6);
    expect(plan.y).toBe(0);
  });
});

describe("nozzlePoint", () => {
  it("sits straight below the center when the rocket points up", () => {
    const p = nozzlePoint({ x: 100, y: 100 }, 0, 20);
    expect(p.x).toBeCloseTo(100, 6);
    expect(p.y).toBeCloseTo(120, 6);
  });

  it("sits to the right of the center when the rocket points left", () => {
    const p = nozzlePoint({ x: 100, y: 100 }, -90, 20);
    expect(p.x).toBeCloseTo(120, 6);
    expect(p.y).toBeCloseTo(100, 6);
  });
});

describe("spawnCount", () => {
  it("spawns 60 per second, carrying fractions between frames", () => {
    let carry = 0;
    let total = 0;
    for (let i = 0; i < 60; i++) {
      const r = spawnCount(1000 / 60, carry);
      total += r.count;
      carry = r.carry;
    }
    expect(total).toBe(60);
  });

  it("spawns nothing for a zero-length frame", () => {
    expect(spawnCount(0, 0)).toEqual({ count: 0, carry: 0 });
  });
});

describe("particles", () => {
  const rand = (): number => 0.5;

  it("starts at the nozzle with a radius of 2–5px", () => {
    const p = makeParticle({ x: 10, y: 20 }, 0, rand);
    expect(p.x).toBe(10);
    expect(p.y).toBe(20);
    expect(p.r).toBeGreaterThanOrEqual(2);
    expect(p.r).toBeLessThanOrEqual(5);
    expect(p.age).toBe(0);
  });

  it("moves away from the nose (down when the rocket points up)", () => {
    const p = makeParticle({ x: 0, y: 0 }, 0, rand);
    expect(p.vy).toBeGreaterThan(0);
  });

  it("ages and moves particles without mutating the input", () => {
    const p: Particle = { x: 0, y: 0, vx: 0.1, vy: 0.2, r: 3, age: 0 };
    const [next] = stepParticles([p], 100);
    expect(next).toEqual({ ...p, x: 10, y: 20, age: 100 });
    expect(p.age).toBe(0);
  });

  it("drops particles once they outlive their lifetime", () => {
    const old: Particle = { x: 0, y: 0, vx: 0, vy: 0, r: 3, age: PARTICLE_LIFE_MS - 10 };
    expect(stepParticles([old], 20)).toHaveLength(0);
  });

  it("fades from full coral to silver at 0.3 alpha over its life", () => {
    const young = particleLook({ x: 0, y: 0, vx: 0, vy: 0, r: 3, age: 0 });
    const end = particleLook({ x: 0, y: 0, vx: 0, vy: 0, r: 3, age: PARTICLE_LIFE_MS });
    expect(young.alpha).toBe(1);
    expect(young.rgb).toEqual([255, 107, 107]);
    expect(end.alpha).toBeCloseTo(0.3, 6);
    expect(end.rgb).toEqual([241, 240, 224]);
  });
});
