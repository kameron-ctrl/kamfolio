import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
    // Use forks pool so canvas (native Node module) resolves correctly across
    // all test workers. Worker threads isolate native modules differently and
    // prevent jsdom from loading the canvas npm package (required for
    // HTMLCanvasElement.getContext("2d") in nebula-texture pixel tests).
    pool: "forks",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
