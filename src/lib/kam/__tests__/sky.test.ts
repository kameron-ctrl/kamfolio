import { describe, expect, test } from "vitest";
import { SKY_MAX_DAYS, altitude, buildSky, minutesInKamZone } from "../sky";
import type { KamDay } from "../types";

function day(date: string, ...times: string[]): KamDay {
  return {
    date,
    posts: times
      .map((t, i) => ({ id: `${date}-${t.replace(":", "")}-${i}`, at: `${date}T${t}:00-05:00`, text: `thought at ${t}` }))
      .reverse(),
  };
}

describe("minutesInKamZone", () => {
  test("reads the time of day in New York whatever the offset", () => {
    expect(minutesInKamZone("2026-11-18T21:40:00-05:00")).toBe(21 * 60 + 40);
    expect(minutesInKamZone("2026-11-19T02:40:00Z")).toBe(21 * 60 + 40);
  });
});

describe("altitude", () => {
  test("midnight sits highest, noon lowest, night above morning", () => {
    expect(altitude(0)).toBeLessThan(altitude(21 * 60));
    expect(altitude(21 * 60)).toBeLessThan(altitude(9 * 60));
    expect(altitude(9 * 60)).toBeLessThan(altitude(12 * 60));
    expect(altitude(0)).toBeGreaterThanOrEqual(0);
    expect(altitude(12 * 60)).toBeLessThanOrEqual(1);
  });
});

describe("buildSky", () => {
  const DAYS = [day("2026-11-19", "09:15", "21:40", "23:05"), day("2026-11-18", "12:00"), day("2026-11-17", "07:30")];

  test("one star per post, oldest day on the left, all inside the field", () => {
    const sky = buildSky(DAYS);
    expect(sky.stars).toHaveLength(5);
    const xOf = (date: string): number => sky.stars.find((s) => s.date === date)!.x;
    expect(xOf("2026-11-17")).toBeLessThan(xOf("2026-11-18"));
    expect(xOf("2026-11-18")).toBeLessThan(xOf("2026-11-19"));
    for (const star of sky.stars) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(1);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThanOrEqual(1);
      expect(star.r).toBeGreaterThan(0);
    }
  });

  test("is deterministic so server and client render the same sky", () => {
    expect(buildSky(DAYS)).toEqual(buildSky(DAYS));
  });

  test("joins each day's posts in time order into a constellation", () => {
    const { links } = buildSky(DAYS);
    expect(links.map((l) => [l.from.slice(11, 15), l.to.slice(11, 15)])).toEqual([
      ["0915", "2140"],
      ["2140", "2305"],
    ]);
    expect(links.every((l) => l.date === "2026-11-19")).toBe(true);
  });

  test("keeps only the most recent days", () => {
    const many = Array.from({ length: SKY_MAX_DAYS + 5 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 10, 30 - i)).toISOString().slice(0, 10);
      return day(d, "10:00");
    });
    const dates = new Set(buildSky(many).stars.map((s) => s.date));
    expect(dates.size).toBe(SKY_MAX_DAYS);
    expect(dates.has(many[0].date)).toBe(true);
    expect(dates.has(many[many.length - 1].date)).toBe(false);
  });

  test("an empty feed is an empty sky", () => {
    expect(buildSky([])).toEqual({ stars: [], links: [] });
  });
});
