/**
 * Validates one kam.md day file. Bad data fails the build (and CI) with the
 * file named, so a broken agent commit never deploys a half-rendered feed.
 */
import type { KamDay, KamPost } from "./types";

export const MAX_POST_LENGTH = 1000;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Requires an explicit offset (Z or ±hh:mm) so times render the same everywhere
const TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

export class KamParseError extends Error {
  constructor(source: string, problem: string) {
    super(`kam.md ${source}: ${problem}`);
    this.name = "KamParseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parsePost(raw: unknown, index: number, source: string): KamPost {
  const fail = (problem: string): never => {
    throw new KamParseError(source, `post ${index}: ${problem}`);
  };
  if (!isRecord(raw)) return fail("must be an object");
  const { id, at, text } = raw;
  if (!nonEmptyString(id)) return fail("needs a non-empty id");
  if (typeof at !== "string" || !TIMESTAMP_RE.test(at) || Number.isNaN(Date.parse(at))) {
    return fail(`"at" must be an ISO timestamp with an offset, got ${JSON.stringify(at)}`);
  }
  if (!nonEmptyString(text)) return fail("needs text");
  if (text.length > MAX_POST_LENGTH) return fail(`text is over ${MAX_POST_LENGTH} characters`);
  return { id, at, text };
}

export function parseKamDay(raw: unknown, source: string): KamDay {
  if (!isRecord(raw)) throw new KamParseError(source, "must be a JSON object");
  const { date, posts } = raw;
  if (typeof date !== "string" || !DATE_RE.test(date)) {
    throw new KamParseError(source, `"date" must be YYYY-MM-DD, got ${JSON.stringify(date)}`);
  }
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new KamParseError(source, `"posts" must be a non-empty array`);
  }

  const parsed = posts.map((post, i) => parsePost(post, i, source));
  const ids = new Set(parsed.map((p) => p.id));
  if (ids.size !== parsed.length) throw new KamParseError(source, "post ids must be unique");

  const newestFirst = [...parsed].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return { date, posts: newestFirst };
}
