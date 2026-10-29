import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { RESUME } from "@/content/resume";

const publicPath = (src: string): string => join(process.cwd(), "public", src);

describe("resume", () => {
  it("points at a PDF that ships in public/", () => {
    expect(RESUME.pdf.endsWith(".pdf")).toBe(true);
    expect(existsSync(publicPath(RESUME.pdf))).toBe(true);
  });

  it("points at a rendered page image that ships in public/", () => {
    expect(existsSync(publicPath(RESUME.page.src))).toBe(true);
    expect(RESUME.page.width).toBeGreaterThan(0);
    expect(RESUME.page.height).toBeGreaterThan(RESUME.page.width);
  });

  it("describes the page for screen readers", () => {
    expect(RESUME.page.alt.length).toBeGreaterThan(20);
  });
});
