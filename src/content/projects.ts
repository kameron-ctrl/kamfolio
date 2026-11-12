/**
 * Project card content (docs/specs/CONTENT.md). Hardcoded on purpose — no CMS.
 * A link left undefined is not rendered.
 */
export type ProjectMedia = "leaf" | "cube" | "agents";

export interface Project {
  id: string;
  title: string;
  description: string;
  pills: readonly string[];
  links: { live?: string; github?: string };
  media: ProjectMedia;
}

/** Label revealed after the Green Guardian scan line finishes. */
export const LEAF_DIAGNOSIS = "Tomato · Leaf mold";

/**
 * The homelab card's animated schematic: a Telegram task routed to the best-scoring agent.
 * Scores mirror the harness router's output; `chosen` indexes the winner.
 */
export const PIPELINE = {
  task: "/run cubecoach fix flaky test",
  agents: [
    { name: "Claude", score: 0.82 },
    { name: "Codex", score: 0.64 },
    { name: "Gemini", score: 0.41 },
  ],
  chosen: 0,
  result: "agent/job-42 · tests pass",
} as const;

export const PROJECTS: readonly Project[] = [
  {
    id: "homelab-agents",
    title: "Homelab Agents",
    description:
      "I text a task to a Telegram bot and an AI coding agent picks it up on my Proxmox homelab. A router sends each job to Claude Code, Codex, or Gemini by learned success rate and fails over on rate limits. Every job gets its own branch, sandboxes can't reach my network, and a nightly maintainer opens PRs only when tests pass.",
    pills: ["Python", "Docker", "Proxmox", "systemd", "Telegram", "SQLite"],
    links: { github: "https://github.com/kameron-ctrl/homelab-agent-platform" },
    media: "agents",
  },
  {
    id: "green-guardian",
    title: "Green Guardian",
    description:
      "Snap a leaf, get a diagnosis. A custom-trained PyTorch model classifies 15 tomato, potato, and bell-pepper conditions with confidence scores and treatment steps, served from a Dockerized FastAPI backend on AWS Lambda.",
    pills: ["Next.js", "TypeScript", "PyTorch", "FastAPI", "AWS Lambda", "CloudFront"],
    links: {
      live: "https://greenguardian.dev",
      github: "https://github.com/kameron-ctrl/GreenGuardian",
    },
    media: "leaf",
  },
  {
    id: "cubecoach",
    title: "CubeCoach",
    description:
      "An AI-powered Rubik's cube coach: a 3D cube you can step through, Claude-generated explanations tuned to your level, and SM-2 spaced-repetition drills for all 57 OLL and 21 PLL cases.",
    pills: ["Next.js", "TypeScript", "Three.js", "FastAPI", "Claude API", "PostgreSQL"],
    links: { github: "https://github.com/kameron-ctrl/CubeCoach" },
    media: "cube",
  },
];
