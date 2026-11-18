/** Display helpers for kam.md. Pure, so server and client render the same text. */
import type { KamDay } from "./types";

/** Every visitor sees post times in Eastern time, the zone they were written in. */
export const KAM_TIME_ZONE = "America/New_York";

/** Minimum leftward drag (px) that counts as "go to the side page". */
export const SIDE_SWIPE_MIN_PX = 48;
/** Horizontal movement must beat vertical by this factor. */
const SIDE_SWIPE_DOMINANCE = 1.5;

const DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: KAM_TIME_ZONE,
});

/** "2026-11-18" → "Wed · Nov 18, 2026" */
export function formatDayLabel(date: string): string {
  const parts = DAY_FORMAT.formatToParts(new Date(`${date}T12:00:00Z`));
  const get = (type: Intl.DateTimeFormatPartTypes): string => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} · ${get("month")} ${get("day")}, ${get("year")}`;
}

/** ISO timestamp → "9:40 PM" in Eastern time. */
export function formatPostTime(at: string): string {
  return TIME_FORMAT.format(new Date(at)).replace(/ /g, " ");
}

export type TextSegment = { kind: "text"; value: string } | { kind: "link"; value: string; href: string };

const URL_RE = /https?:\/\/[^\s<>"]+/g;
const TRAILING_PUNCTUATION_RE = /[.,!?;:)\]'"]+$/;

/** Splits post text into plain text and http(s) links. No other scheme is ever linked. */
export function linkify(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const match of Array.from(text.matchAll(URL_RE))) {
    const start = match.index ?? 0;
    const url = match[0].replace(TRAILING_PUNCTUATION_RE, "");
    if (start > cursor) segments.push({ kind: "text", value: text.slice(cursor, start) });
    segments.push({ kind: "link", value: url, href: url });
    cursor = start + url.length;
  }
  if (cursor < text.length) segments.push({ kind: "text", value: text.slice(cursor) });
  return segments;
}

/** Cuts on a word boundary and adds an ellipsis. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function countPosts(days: readonly KamDay[]): number {
  return days.reduce((sum, day) => sum + day.posts.length, 0);
}

/** True for a deliberate leftward swipe/scroll (content moves left → the side page comes in). */
export function isSideSwipe(dx: number, dy: number): boolean {
  return dx <= -SIDE_SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * SIDE_SWIPE_DOMINANCE;
}

export function thoughtsLabel(count: number): string {
  return `${count} ${count === 1 ? "thought" : "thoughts"}`;
}
