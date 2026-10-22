import { describe, it, expect } from "vitest";
import { pickActiveNode } from "@/components/journey/active-node";

describe("pickActiveNode", () => {
  it("returns the node nearest the target", () => {
    expect(pickActiveNode([100, 460, 820], 500, 180)).toBe(1);
  });

  it("returns -1 when no node is within the radius", () => {
    expect(pickActiveNode([100, 900], 500, 180)).toBe(-1);
  });

  it("includes a node exactly at the radius", () => {
    expect(pickActiveNode([680], 500, 180)).toBe(0);
  });

  it("prefers the earlier node on a tie", () => {
    expect(pickActiveNode([400, 600], 500, 180)).toBe(0);
  });

  it("returns -1 for no nodes", () => {
    expect(pickActiveNode([], 500, 180)).toBe(-1);
  });
});
