/**
 * kam.md data (docs/specs/kam-md/SPEC.md). One JSON file per public day in
 * src/content/kam/days/YYYY-MM-DD.json, written by the homelab agent.
 * Private days never reach this repo.
 */
export interface KamPost {
  /** Unique within its day. */
  readonly id: string;
  /** ISO 8601 with a UTC offset, e.g. 2026-11-18T21:40:00-05:00. */
  readonly at: string;
  /** Plain text. Newlines are kept; http(s) URLs become links. */
  readonly text: string;
}

export interface KamDay {
  /** YYYY-MM-DD, matching the file name. */
  readonly date: string;
  /** Newest first once parsed. */
  readonly posts: readonly KamPost[];
}
