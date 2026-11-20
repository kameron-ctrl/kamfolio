/**
 * kam.md night sky: lays posts out as stars in the empty space beside the panel.
 * Pure and deterministic (no Math.random), so the static export and the client agree.
 *
 * x: one column per day, oldest on the left, newest next to the panel.
 * y: time of day in New York. Midnight is the top of the sky, noon the bottom,
 *    so late-night thoughts rise and morning ones sit low.
 */
import { KAM_TIME_ZONE } from "./format";
import type { KamDay } from "./types";

/** Days shown at once; older ones are still in the feed. */
export const SKY_MAX_DAYS = 21;
/** Below this many stars the sky looks empty, so a single pull quote is shown instead. */
export const SKY_MIN_STARS = 8;

const Y_TOP = 0.04;
const Y_SPAN = 0.92;
const X_JITTER = 0.9; // share of a column a star may wander from its center
const Y_JITTER = 0.025;
const R_MIN = 1.8;
const R_GROWTH = 2.2;
const R_FULL_AT_CHARS = 280;
const MINUTES_PER_DAY = 24 * 60;

export interface SkyStar {
  readonly id: string;
  readonly date: string;
  readonly at: string;
  readonly text: string;
  /** 0–1 across the field, left to right. */
  readonly x: number;
  /** 0–1 down the field. */
  readonly y: number;
  /** Radius in px; longer thoughts burn brighter. */
  readonly r: number;
}

export interface SkyLink {
  readonly date: string;
  readonly from: string;
  readonly to: string;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface Sky {
  readonly stars: readonly SkyStar[];
  readonly links: readonly SkyLink[];
}

const CLOCK = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
  timeZone: KAM_TIME_ZONE,
});

/** Minutes since midnight in Eastern time. */
export function minutesInKamZone(at: string): number {
  const parts = CLOCK.formatToParts(new Date(at));
  const get = (type: Intl.DateTimeFormatPartTypes): number => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return (get("hour") % 24) * 60 + get("minute");
}

/** 0 (top) at midnight → 1 (bottom) at noon, symmetric around midnight. */
export function altitude(minutes: number): number {
  const fromMidnight = Math.min(minutes, MINUTES_PER_DAY - minutes);
  return Y_TOP + Y_SPAN * (fromMidnight / (MINUTES_PER_DAY / 2));
}

/** FNV-1a, scaled to [0, 1). Stable per id, so a star never jumps between builds. */
function unit(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x100000000;
}

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

export function buildSky(days: readonly KamDay[]): Sky {
  const columns = days.slice(0, SKY_MAX_DAYS).reverse(); // oldest first
  const width = 1 / Math.max(columns.length, 1);
  const stars: SkyStar[] = [];
  const links: SkyLink[] = [];

  columns.forEach((day, column) => {
    const inOrder = [...day.posts].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
    const placed = inOrder.map((post): SkyStar => ({
      id: post.id,
      date: day.date,
      at: post.at,
      text: post.text,
      x: clamp((column + 0.5) * width + (unit(`x:${post.id}`) - 0.5) * width * X_JITTER),
      y: clamp(altitude(minutesInKamZone(post.at)) + (unit(`y:${post.id}`) - 0.5) * 2 * Y_JITTER),
      r: R_MIN + R_GROWTH * Math.min(post.text.length, R_FULL_AT_CHARS) / R_FULL_AT_CHARS,
    }));
    stars.push(...placed);
    for (let i = 1; i < placed.length; i++) {
      const a = placed[i - 1];
      const b = placed[i];
      links.push({ date: day.date, from: a.id, to: b.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
  });

  return { stars, links };
}
