import { describe, it, expect } from "vitest";
import { CONTACT_EMAIL, MAIL_SUBJECT, mailtoHref, copyEmail } from "@/content/contact";

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
