import { describe, it, expect } from "vitest";
import {
  NEBULA_LAYERS,
  NEBULA_STAR_COLOR,
  NEBULA_BREATHE_MAX,
  NEBULA_BREATHE_VELOCITY_SCALE,
  NEBULA_H_PARALLAX_RANGE,
  NEBULA_DESKTOP_COUNTS,
  NEBULA_MOBILE_COUNTS,
  NEBULA_MOBILE_BREAKPOINT_PX,
  NEBULA_REDUCED_MOTION_PARALLAX_SCALE,
  NEBULA_L1_GRADIENT,
} from "@/components/canvas/NebulaScene.constants";

describe("NebulaScene constants — background composition", () => {
  it("omits colored nebula and bokeh layers", () => {
    expect(NEBULA_LAYERS.map((layer) => layer.name)).toEqual([
      "stars",
      "fgDust",
    ]);
  });

  it("NEBULA_L1_GRADIENT references CSS tokens for deep space gradient", () => {
    expect(NEBULA_L1_GRADIENT).toContain("--color-void");
    expect(NEBULA_L1_GRADIENT).toContain("--color-space");
  });
});

describe("NebulaScene constants — parallax coefficients", () => {
  it("keeps the star and dust parallax coefficients", () => {
    expect(NEBULA_LAYERS.map((layer) => layer.coefficient)).toEqual([
      0.05, 0.8,
    ]);
  });

  it("coefficients are strictly monotonically increasing", () => {
    for (let i = 1; i < NEBULA_LAYERS.length; i++) {
      expect(NEBULA_LAYERS[i].coefficient).toBeGreaterThan(
        NEBULA_LAYERS[i - 1].coefficient
      );
    }
  });

  it("NEBULA_H_PARALLAX_RANGE is between 8 and 15 world units (Pitfall 4)", () => {
    expect(NEBULA_H_PARALLAX_RANGE).toBeGreaterThanOrEqual(8);
    expect(NEBULA_H_PARALLAX_RANGE).toBeLessThanOrEqual(15);
  });
});

describe("NebulaScene constants — NEB-04 (breathe range 1.2–1.3)", () => {
  it("NEBULA_BREATHE_MAX is within [1.2, 1.3] inclusive", () => {
    expect(NEBULA_BREATHE_MAX).toBeGreaterThanOrEqual(1.2);
    expect(NEBULA_BREATHE_MAX).toBeLessThanOrEqual(1.3);
  });

  it("NEBULA_BREATHE_VELOCITY_SCALE is positive (used to clamp ramp to 0..1)", () => {
    expect(NEBULA_BREATHE_VELOCITY_SCALE).toBeGreaterThan(0);
  });

  it("NEBULA_REDUCED_MOTION_PARALLAX_SCALE is 0.2 per UI-SPEC reduced motion contract", () => {
    expect(NEBULA_REDUCED_MOTION_PARALLAX_SCALE).toBe(0.2);
  });
});

describe("NebulaScene constants — NEB-05 (star field 0.05x parallax)", () => {
  it("layer index 0 is named 'stars' with coefficient exactly 0.05", () => {
    expect(NEBULA_LAYERS[0].name).toBe("stars");
    expect(NEBULA_LAYERS[0].coefficient).toBe(0.05);
  });

  it("NEBULA_STAR_COLOR is #c8d8ff (Layer 2 pale blue-white)", () => {
    expect(NEBULA_STAR_COLOR).toBe("#c8d8ff");
  });

  it("desktop star count is 2500 (UI-SPEC mobile rendering contract)", () => {
    expect(NEBULA_DESKTOP_COUNTS.stars).toBe(2500);
  });

  it("mobile star count is 1000 (UI-SPEC mobile rendering contract)", () => {
    expect(NEBULA_MOBILE_COUNTS.stars).toBe(1000);
  });
});

describe("NebulaScene constants — render order (D-02: moon at 4, layers split)", () => {
  it("keeps only the stars behind the moon", () => {
    const behind = NEBULA_LAYERS.filter((l) => l.renderOrder < 4);
    expect(behind.map((l) => l.name)).toEqual(["stars"]);
  });

  it("keeps dust in front of the moon", () => {
    const front = NEBULA_LAYERS.filter((l) => l.renderOrder > 4);
    expect(front.map((l) => l.name)).toEqual(["fgDust"]);
  });

  it("no layer uses renderOrder 4 (reserved for moon per D-02)", () => {
    expect(NEBULA_LAYERS.every((l) => l.renderOrder !== 4)).toBe(true);
  });
});

describe("NebulaScene module shape (NEB-01) — RED until Plan 03", () => {
  it("exports a default React component (function)", async () => {
    // Dynamic import with computed path defeats Vite's static resolver so that
    // this test fails at runtime (RED) instead of failing to collect at all.
    // Plan 03 creates src/components/canvas/NebulaScene.tsx — this turns GREEN.
    const modulePath = "@/components/canvas/NebulaScene";
    const mod = await import(/* @vite-ignore */ modulePath);
    expect(typeof mod.default).toBe("function");
  });
});

describe("Mobile breakpoint constant", () => {
  it("NEBULA_MOBILE_BREAKPOINT_PX is 768", () => {
    expect(NEBULA_MOBILE_BREAKPOINT_PX).toBe(768);
  });
});
