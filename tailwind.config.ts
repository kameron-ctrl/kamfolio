import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Placeholder card skeleton (docs/specs/project-cards): opacity 0.04 ↔ 0.08 over 1.6s
      keyframes: {
        skeleton: {
          "0%, 100%": { opacity: "0.04" },
          "50%": { opacity: "0.08" },
        },
        // Journey active node ring (docs/specs/personality-timeline): scale 1→1.8, opacity 0.6→0
        "orbit-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        skeleton: "skeleton 1.6s ease-in-out infinite",
        "orbit-pulse": "orbit-pulse 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
