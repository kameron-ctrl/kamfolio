import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { loadKamDays } from "../load";

let dir: string;

function writeDay(name: string, body: unknown): void {
  fs.writeFileSync(path.join(dir, name), typeof body === "string" ? body : JSON.stringify(body));
}

function day(date: string): unknown {
  return { date, posts: [{ id: `${date}-1`, at: `${date}T12:00:00-05:00`, text: `post on ${date}` }] };
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "kam-days-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("loadKamDays", () => {
  test("returns nothing when the folder is missing", () => {
    expect(loadKamDays(path.join(dir, "nope"))).toEqual([]);
  });

  test("loads every day file, newest day first, ignoring non-json files", () => {
    writeDay("2026-11-16.json", day("2026-11-16"));
    writeDay("2026-11-18.json", day("2026-11-18"));
    writeDay("2026-11-17.json", day("2026-11-17"));
    writeDay("README.md", "# not a day");
    expect(loadKamDays(dir).map((d) => d.date)).toEqual(["2026-11-18", "2026-11-17", "2026-11-16"]);
  });

  test("fails the build on a file whose date doesn't match its name", () => {
    writeDay("2026-11-18.json", day("2026-11-17"));
    expect(() => loadKamDays(dir)).toThrow(/2026-11-18\.json/);
  });

  test("fails the build on invalid JSON, naming the file", () => {
    writeDay("2026-11-18.json", "{ nope");
    expect(() => loadKamDays(dir)).toThrow(/2026-11-18\.json.*JSON/);
  });
});
