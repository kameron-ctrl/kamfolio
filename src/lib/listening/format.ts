import type { Track } from "./types";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/** "just now", "12m ago", "3h ago", "2d ago", then a short date ("Mar 4"). */
export function formatPlayedAgo(playedAt: Date, now: Date = new Date()): string {
  const elapsed = Math.max(0, now.getTime() - playedAt.getTime());
  if (elapsed < MINUTE_MS) return "just now";
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}h ago`;
  if (elapsed < WEEK_MS) return `${Math.floor(elapsed / DAY_MS)}d ago`;
  return playedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Last.fm has no Apple Music IDs, so rows link to a search that lands on the song. */
export function appleMusicSearchUrl({ title, artist }: Pick<Track, "title" | "artist">): string {
  const params = new URLSearchParams({ term: `${title} ${artist}` });
  return `https://music.apple.com/us/search?${params}`;
}
