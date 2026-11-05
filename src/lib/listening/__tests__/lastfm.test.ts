import { describe, test, expect } from "vitest";
import { buildRecentTracksUrl, parseRecentTracks } from "../lastfm";

const art = (hash: string) => [
  { size: "small", "#text": `https://lastfm.freetls.fastly.net/i/u/34s/${hash}.jpg` },
  { size: "extralarge", "#text": `https://lastfm.freetls.fastly.net/i/u/300x300/${hash}.jpg` },
];

const nowPlaying = {
  name: "Pink + White",
  artist: { "#text": "Frank Ocean" },
  album: { "#text": "Blonde" },
  image: art("abc"),
  "@attr": { nowplaying: "true" },
};

const played = {
  name: "Nights",
  artist: { "#text": "Frank Ocean" },
  album: { "#text": "Blonde" },
  image: art("2a96cbd8b46e442fc41c2b86b821562f"),
  date: { uts: "1762300800", "#text": "05 Nov 2025, 00:00" },
};

describe("parseRecentTracks", () => {
  test("maps a now-playing track and a played track", () => {
    const tracks = parseRecentTracks({ recenttracks: { track: [nowPlaying, played] } });

    expect(tracks).toHaveLength(2);
    expect(tracks[0]).toMatchObject({
      title: "Pink + White",
      artist: "Frank Ocean",
      album: "Blonde",
      artworkUrl: "https://lastfm.freetls.fastly.net/i/u/300x300/abc.jpg",
      playedAt: null,
      isNowPlaying: true,
    });
    expect(tracks[1].isNowPlaying).toBe(false);
    expect(tracks[1].playedAt).toEqual(new Date(1762300800 * 1000));
  });

  test("treats Last.fm's grey star placeholder as no artwork", () => {
    const [track] = parseRecentTracks({ recenttracks: { track: [played] } });
    expect(track.artworkUrl).toBeNull();
  });

  test("accepts a single track object instead of an array", () => {
    expect(parseRecentTracks({ recenttracks: { track: played } })).toHaveLength(1);
  });

  test("returns an empty list when the user has no scrobbles", () => {
    expect(parseRecentTracks({ recenttracks: { track: [] } })).toEqual([]);
  });

  test("skips malformed entries instead of failing the whole list", () => {
    const tracks = parseRecentTracks({ recenttracks: { track: [{ name: 42 }, played] } });
    expect(tracks.map((t) => t.title)).toEqual(["Nights"]);
  });

  test("gives repeated plays of the same song distinct ids", () => {
    const again = { ...played, date: { uts: "1762297200" } };
    const ids = parseRecentTracks({ recenttracks: { track: [played, again] } }).map((t) => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  test("throws Last.fm's own error message", () => {
    expect(() => parseRecentTracks({ error: 6, message: "User not found" })).toThrow("User not found");
  });

  test("throws on a payload that isn't a recent-tracks response", () => {
    expect(() => parseRecentTracks("nope")).toThrow();
    expect(() => parseRecentTracks({ something: "else" })).toThrow();
  });
});

describe("buildRecentTracksUrl", () => {
  test("encodes the user and asks for JSON", () => {
    const url = new URL(buildRecentTracksUrl({ user: "kam ben", apiKey: "k", limit: 6 }));
    expect(url.origin).toBe("https://ws.audioscrobbler.com");
    expect(url.searchParams.get("method")).toBe("user.getrecenttracks");
    expect(url.searchParams.get("user")).toBe("kam ben");
    expect(url.searchParams.get("format")).toBe("json");
    expect(url.searchParams.get("limit")).toBe("6");
  });
});
