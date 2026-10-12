import { describe, it, expect } from "vitest";
import { FORMATIONS, formationAt, poseAt, DANCER_COUNT } from "@/components/strikers/formation";

describe("formationAt", () => {
  it("returns the V formation at progress 0", () => {
    expect(formationAt(0)).toEqual(FORMATIONS.v);
  });

  it("returns the line formation at progress 0.5", () => {
    expect(formationAt(0.5)).toEqual(FORMATIONS.line);
  });

  it("returns the diamond formation at progress 1", () => {
    expect(formationAt(1)).toEqual(FORMATIONS.diamond);
  });

  it("clamps progress outside 0..1", () => {
    expect(formationAt(-0.4)).toEqual(FORMATIONS.v);
    expect(formationAt(1.7)).toEqual(FORMATIONS.diamond);
  });

  it("eases between keys with power1.inOut, so the midpoint of a segment is halfway", () => {
    const mid = formationAt(0.25);
    mid.forEach((p, i) => {
      expect(p.x).toBeCloseTo((FORMATIONS.v[i].x + FORMATIONS.line[i].x) / 2, 5);
      expect(p.y).toBeCloseTo((FORMATIONS.v[i].y + FORMATIONS.line[i].y) / 2, 5);
    });
  });

  it("moves slower near a key than a linear blend would (ease-in)", () => {
    // Dancer 0 only moves vertically between V and line; compare its y.
    const early = formationAt(0.05)[0];
    const linearY = FORMATIONS.v[0].y + (FORMATIONS.line[0].y - FORMATIONS.v[0].y) * 0.1;
    expect(Math.abs(early.y - FORMATIONS.v[0].y)).toBeLessThan(Math.abs(linearY - FORMATIONS.v[0].y));
  });

  it("every formation has one point per dancer", () => {
    Object.values(FORMATIONS).forEach((f) => expect(f).toHaveLength(DANCER_COUNT));
  });
});

describe("poseAt", () => {
  it("swaps each dancer's pose at progress 0.5", () => {
    const before = Array.from({ length: DANCER_COUNT }, (_, i) => poseAt(0.49, i));
    const after = Array.from({ length: DANCER_COUNT }, (_, i) => poseAt(0.5, i));
    before.forEach((pose, i) => expect(after[i]).not.toBe(pose));
  });

  it("only uses the 3 pose variants", () => {
    for (let i = 0; i < DANCER_COUNT; i++) {
      expect([0, 1, 2]).toContain(poseAt(0, i));
      expect([0, 1, 2]).toContain(poseAt(1, i));
    }
  });
});
