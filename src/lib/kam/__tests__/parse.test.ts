import { describe, expect, test } from "vitest";
import { KamParseError, MAX_POST_LENGTH, parseKamDay } from "../parse";

const VALID = {
  date: "2026-11-18",
  posts: [
    { id: "a", at: "2026-11-18T09:15:00-05:00", text: "morning thought" },
    { id: "b", at: "2026-11-18T21:40:00-05:00", text: "night thought" },
  ],
};

describe("parseKamDay", () => {
  test("returns the day with posts newest first", () => {
    const day = parseKamDay(VALID, "2026-11-18.json");
    expect(day.date).toBe("2026-11-18");
    expect(day.posts.map((p) => p.id)).toEqual(["b", "a"]);
  });

  test("does not mutate the input", () => {
    const input = structuredClone(VALID);
    parseKamDay(input, "x.json");
    expect(input).toEqual(VALID);
  });

  test.each([
    ["a non-object", "nope"],
    ["a bad date", { ...VALID, date: "Nov 18" }],
    ["no posts", { ...VALID, posts: [] }],
    ["posts not an array", { ...VALID, posts: {} }],
    ["a post without text", { ...VALID, posts: [{ id: "a", at: VALID.posts[0].at, text: "  " }] }],
    ["a post without id", { ...VALID, posts: [{ id: "", at: VALID.posts[0].at, text: "hi" }] }],
    ["an unparseable timestamp", { ...VALID, posts: [{ id: "a", at: "yesterday", text: "hi" }] }],
    ["a timestamp with no offset", { ...VALID, posts: [{ id: "a", at: "2026-11-18T09:15:00", text: "hi" }] }],
    ["duplicate post ids", { ...VALID, posts: [VALID.posts[0], { ...VALID.posts[1], id: "a" }] }],
    ["an over-long post", { ...VALID, posts: [{ id: "a", at: VALID.posts[0].at, text: "x".repeat(MAX_POST_LENGTH + 1) }] }],
  ])("rejects %s, naming the file", (_label, raw) => {
    expect(() => parseKamDay(raw, "bad.json")).toThrow(KamParseError);
    expect(() => parseKamDay(raw, "bad.json")).toThrow(/bad\.json/);
  });
});
