/**
 * Last.fm `user.getrecenttracks`, read straight from the browser. Apple Music plays
 * reach Last.fm through a scrobbler app (docs/specs/listening → Data).
 */
import type { Track } from "./types";

const API_ROOT = "https://ws.audioscrobbler.com/2.0/";

/** Last.fm's grey star, served when a track has no cover. */
const PLACEHOLDER_ART_HASH = "2a96cbd8b46e442fc41c2b86b821562f";

interface RecentTracksQuery {
  user: string;
  apiKey: string;
  limit: number;
}

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord => typeof value === "object" && value !== null;

/** Last.fm wraps most strings as `{ "#text": "..." }`. */
const text = (value: unknown): string => (isRecord(value) && typeof value["#text"] === "string" ? value["#text"] : "");

export function buildRecentTracksUrl({ user, apiKey, limit }: RecentTracksQuery): string {
  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user,
    api_key: apiKey,
    format: "json",
    limit: String(limit),
  });
  return `${API_ROOT}?${params}`;
}

function pickArtwork(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  const largest = images.filter(isRecord).at(-1);
  const url = text(largest);
  return url && !url.includes(PLACEHOLDER_ART_HASH) ? url : null;
}

function toTrack(raw: unknown): Track | null {
  if (!isRecord(raw) || typeof raw.name !== "string") return null;
  const artist = text(raw.artist);
  if (!raw.name || !artist) return null;

  const isNowPlaying = isRecord(raw["@attr"]) && raw["@attr"].nowplaying === "true";
  const uts = isRecord(raw.date) ? Number(raw.date.uts) : NaN;
  const playedAt = !isNowPlaying && Number.isFinite(uts) ? new Date(uts * 1000) : null;

  return {
    id: `${raw.name}::${artist}::${isNowPlaying ? "now" : uts}`,
    title: raw.name,
    artist,
    album: text(raw.album),
    artworkUrl: pickArtwork(raw.image),
    playedAt,
    isNowPlaying,
  };
}

/** Validates a recent-tracks payload. Bad entries are dropped; a bad payload throws. */
export function parseRecentTracks(payload: unknown): Track[] {
  if (!isRecord(payload)) throw new Error("Last.fm returned a non-JSON-object response");
  if ("error" in payload) {
    throw new Error(`Last.fm error ${String(payload.error)}: ${String(payload.message ?? "unknown")}`);
  }
  if (!isRecord(payload.recenttracks)) throw new Error("Last.fm response is missing recenttracks");

  const raw = payload.recenttracks.track;
  const list: unknown[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list.map(toTrack).filter((track): track is Track => track !== null);
}

export async function fetchRecentTracks(query: RecentTracksQuery, signal?: AbortSignal): Promise<Track[]> {
  const res = await fetch(buildRecentTracksUrl(query), { signal, cache: "no-store" });
  // Last.fm puts its error codes in the JSON body even on 4xx, so parse before checking status
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok && !(isRecord(body) && "error" in body)) {
    throw new Error(`Last.fm request failed with HTTP ${res.status}`);
  }
  // A live track comes back on top of `limit` played ones
  return parseRecentTracks(body).slice(0, query.limit);
}
