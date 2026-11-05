import { appleMusicSearchUrl, formatPlayedAgo } from "../format";

const NOW = new Date("2026-11-05T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms);
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatPlayedAgo", () => {
  test.each([
    [ago(20_000), "just now"],
    [ago(12 * MIN), "12m ago"],
    [ago(3 * HOUR), "3h ago"],
    [ago(2 * DAY), "2d ago"],
  ])("formats %s as %s", (playedAt, expected) => {
    expect(formatPlayedAgo(playedAt, NOW)).toBe(expected);
  });

  test("falls back to a short date after a week", () => {
    expect(formatPlayedAgo(new Date("2026-03-04T12:00:00Z"), NOW)).toBe("Mar 4");
  });

  test("never reports a future time from clock skew", () => {
    expect(formatPlayedAgo(new Date(NOW.getTime() + 5 * MIN), NOW)).toBe("just now");
  });
});

describe("appleMusicSearchUrl", () => {
  test("searches Apple Music for the title and artist", () => {
    const url = new URL(appleMusicSearchUrl({ title: "Pink + White", artist: "Frank Ocean" }));
    expect(url.hostname).toBe("music.apple.com");
    expect(url.searchParams.get("term")).toBe("Pink + White Frank Ocean");
  });
});
