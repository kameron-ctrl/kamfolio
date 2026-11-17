/**
 * Contact details for the rocket CTA and the top-right contact bar
 * (docs/specs/CONTENT.md → Contact). Public on the site.
 */
import { RESUME } from "@/content/resume";

export const CONTACT_EMAIL = "kameron1.benjamin@famu.edu";
export const MAIL_SUBJECT = "Let's work together";

export const GITHUB_URL = "https://github.com/kameron-ctrl";
export const LINKEDIN_URL = "https://www.linkedin.com/in/kameronbenjamin/";

export function mailtoHref(): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}`;
}

export type ContactLinkId = "resume" | "github" | "linkedin" | "email";

export interface ContactLink {
  id: ContactLinkId;
  label: string;
  href: string;
  newTab: boolean;
}

/** The links the contact bar shows, in display order. */
export const CONTACT_LINKS: readonly ContactLink[] = [
  { id: "resume", label: "Resume", href: RESUME.pdf, newTab: true },
  { id: "github", label: "GitHub", href: GITHUB_URL, newTab: true },
  { id: "linkedin", label: "LinkedIn", href: LINKEDIN_URL, newTab: true },
  { id: "email", label: "Email", href: mailtoHref(), newTab: false },
];

export type CopyResult = "copied" | "failed";

/** Copies the email; "failed" covers a missing API as well as a denied write. */
export async function copyEmail(clipboard: Pick<Clipboard, "writeText"> | undefined): Promise<CopyResult> {
  if (!clipboard) return "failed";
  try {
    await clipboard.writeText(CONTACT_EMAIL);
    return "copied";
  } catch {
    return "failed";
  }
}
