# Listening — Spec

A two-column section placed after the Journey timeline and before Resume. It shows what Kameron is playing on Apple Music right now, or played most recently, plus the five tracks before that. It replaces the `music-profile.rayriffy.com` SVG card from the old GitHub Pages site; that service has been down since 2026 (every path returns 404). Tokens and type follow `docs/specs/project-cards/SPEC.md`.

## Data

- Source: Last.fm `user.getrecenttracks`, read directly from the browser (`ws.audioscrobbler.com` sends CORS headers). Apple Music doesn't scrobble on its own, so a scrobbler app on the iPhone/Mac sends plays to Last.fm. The Apple Music API was ruled out: it needs a paid developer membership and a server to hold the user token, and its recent-tracks endpoint has neither timestamps nor a live "now playing".
- Config, at build time: `NEXT_PUBLIC_LASTFM_USER` and `NEXT_PUBLIC_LASTFM_API_KEY`, set as GitHub repo variables. The key is a read-only Last.fm API key, which Last.fm expects to sit in client code.
- Fetching: the first fetch happens when the section comes within 200px of the viewport. After that it re-fetches every 30s while the section is on screen and the tab is visible.
- No config: in production the section isn't rendered at all; in `next dev` it shows fixture tracks so the layout can be worked on.
- If a refresh fails after data has loaded, the last good list stays on screen. If the first fetch fails, the section shows the offline line.

## Layout (desktop, 1440×900)

Same grid as Resume: `minmax(0,1fr) minmax(0,1.1fr)` columns with a 6vw gap, 16vh top/bottom padding, 8vw sides, items centered.

**Left column**
1. `SectionHeading` with kicker `OFF THE CLOCK` and title `On rotation`
2. Line, 24px below: Geist Sans 16/18px, `--color-text-body`, max 38ch
3. Record, 48px below: a 260px square sleeve (album art, radius 4px, hairline border, the Resume sheet's shadow + moon glow). Behind it sits a vinyl disc of the same size, offset `translateX(42%)`, which slides to 50% on hover. The disc is drawn as `repeating-radial-gradient` grooves on `#0d0d0f` with a hairline rim, and its center label is the artwork at 36% of the disc's size. The disc spins once per 4s, but only while a track is live.
4. Status, 28px below the record: mono 11px. When live it reads `NOW PLAYING` in `--color-nebula-teal`, with three equalizer bars (3×12px, `scaleY` 0.3↔1, 0.9s, staggered 150ms). Otherwise it reads `LAST PLAYED · 2H AGO` in `--color-text-muted`.
5. Title in Geist Sans 600, 28px/1.15, `--color-silver`, clamped to 2 lines. Artist · album below it in 16px `--color-text-body`, 1 line, ellipsis.

**Right column**: mono label `RECENTLY PLAYED`, then an ordered list of 5 rows:
- Each row: 52px art (radius 3px), title (Sans 500 16px silver, 1 line), artist (14px body, 1 line), and a right-aligned mono 11px relative time (`12M AGO`, `3H AGO`, `2D AGO`, `MAR 4`).
- Rows are 12px/14px padded with 1px hairline dividers and no card chrome.
- Each row links to an Apple Music search for `title artist` in a new tab. On hover the row gets a `--color-surface` background, the art lifts 2px, and the title underline turns teal. Focus-visible gives a 2px teal outline with a 4px offset.

Missing art (Last.fm's grey star, or none at all) falls back to a tile with the nebula purple→teal gradient and the track's first letter in Michroma.

## Mobile (<768px)

Columns stack, with 16px side gutters (`px-4`) and 64px vertical padding. The record drops to 200px and the title to 22px. The list sits 56px below the status.

## Motion

- Entrance: `useStaggerReveal` with a 0.1s stagger, like Resume.
- Only `transform` and `opacity` are animated.
- Reduced motion: no spin, no equalizer bounce (the bars hold at different heights), and no hover slide.

## Acceptance checklist

- [ ] The section sits between Journey and Resume and matches the type scale above at 1440×900 and 375px
- [ ] Live track: teal `NOW PLAYING`, the disc spins, the equalizer moves; past track: muted relative time, no spin
- [ ] Missing art shows the gradient monogram tile, never a broken image
- [ ] No horizontal overflow at 320/375px; long titles clamp or ellipsize
- [ ] Reduced motion freezes the spin, equalizer and slide
- [ ] Without env vars: hidden in `next build` output, fixtures in `next dev`
- [ ] Polling stops while the tab is hidden or the section is off screen
- [ ] Typecheck, lint, tests and `next build` all pass
