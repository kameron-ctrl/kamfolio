# kam.md

A Twitter-style feed of Kameron's thoughts through the day, on a side page
that is off the main scroll path.

## Experience

- **Doorway (mid-page, after the conference section).** "What's Kam thinking?",
  a preview of the latest post, and a "Check out kam.md →" button. Teal chevrons
  march toward a glowing seam on the right edge, where the side page comes in.
- **Opening.** Click the button, swipe left on the teaser (touch), or scroll
  sideways on a trackpad. The panel slides in from the right over a dimmed
  site. The page behind stops scrolling.
- **Panel.** Sticky top bar (back arrow, "kam.md", thought count), a profile
  header (moon avatar, name, @kam.md, bio), then the feed: sticky day dividers,
  newest day first, newest post first within a day. Links are teal and open in
  a new tab.
- **Closing.** The back arrow, Escape, a click on the dimmed site, or the
  browser Back button.
- **Link.** `kameron-ctrl.com/#kam.md` opens the panel straight away. A clean
  `/kam.md` path would need a CloudFront Function rewrite (not done yet).
- **Reduced motion.** No slide, pulses, or nudging arrows. It opens in place.
- **Accessibility.** `role="dialog"`, focus moves to the back button and Tab
  wraps inside the panel, focus returns on close, and the closed panel is `inert`.

## Publishing flow

```
phone ──Telegram──▶ homelab agent ──holds the day's posts (private by default)
                                   │
                    "public" for a day
                                   ▼
        commit src/content/kam/days/YYYY-MM-DD.json to main ──▶ CI build ──▶ S3/CloudFront
```

- **Public days are the only thing in this repo.** The repo is public, so
  private days and drafts stay on the homelab. If a day is later made private,
  the agent deletes its file, but the git history still has it.
- **Every commit redeploys.** Batch posts (for example, one commit per publish
  action, not per message) to keep deploys and CloudFront invalidations down.

## Data contract (what the agent writes)

One file per public day: `src/content/kam/days/YYYY-MM-DD.json`

```json
{
  "date": "2026-11-18",
  "posts": [
    { "id": "2026-11-18-0915", "at": "2026-11-18T09:15:00-05:00", "text": "coffee first, then the deploy" },
    { "id": "2026-11-18-2140", "at": "2026-11-18T21:40:00-05:00", "text": "kam.md is live\nhttps://kameron-ctrl.com/#kam.md" }
  ]
}
```

| Field   | Rule |
|---------|------|
| `date`  | `YYYY-MM-DD`; must match the file name |
| `posts` | non-empty array, any order (sorted at build) |
| `id`    | non-empty string, unique within the day |
| `at`    | ISO 8601 **with an offset** (`Z` or `±hh:mm`) |
| `text`  | plain text, 1–1000 chars; `\n` kept; only `http(s)://` URLs become links; no HTML or markdown rendering |

Any violation fails `next build` (and CI), with the file and the problem named
(`src/lib/kam/parse.ts`). A bad commit never deploys.

Times are shown in Eastern time (`America/New_York`) for every visitor.

## Code

| Piece | File |
|-------|------|
| Types, validation, build-time loader | `src/lib/kam/{types,parse,load}.ts` |
| Formatting, linkify, gestures | `src/lib/kam/format.ts` |
| Open state + `#kam.md` constant | `src/lib/kam/kam-store.ts` |
| Doorway | `src/components/kam/KamTeaser.tsx` |
| Panel, URL, focus, scroll lock | `src/components/kam/KamPanel.tsx`, `useKamPanelBehavior.ts` |
| Styles | `src/components/kam/kam.css` |

`KAM_DAYS_DIR` (env) points the loader at another folder, for local previews
with sample days.
