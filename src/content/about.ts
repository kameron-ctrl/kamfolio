/**
 * Phase 6 content (docs/specs/CONTENT.md). Hardcoded on purpose — no CMS.
 * Experience comes from Kameron's resume; Airbets is intentionally left off.
 */

export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const STRIKERS_PHOTOS: readonly Photo[] = [
  {
    src: "/strikers/strikers-01.jpg",
    alt: "A Strikers dancer in a deep wide stance on stage, wearing the troupe's black jersey",
    width: 1290,
    height: 1581,
  },
  {
    src: "/strikers/strikers-02.jpg",
    alt: "The Strikers troupe posed together in white face paint and red-and-black costumes",
    width: 1066,
    height: 1600,
  },
  {
    src: "/strikers/strikers-03.jpg",
    alt: "A Strikers dancer caught mid-leap against a dark stage, in black and white",
    width: 1290,
    height: 1567,
  },
  {
    src: "/strikers/strikers-04.jpg",
    alt: "Close-up of a Strikers dancer in white face paint, hands raised toward the camera",
    width: 1290,
    height: 1513,
  },
];

export const STRIKERS = {
  kicker: "President,",
  title: "Strikers Dance Troupe",
  line: "Leading Tallahassee's oldest all-male dance troupe: 40+ men, two concerts a semester.",
  caption: "Strikers Dance Troupe · Tallahassee",
  photos: STRIKERS_PHOTOS,
} as const;

export type JourneyId = "famu" | "outamation" | "codepath" | "ucsc" | "now" | "future";

export interface JourneyNode {
  id: JourneyId;
  title: string;
  role: string;
  dates: string;
  line: string;
  /** CSS background for the planet; null draws the dashed "future" ring. */
  planet: string | null;
}

export const JOURNEY: readonly JourneyNode[] = [
  {
    id: "famu",
    title: "FAMU",
    role: "B.S. Computer Science · TA, OOP in C++",
    dates: "2023–2027",
    line: "CS at FAMU; TA'd C++ OOP for ~30 students and three weekly problem sessions.",
    planet: "radial-gradient(circle at 30% 30%, #f47c20, #0b6a3a 75%)",
  },
  {
    id: "outamation",
    title: "Outamation",
    role: "AI/Data Automation Extern",
    dates: "Oct 2025 – Jan 2026",
    line: "LLM pipelines that classify business documents ~30% faster, ~25% more accurately.",
    planet: "radial-gradient(circle at 30% 30%, #9ff0e8, #2ec4b6 45%, #0d4a45 100%)",
  },
  {
    id: "codepath",
    title: "Google CodePath",
    role: "Tech Exchange Scholar",
    dates: "Jan – May 2026",
    line: "Selected from 500+ applicants for Google's Tech Exchange program.",
    planet: "radial-gradient(circle at 30% 30%, #d6e2ff, #7aa2ff 45%, #213a73 100%)",
  },
  {
    id: "ucsc",
    title: "UCSC OSPO",
    role: "Open Source Intern, Contributor Catalyst",
    dates: "May – Aug 2026",
    line: "p5.js offline-reference research, mentored the cohort, spoke at PyTorch Santa Cruz.",
    planet: "radial-gradient(circle at 30% 30%, #ffd0d0, #ff6b6b 45%, #6b1f1f 100%)",
  },
  {
    id: "now",
    title: "Now",
    role: "Building CubeCoach & this site",
    dates: "2026",
    line: "Shipping full-stack products with a creative edge.",
    planet: "radial-gradient(circle at 30% 30%, #f1f0e0, #9a9a99 80%)",
  },
  {
    id: "future",
    title: "Your team?",
    role: "Next",
    dates: "Next",
    line: "Looking for full-stack / creative-tech roles.",
    planet: null,
  },
];

export const TALK = {
  meta: "Talk · JUN 30, 2026 · UC Santa Cruz",
  title: "Green Guardian at the inaugural PyTorch Santa Cruz Meetup",
  line: "Shared the stage with NVIDIA and Red Hat speakers to demo Green Guardian live.",
  photo: {
    src: "/talks/talk-04.jpg",
    alt: "Kameron presenting Green Guardian to a lecture hall at UC Santa Cruz",
    width: 1200,
    height: 1800,
  },
} as const;

export const ARTICLE = {
  meta: "Featured · AUG 2026 · PyTorch Foundation blog",
  title: "PyTorch by the Sea",
  quote: "…he got bonus points for giving us a live demo of the application in action.",
  attribution: "PyTorch Foundation blog",
  url: "https://pytorch.org/blog/pytorch-by-the-sea-the-inaugural-santa-cruz-pytorch-meetup/",
} as const;

const SLIDE_HEADLINES: readonly string[] = [
  "Green Guardian — diagnosing sick plants from a single photo, built solo with PyTorch",
  "The problem: I'm an amateur gardener, and a busy one",
  "The solution: snap a leaf, get a diagnosis, follow the treatment",
  "Inside the app: upload, diagnosis and treatment on one screen",
  "Why PyTorch: the easy, accessible way into machine learning",
  "Learning the skills: I started from Python, not a PhD",
  "How it works: leaf photo, preprocessing, ResNet-18, diagnosis",
  "Transfer learning: stand on a pretrained model",
  "The training loop: four steps, on repeat",
  "Results: ~97% validation accuracy across 15 classes with a ResNet-18",
  "Live demo: let's diagnose a leaf",
  "For students starting out: get out of tutorial limbo",
  "Thank you — QR codes for the GitHub repo and LinkedIn",
];

export const SLIDES: readonly { src: string; alt: string }[] = SLIDE_HEADLINES.map((headline, i) => ({
  src: `/talks/slides/slide-${String(i + 1).padStart(2, "0")}.png`,
  alt: `Slide ${i + 1}: ${headline}`,
}));

export const SLIDE_SIZE = { width: 720, height: 405 } as const;
