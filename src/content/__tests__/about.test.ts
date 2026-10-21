import { describe, it, expect } from "vitest";
import { ABOUT, JOURNEY, ORGANIZATIONS, SKILLS, TALK, ARTICLE, SLIDES } from "@/content/about";

const ALL_TEXT = JSON.stringify({ ABOUT, JOURNEY, ORGANIZATIONS, SKILLS, TALK, ARTICLE, SLIDES });

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

  it("gives every organization photo alt text and real dimensions", () => {
    ORGANIZATIONS.flatMap((o) => o.photos).forEach((p) => {
      expect(p.alt.length).toBeGreaterThan(10);
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
    });
  });

  it("uses Kameron's About text verbatim", () => {
    expect(ABOUT.lead).toBe(
      "I'm Kameron, a computer science student at Florida A&M University (Class of 2027) who likes to build things that help people grow, whether that's software, gardens, or communities."
    );
    expect(ABOUT.body).toBe(
      "Right now, I'm contributing through the UCSC Open Source Contributor Catalyst Program and exploring work at the intersection of AI, full-stack development, and 3D visuals. When I'm away from the keyboard, you can usually find me dancing, playing sousaphone, tending my plants, homelabbing, or chasing down my next idea over a cup of tea."
    );
  });

  it("groups skills into the four spec groups, each listed once", () => {
    expect(SKILLS.map((g) => g.group)).toEqual(["Languages", "Frontend & 3D", "Backend & Cloud", "AI & ML"]);
    const all = SKILLS.flatMap((g) => g.items);
    SKILLS.forEach((g) => expect(g.items.length).toBeGreaterThan(0));
    expect(new Set(all).size).toBe(all.length);
  });

  it("features Strikers, Kappa Kappa Psi and the Marching 100, in that order", () => {
    expect(ORGANIZATIONS.map((o) => o.id)).toEqual(["strikers", "kkpsi", "marching-100"]);
    ORGANIZATIONS.forEach((o) => expect(o.line.length).toBeGreaterThan(10));
  });

  it("keeps the dancer formation for Strikers only", () => {
    expect(ORGANIZATIONS.filter((o) => o.visual === "formation").map((o) => o.id)).toEqual(["strikers"]);
    expect(ORGANIZATIONS.find((o) => o.id === "strikers")?.photos).toHaveLength(4);
  });

  it("doesn't call Kameron a mentor at UCSC", () => {
    const ucsc = JOURNEY.find((n) => n.id === "ucsc");
    expect(ucsc?.line).not.toMatch(/mentor/i);
  });
});
