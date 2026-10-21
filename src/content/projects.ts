/**
 * Project card content (docs/specs/CONTENT.md). Hardcoded on purpose — no CMS.
 * A link left undefined is not rendered.
 */
export type ProjectMedia = "leaf" | "cube";

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

export const PROJECTS: readonly Project[] = [
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
