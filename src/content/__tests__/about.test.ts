import { describe, it, expect } from "vitest";
import { JOURNEY, STRIKERS, TALK, ARTICLE, SLIDES } from "@/content/about";

const ALL_TEXT = JSON.stringify({ JOURNEY, STRIKERS, TALK, ARTICLE, SLIDES });

describe("about content (docs/specs/CONTENT.md)", () => {
  it("has the 6 journey nodes in chronological order", () => {
    expect(JOURNEY.map((n) => n.id)).toEqual(["famu", "outamation", "codepath", "ucsc", "now", "future"]);
  });

  it("keeps journey one-liners within 90 characters", () => {
    JOURNEY.forEach((n) => expect(n.line.length).toBeLessThanOrEqual(90));
  });

  it("has 13 slides with alt text", () => {
    expect(SLIDES).toHaveLength(13);
    SLIDES.forEach((s) => expect(s.alt.length).toBeGreaterThan(8));
  });

  it("quotes the PyTorch blog exactly", () => {
    expect(ARTICLE.quote).toBe("…he got bonus points for giving us a live demo of the application in action.");
  });

  it("names the talk date", () => {
    expect(TALK.meta).toContain("JUN 30, 2026");
  });

  it("leaves Airbets and Adobe off the site", () => {
    expect(ALL_TEXT).not.toMatch(/airbets|adobe/i);
  });

  it("never includes a phone number", () => {
    expect(ALL_TEXT).not.toMatch(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}/);
  });

  it("gives every Strikers photo alt text", () => {
    expect(STRIKERS.photos.length).toBeGreaterThan(0);
    STRIKERS.photos.forEach((p) => expect(p.alt.length).toBeGreaterThan(10));
  });
});
