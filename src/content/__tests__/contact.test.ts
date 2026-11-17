import { describe, it, expect } from "vitest";
import {
  CONTACT_EMAIL,
  CONTACT_LINKS,
  GITHUB_URL,
  LINKEDIN_URL,
  MAIL_SUBJECT,
  mailtoHref,
  copyEmail,
} from "@/content/contact";
import { RESUME } from "@/content/resume";

describe("contact", () => {
  it("uses Kameron's FAMU address", () => {
    expect(CONTACT_EMAIL).toBe("kameron1.benjamin@famu.edu");
  });

  it("builds a mailto link with an encoded subject", () => {
    expect(mailtoHref()).toBe(`mailto:kameron1.benjamin@famu.edu?subject=${encodeURIComponent(MAIL_SUBJECT)}`);
    expect(mailtoHref()).not.toContain(" ");
  });

  it("reports success when the clipboard write resolves", async () => {
    const written: string[] = [];
    const result = await copyEmail({ writeText: async (t: string) => void written.push(t) });
    expect(result).toBe("copied");
    expect(written).toEqual([CONTACT_EMAIL]);
  });

  it("reports failure when the clipboard write rejects", async () => {
    const result = await copyEmail({ writeText: async () => Promise.reject(new Error("denied")) });
    expect(result).toBe("failed");
  });

  it("reports failure when there is no clipboard API", async () => {
    expect(await copyEmail(undefined)).toBe("failed");
  });
});

describe("profile links", () => {
  it("points at Kameron's GitHub and LinkedIn profiles", () => {
    expect(GITHUB_URL).toBe("https://github.com/kameron-ctrl");
    expect(LINKEDIN_URL).toBe("https://www.linkedin.com/in/kameronbenjamin/");
  });

  it("lists resume, GitHub, LinkedIn and email in that order", () => {
    expect(CONTACT_LINKS.map((l) => l.id)).toEqual(["resume", "github", "linkedin", "email"]);
  });

  it("links the resume to the hosted PDF and email to the mailto", () => {
    const byId = Object.fromEntries(CONTACT_LINKS.map((l) => [l.id, l]));
    expect(byId.resume.href).toBe(RESUME.pdf);
    expect(byId.email.href).toBe(mailtoHref());
  });

  it("opens everything except email in a new tab", () => {
    const external = CONTACT_LINKS.filter((l) => l.newTab).map((l) => l.id);
    expect(external).toEqual(["resume", "github", "linkedin"]);
  });

  it("uses only https or mailto links (or the same-origin PDF)", () => {
    for (const link of CONTACT_LINKS) {
      expect(link.href).toMatch(/^(https:\/\/|mailto:|\/resume\/)/);
    }
  });
});
