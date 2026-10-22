import { describe, it, expect } from "vitest";
import { invertMove, randomMove, nextMove, type CubeMove, type CubePlan } from "@/components/cube/cube-moves";

const R: CubeMove = { axis: "x", layer: 1, dir: 1 };

describe("invertMove", () => {
  it("flips direction and keeps axis/layer", () => {
    expect(invertMove(R)).toEqual({ axis: "x", layer: 1, dir: -1 });
  });
});

describe("randomMove", () => {
  it("never turns the same axis+layer as the previous move", () => {
    let prev: CubeMove | null = null;
    for (let i = 0; i < 500; i++) {
      const m = randomMove(prev);
      if (prev) expect(m.axis === prev.axis && m.layer === prev.layer).toBe(false);
      expect([-1, 0, 1]).toContain(m.layer);
      prev = m;
    }
  });
});

describe("nextMove — scramble pushes history, solve pops it inverted", () => {
  it("scrambles until the budget is spent, recording each move", () => {
    let plan: CubePlan = { mode: "scramble", remaining: 3, history: [] };
    const applied: CubeMove[] = [];
    for (;;) {
      const step = nextMove(plan);
      if (!step) break;
      applied.push(step.move);
      plan = step.plan;
    }
    expect(applied).toHaveLength(3);
    expect(plan.history).toEqual(applied);
    expect(plan.remaining).toBe(0);
  });

  it("solves by undoing history in reverse order until clean", () => {
    const a: CubeMove = { axis: "x", layer: 1, dir: 1 };
    const b: CubeMove = { axis: "y", layer: -1, dir: -1 };
    let plan: CubePlan = { mode: "solve", remaining: 0, history: [a, b] };
    const applied: CubeMove[] = [];
    for (;;) {
      const step = nextMove(plan);
      if (!step) break;
      applied.push(step.move);
      plan = step.plan;
    }
    expect(applied).toEqual([invertMove(b), invertMove(a)]);
    expect(plan.history).toEqual([]);
  });

  it("does not mutate the plan it is given", () => {
    const plan: CubePlan = { mode: "scramble", remaining: 1, history: [] };
    nextMove(plan);
    expect(plan).toEqual({ mode: "scramble", remaining: 1, history: [] });
  });

  it("returns null when idle", () => {
    expect(nextMove({ mode: "idle", remaining: 5, history: [R] })).toBeNull();
  });
});
