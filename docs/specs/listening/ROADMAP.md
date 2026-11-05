# Listening section — Roadmap

Spec: `docs/specs/listening/SPEC.md`. Branch: `feat/listening-section`. Tick each box as it lands.

## 1. Data layer — done
- [x] `src/lib/listening/types.ts`: `Track` and `ListeningSource`
- [x] `src/lib/listening/lastfm.ts`: URL builder, validating parser, fetch (16 tests in `__tests__/`)
- [x] `src/lib/listening/format.ts`: `formatPlayedAgo` and `appleMusicSearchUrl`
- [x] `src/lib/listening/fixture.ts`: dev fixture tracks
- [x] `src/content/listening.ts`: copy, plus `LISTENING_SOURCE` from env (`NEXT_PUBLIC_LASTFM_USER`, `NEXT_PUBLIC_LASTFM_API_KEY`, `NEXT_PUBLIC_LISTENING_DEMO`)
- [x] `src/hooks/useRecentTracks.ts`: in-view fetch, 30s poll, pauses while the tab is hidden, keeps the last good list on error

## 2. Components — done
- [x] `src/components/listening/listening.css`: vinyl grooves, sheen, equalizer keyframes, reduced-motion overrides
- [x] `src/components/listening/Artwork.tsx`: cover, or gradient monogram fallback
- [x] `NowPlaying.tsx`: sleeve + vinyl record (outer div slides with translateX on hover, inner disc spins only while live), status line with equalizer, title, artist · album; loading skeleton; offline/empty copy
- [x] `RecentList.tsx`: `<ol>` of `tracks.slice(1)`, 52px art, title/artist, `<time>` relative stamp, links to Apple Music search in a new tab
- [x] `ListeningSection.tsx`: `"use client"`; Resume's grid; `SectionHeading` (kicker/title from content); `useStaggerReveal(ref, 0.1)`; returns null when `LISTENING_SOURCE.kind === "off"`; imports `./listening.css`
- [x] Component tests: live vs past status, fallback tile, offline state, hidden when off

## 3. Wire-up — done
- [x] `src/app/page.tsx`: render `<ListeningSection />` between `<JourneyTimeline />` and `<ResumeSection />`, and update the docblock order list
- [x] `.github/workflows/ci.yml`: pass `NEXT_PUBLIC_LASTFM_USER: ${{ vars.LASTFM_USER }}` and `NEXT_PUBLIC_LASTFM_API_KEY: ${{ vars.LASTFM_API_KEY }}` as env to the `npm run build` step (push this file from the Mac: the dev gh token lacks the `workflow` scope)

## 4. Verify — demo build checked at 1440, 375, 320 (2026-11-05)
- [x] `npx tsc --noEmit`, `npm run lint`, `npm test`, `next build`
- [x] `NEXT_PUBLIC_LISTENING_DEMO=1` build: compare against the spec checklist at 1440×900, 375 and 320 (no overflow), and with reduced motion
- [ ] Open a PR

## Kameron's manual steps (not for the harness)
1. Create a Last.fm account, then an API key at https://www.last.fm/api/account/create (read-only key)
2. Install a scrobbler that sends Apple Music plays to Last.fm (iPhone: "Scrobbles for Last.fm"; Mac: NepTunes or similar)
3. Add repo variables `LASTFM_USER` and `LASTFM_API_KEY` under GitHub → kamfolio → Settings → Variables
