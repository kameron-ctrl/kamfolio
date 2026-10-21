/** Contact details for the rocket CTA (docs/specs/CONTENT.md → Contact). Public on the site. */

export const CONTACT_EMAIL = "kameron1.benjamin@famu.edu";
export const MAIL_SUBJECT = "Let's work together";

export function mailtoHref(): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(MAIL_SUBJECT)}`;
}

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
