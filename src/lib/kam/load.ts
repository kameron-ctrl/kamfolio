/**
 * Build-time loader for kam.md days. Server-only (reads the filesystem while
 * `next build` statically exports the page).
 */
import fs from "node:fs";
import path from "node:path";
import { KamParseError, parseKamDay } from "./parse";
import type { KamDay } from "./types";

/** Overridable with KAM_DAYS_DIR for local previews with sample days. */
export const KAM_DAYS_DIR = process.env.KAM_DAYS_DIR ?? path.join(process.cwd(), "src/content/kam/days");

function readDay(dir: string, file: string): KamDay {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  } catch (error) {
    throw new KamParseError(file, `invalid JSON (${(error as Error).message})`);
  }
  const day = parseKamDay(raw, file);
  if (`${day.date}.json` !== file) {
    throw new KamParseError(file, `date "${day.date}" doesn't match the file name`);
  }
  return day;
}

/** Every public day, newest first. */
export function loadKamDays(dir: string = KAM_DAYS_DIR): KamDay[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));
  return files.map((file) => readDay(dir, file)).sort((a, b) => b.date.localeCompare(a.date));
}
