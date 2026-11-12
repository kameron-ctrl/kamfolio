import { describe, it, expect } from "vitest";
import { PIPELINE, PROJECTS } from "@/content/projects";

describe("projects", () => {
  it("shows only real projects (no 'in progress' placeholder)", () => {
    expect(PROJECTS.map((p) => p.id)).toEqual(["homelab-agents", "green-guardian", "cubecoach"]);
  });

  it("gives every project at least one link", () => {
    PROJECTS.forEach((p) => expect(Boolean(p.links.live || p.links.github)).toBe(true));
  });

  it("links the homelab project to its public repo and pipeline media", () => {
    const homelab = PROJECTS.find((p) => p.id === "homelab-agents");
    expect(homelab?.links.github).toBe("https://github.com/kameron-ctrl/homelab-agent-platform");
    expect(homelab?.media).toBe("agents");
  });

  it("routes the pipeline demo to its highest-scoring agent", () => {
    const best = [...PIPELINE.agents].sort((a, b) => b.score - a.score)[0];
    expect(best.name).toBe(PIPELINE.agents[PIPELINE.chosen].name);
  });
});
