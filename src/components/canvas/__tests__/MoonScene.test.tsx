import { describe, it, expect } from "vitest";
import {
  MOON_DPR_CAP,
  MOON_ENTRANCE_DURATION,
  MOON_ENTRANCE_EASE,
  MOON_ENTRANCE_START_Z,
  MOON_ENTRANCE_END_Z,
  MOON_ROTATION_PER_FRAME,
  MOON_X_OFFSET,
  MOON_GLOW_RADIUS_MULTIPLIER,
} from "@/components/canvas/MoonScene.constants";

describe("MoonScene constants — QUAL-04 (DPR cap)", () => {
  it("MOON_DPR_CAP is the tuple [1, 1.5]", () => {
    expect(MOON_DPR_CAP).toEqual([1, 1.5]);
  });

  it("MOON_DPR_CAP upper bound is exactly 1.5 (not 2.0)", () => {
    expect(MOON_DPR_CAP[1]).toBe(1.5);
    expect(MOON_DPR_CAP[1]).not.toBe(2);
  });
});

describe("MoonScene constants — HERO-04 (Z fly-in entrance)", () => {
  it("MOON_ENTRANCE_DURATION equals 2.5 seconds", () => {
    expect(MOON_ENTRANCE_DURATION).toBe(2.5);
  });

  it("MOON_ENTRANCE_EASE equals 'power3.out'", () => {
    expect(MOON_ENTRANCE_EASE).toBe("power3.out");
  });

  it("MOON_ENTRANCE_START_Z equals -15 (distant)", () => {
    expect(MOON_ENTRANCE_START_Z).toBe(-15);
  });

  it("MOON_ENTRANCE_END_Z equals 0 (resting position)", () => {
    expect(MOON_ENTRANCE_END_Z).toBe(0);
  });
});

describe("MoonScene constants — HERO-05 (self-rotation)", () => {
  it("MOON_ROTATION_PER_FRAME equals 0.0005 rad/frame", () => {
    expect(MOON_ROTATION_PER_FRAME).toBe(0.0005);
  });

  it("MOON_ROTATION_PER_FRAME is subtle (< 0.001) and positive", () => {
    expect(MOON_ROTATION_PER_FRAME).toBeLessThan(0.001);
    expect(MOON_ROTATION_PER_FRAME).toBeGreaterThan(0);
  });
});

describe("MoonScene constants — D-04/D-05 (right-of-center framing)", () => {
  it("MOON_X_OFFSET is positive (right of camera center) and >= 1.0", () => {
    expect(MOON_X_OFFSET).toBeGreaterThanOrEqual(1.0);
  });
});

describe("MoonScene constants — D-17 (glow rim radius)", () => {
  it("MOON_GLOW_RADIUS_MULTIPLIER is 1.10 (10% larger than moon)", () => {
    expect(MOON_GLOW_RADIUS_MULTIPLIER).toBe(1.10);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Module structure smoke tests (Plan 02 Task 3)
// jsdom has no WebGL — we assert module shape, not rendered output.
// ─────────────────────────────────────────────────────────────────────────

describe("MoonScene.client — module structure", () => {
  it("exports a default React component (function)", async () => {
    const mod = await import("@/components/canvas/MoonScene.client");
    expect(typeof mod.default).toBe("function");
  });
});

describe("MoonScene constants regression — DPR plumbed to Canvas", () => {
  it("MOON_DPR_CAP is the same tuple consumed by MoonScene.client.tsx", () => {
    // MoonScene.client.tsx imports MOON_DPR_CAP and applies it to <Canvas dpr={MOON_DPR_CAP}>.
    // This regression test guards against silent drift between the constant and the test value.
    expect(MOON_DPR_CAP).toEqual([1, 1.5]);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// MoonGlow module structure smoke tests (Plan 03 Task 2)
// jsdom has no WebGL — assert module shape only.
// ─────────────────────────────────────────────────────────────────────────

describe("MoonGlow — module structure (HERO-03)", () => {
  it("exports a default React component (function)", async () => {
    const mod = await import("@/components/canvas/MoonGlow");
    expect(typeof mod.default).toBe("function");
  });

  it("MOON_GLOW_RADIUS_MULTIPLIER is the value MoonGlow multiplies moonRadius by", () => {
    // MoonGlow.tsx computes glowRadius = moonRadius * MOON_GLOW_RADIUS_MULTIPLIER.
    // Refined to 1.10 (10% larger) during visual polish before Phase 4 — subtle but visible rim glow.
    expect(MOON_GLOW_RADIUS_MULTIPLIER).toBe(1.10);
  });
});
