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
      },
      animation: {
        skeleton: "skeleton 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
