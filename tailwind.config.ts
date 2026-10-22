import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Journey active node ring (docs/specs/personality-timeline): scale 1→1.8, opacity 0.6→0
        "orbit-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        "orbit-pulse": "orbit-pulse 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
