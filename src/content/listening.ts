/** Listening section copy and data source (docs/specs/listening). */
import type { ListeningSource } from "@/lib/listening/types";

/** The featured track plus five history rows. */
export const LISTENING_TRACK_COUNT = 6;

export const LISTENING = {
  kicker: "Off the clock",
  title: "On rotation",
  line: "What's been in my headphones lately, pulled live from my Apple Music.",
  recentLabel: "Recently played",
  nowPlaying: "Now playing",
  lastPlayed: "Last played",
  offline: "The record player's offline right now. Check back in a bit.",
  empty: "Nothing on the turntable yet.",
} as const;

function resolveSource(): ListeningSource {
  // Inlined at build time; set as GitHub repo secrets for the deploy build
  const user = process.env.NEXT_PUBLIC_LASTFM_USER ?? "";
  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY ?? "";
  if (user && apiKey) return { kind: "lastfm", user, apiKey, limit: LISTENING_TRACK_COUNT };
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_LISTENING_DEMO === "1") {
    return { kind: "fixture" };
  }
  return { kind: "off" };
}

export const LISTENING_SOURCE: ListeningSource = resolveSource();
