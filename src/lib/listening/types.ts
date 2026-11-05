/** One play, normalized from whatever service supplies it (docs/specs/listening). */
export interface Track {
  /** Stable per play, so the same song played twice gets two keys. */
  id: string;
  title: string;
  artist: string;
  album: string;
  /** null when the service has no real cover, so the UI draws its fallback tile. */
  artworkUrl: string | null;
  /** null while the track is still playing. */
  playedAt: Date | null;
  isNowPlaying: boolean;
}

/** Where the section gets its plays; "off" hides the section. */
export type ListeningSource =
  | { kind: "lastfm"; user: string; apiKey: string; limit: number }
  | { kind: "fixture" }
  | { kind: "off" };
