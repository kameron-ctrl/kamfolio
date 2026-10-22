import { describe, it, expect } from "vitest";
import { PROJECTS } from "@/content/projects";

describe("projects", () => {
  it("shows only real projects (no 'in progress' placeholder)", () => {
    expect(PROJECTS.map((p) => p.id)).toEqual(["green-guardian", "cubecoach"]);
  });

  it("gives every project at least one link", () => {
    PROJECTS.forEach((p) => expect(Boolean(p.links.live || p.links.github)).toBe(true));
  });
});
