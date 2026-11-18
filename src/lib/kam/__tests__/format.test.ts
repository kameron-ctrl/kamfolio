import { describe, expect, test } from "vitest";
import { countPosts, formatDayLabel, formatPostTime, isSideSwipe, linkify, truncate } from "../format";

describe("formatDayLabel", () => {
  test("reads like a feed divider", () => {
    expect(formatDayLabel("2026-11-18")).toBe("Wed · Nov 18, 2026");
  });
});

describe("formatPostTime", () => {
  test("shows Eastern time regardless of the offset it was stored with", () => {
    expect(formatPostTime("2026-11-18T14:04:00Z")).toBe("9:04 AM");
    expect(formatPostTime("2026-11-18T21:40:00-05:00")).toBe("9:40 PM");
  });
});

describe("linkify", () => {
  test("splits http(s) links out of plain text", () => {
    expect(linkify("see https://kameron-ctrl.com now")).toEqual([
      { kind: "text", value: "see " },
      { kind: "link", value: "https://kameron-ctrl.com", href: "https://kameron-ctrl.com" },
      { kind: "text", value: " now" },
    ]);
  });

  test("leaves trailing punctuation out of the link", () => {
    const parts = linkify("built this (https://github.com/kameron-ctrl).");
    expect(parts[1]).toEqual({ kind: "link", value: "https://github.com/kameron-ctrl", href: "https://github.com/kameron-ctrl" });
    expect(parts[2]).toEqual({ kind: "text", value: ")." });
  });

  test("never links other schemes", () => {
    expect(linkify("javascript:alert(1)")).toEqual([{ kind: "text", value: "javascript:alert(1)" }]);
  });

  test("returns one text part when there are no links", () => {
    expect(linkify("just vibes")).toEqual([{ kind: "text", value: "just vibes" }]);
  });
});

describe("truncate", () => {
  test("keeps short text and cuts long text on a word", () => {
    expect(truncate("short", 20)).toBe("short");
    expect(truncate("one two three four", 12)).toBe("one two…");
  });
});

describe("countPosts", () => {
  test("adds up posts across days", () => {
    const post = { id: "x", at: "2026-11-18T12:00:00Z", text: "x" };
    expect(countPosts([{ date: "2026-11-18", posts: [post, post] }, { date: "2026-11-17", posts: [post] }])).toBe(3);
  });
});

describe("isSideSwipe", () => {
  test("counts a mostly-horizontal leftward drag past the threshold", () => {
    expect(isSideSwipe(-80, 10)).toBe(true);
  });

  test("ignores vertical scrolls, short drags and rightward drags", () => {
    expect(isSideSwipe(-80, 90)).toBe(false);
    expect(isSideSwipe(-20, 0)).toBe(false);
    expect(isSideSwipe(80, 0)).toBe(false);
  });
});
