/**
 * Phase 6 content (docs/specs/CONTENT.md). Hardcoded on purpose — no CMS.
 * Experience comes from Kameron's resume; Airbets is intentionally left off.
 * About copy is Kameron's own words, verbatim (Oct 12, 2026).
 */

export const ABOUT = {
  lead: "I'm Kameron, a computer science student at Florida A&M University (Class of 2027) who likes to build things that help people grow, whether that's software, gardens, or communities.",
  body: "Right now, I'm contributing through the UCSC Open Source Contributor Catalyst Program and exploring work at the intersection of AI, full-stack development, and 3D visuals. When I'm away from the keyboard, you can usually find me dancing, playing sousaphone, tending my plants, homelabbing, or chasing down my next idea over a cup of tea.",
  facts: [
    { label: "School", value: "Florida A&M University" },
    { label: "Class of", value: "2027" },
    { label: "Now", value: "UCSC Open Source Contributor Catalyst" },
  ],
} as const;

export interface SkillGroup {
  group: string;
  items: readonly string[];
}

/** From the resume's Technical Skills, regrouped for reading. */
export const SKILLS: readonly SkillGroup[] = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "C++", "Java", "SQL", "HTML/CSS"] },
  { group: "Frontend & 3D", items: ["React", "Next.js", "React Native", "Three.js"] },
  {
    group: "Backend & Cloud",
    items: ["Node.js", "FastAPI", "REST APIs", "Docker", "AWS (EC2, Lambda)", "Git & GitHub"],
  },
  {
    group: "AI & ML",
    items: ["PyTorch", "LLMs", "Claude API", "Agentic AI pipelines", "Prompt engineering", "Data processing", "Jupyter / Colab"],
  },
];


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
    alt: "The Strikers troupe posed together against a white backdrop, in white face paint and red-and-black costumes",
    width: 1280,
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

export interface Organization {
  id: string;
  /** Mono kicker above the name, e.g. "President,". */
  kicker: string;
  name: string;
  line: string;
  /** Mono line under the description (dates, other roles). */
  meta?: string;
  link?: { href: string; label: string };
  /** Caption under the photo row. */
  caption: string;
  photos: readonly Photo[];
  /** Strikers keeps its dancer formation; the others lead with their first photo. */
  visual: "formation" | "photo";
}

/** Campus involvement, in page order. Kameron is adding photos + descriptions for KKPsi and the band. */
export const ORGANIZATIONS: readonly Organization[] = [
  {
    id: "strikers",
    kicker: "President,",
    name: "Strikers Dance Troupe",
    line: "Leading Tallahassee's oldest all-male dance troupe: 40+ men, two concerts a semester.",
    meta: "Sept 2023 – present · Also assistant rehearsal director & historian",
    caption: "Strikers Dance Troupe · Tallahassee",
    photos: STRIKERS_PHOTOS,
    visual: "formation",
  },
  {
    id: "kkpsi",
    kicker: "Vice President of Programs,",
    name: "Kappa Kappa Psi",
    line: "The national honorary fraternity for college band members, devoted to supporting college bands, honoring dedicated musicians, and growing campus leaders through band. As Vice President of Programs, I coordinate and mediate every event our chapter holds.",
    meta: "Apr 2025 – present · Also co-webmaster",
    link: { href: "https://www.deltaiota.org/", label: "deltaiota.org" },
    caption: "Kappa Kappa Psi · FAMU",
    photos: [
      {
        src: "/involvement/kkpsi-01.jpg",
        alt: "Kameron smiling in a black Kappa Kappa Psi polo, seated against a white backdrop",
        width: 1143,
        height: 1600,
      },
    ],
    visual: "photo",
  },
  {
    id: "marching-100",
    kicker: "Sousaphone,",
    name: "FAMU Marching \"100\"",
    line: "Florida A&M's world-renowned, widely requested marching band, founded June 1, 1946 by Dr. William Patrick Foster. I'm a fourth-year sousaphone player and served as a rank sergeant.",
    meta: "4th year · Rank sergeant",
    caption: "FAMU Marching \"100\" · Tallahassee",
    photos: [
      {
        src: "/involvement/marching-100-01.jpg",
        alt: "Kameron playing sousaphone in the stands with the Marching 100, wearing a red headband",
        width: 1190,
        height: 1600,
      },
      {
        src: "/involvement/marching-100-02.jpg",
        alt: "Close-up of Kameron playing sousaphone in the orange Florida A&M uniform",
        width: 1290,
        height: 1476,
      },
      {
        src: "/involvement/marching-100-03.jpg",
        alt: "Kameron marching onto the field in the green FAMU uniform, sousaphone on his shoulder",
        width: 1290,
        height: 1566,
      },
      {
        src: "/involvement/marching-100-04.jpg",
        alt: "Kameron in the orange-and-green Marching 100 uniform with his sousaphone during a night performance",
        width: 1290,
        height: 1587,
      },
      {
        src: "/involvement/marching-100-05.jpg",
        alt: "Kameron walking the field in black warm-ups with his sousaphone before a game",
        width: 1165,
        height: 1600,
      },
    ],
    visual: "photo",
  },
];

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
    line: "Researched an offline p5.js reference release; spoke at PyTorch Santa Cruz.",
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
