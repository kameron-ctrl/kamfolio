import { describe, it, expect } from "vitest";
import { computePhaseFromRange } from "@/lib/scroll-store";

// Pin starts at 2000px, ends at 6000px, viewport 900px tall.
const RANGE = { start: 2000, end: 6000 };
const VH = 900;

describe("computePhaseFromRange — phases follow the pinned track, not page fractions", () => {
  it("is vertical before the 100vh transition window", () => {
    expect(computePhaseFromRange(0, RANGE, VH)).toEqual({ phase: "vertical", progress: 0 });
    const mid = computePhaseFromRange(550, RANGE, VH);
    expect(mid.phase).toBe("vertical");
    expect(mid.progress).toBeCloseTo(0.5);
  });

  it("is transition during the 100vh before the pin starts", () => {
    const r = computePhaseFromRange(1550, RANGE, VH);
    expect(r.phase).toBe("transition");
    expect(r.progress).toBeCloseTo(0.5);
  });

  it("is horizontal from pin start to pin end with 0..1 progress", () => {
    expect(computePhaseFromRange(2000, RANGE, VH)).toEqual({ phase: "horizontal", progress: 0 });
    expect(computePhaseFromRange(4000, RANGE, VH).progress).toBeCloseTo(0.5);
    expect(computePhaseFromRange(6000, RANGE, VH)).toEqual({ phase: "horizontal", progress: 1 });
  });

  it("clamps horizontal progress at 1 after the pin ends", () => {
    expect(computePhaseFromRange(9000, RANGE, VH)).toEqual({ phase: "horizontal", progress: 1 });
  });

  it("treats a pin that starts within the first viewport as transition from 0", () => {
    const r = computePhaseFromRange(0, { start: 300, end: 900 }, VH);
    expect(r.phase).toBe("transition");
    expect(r.progress).toBeGreaterThanOrEqual(0);
  });
});
