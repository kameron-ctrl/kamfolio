/** Shared type treatments for the track panels (docs/specs/project-cards type scale). */

/** Mono kicker without a color, so callers can pick one. */
export const MONO = "font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em]";

export const MONO_LABEL = `${MONO} text-[var(--color-text-muted)]`;

export const SANS = "font-[family-name:var(--font-geist-sans)]";

export const TEXT_LINK =
  "text-sm text-[var(--color-silver)] underline decoration-[var(--color-hairline)] underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-[var(--color-nebula-teal)] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-nebula-teal)]";
