/** Stand-in plays for `next dev` (or NEXT_PUBLIC_LISTENING_DEMO=1) when Last.fm isn't configured. */
import type { Track } from "./types";

const MINUTE_MS = 60_000;

const PLAYS: ReadonlyArray<Omit<Track, "id" | "playedAt" | "isNowPlaying"> & { minutesAgo: number | null }> = [
  { title: "Pink + White", artist: "Frank Ocean", album: "Blonde", artworkUrl: null, minutesAgo: null },
  { title: "Redbone", artist: "Childish Gambino", album: "\"Awaken, My Love!\"", artworkUrl: null, minutesAgo: 4 },
  { title: "Saturn", artist: "SZA", album: "Lana", artworkUrl: null, minutesAgo: 38 },
  { title: "Self Control", artist: "Frank Ocean", album: "Blonde", artworkUrl: null, minutesAgo: 190 },
  { title: "Electric Relaxation", artist: "A Tribe Called Quest", album: "Midnight Marauders", artworkUrl: null, minutesAgo: 1500 },
  { title: "Come Down", artist: "Anderson .Paak", album: "Malibu", artworkUrl: null, minutesAgo: 13000 },
];

export function fixtureTracks(now: Date = new Date()): Track[] {
  return PLAYS.map(({ minutesAgo, ...play }) => ({
    ...play,
    id: `fixture::${play.title}`,
    isNowPlaying: minutesAgo === null,
    playedAt: minutesAgo === null ? null : new Date(now.getTime() - minutesAgo * MINUTE_MS),
  }));
}
