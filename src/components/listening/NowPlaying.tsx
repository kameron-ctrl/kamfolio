"use client";

/**
 * The featured play: album sleeve with a vinyl record sliding out from behind it,
 * then a status line and the title. The record only spins while a track is live
 * (docs/specs/listening → Left column).
 */
import { LISTENING } from "@/content/listening";
import { appleMusicSearchUrl, formatPlayedAgo } from "@/lib/listening/format";
import type { Track } from "@/lib/listening/types";
import { MONO, SANS } from "@/components/ui/classes";
import Artwork from "./Artwork";

/** Sleeve size in CSS px, desktop; mobile drops to 200 via --rec. */
const SLEEVE_PX = 260;

const RECORD_FRAME = "relative h-[var(--rec)] w-[calc(var(--rec)*1.5)] [--rec:200px] md:[--rec:260px]";
const SLEEVE =
  "relative z-10 block size-[var(--rec)] overflow-hidden rounded-[4px] border border-[var(--color-hairline)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_60px_-10px_rgba(160,200,255,0.25)]";

function Equalizer(): JSX.Element {
  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2].map((bar) => (
        <span key={bar} className="eq-bar block h-3 w-[3px] rounded-[1px] bg-[var(--color-nebula-teal)]" />
      ))}
    </span>
  );
}

function Record({ track }: { track: Track }): JSX.Element {
  return (
    <a
      href={appleMusicSearchUrl(track)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Find ${track.title} by ${track.artist} on Apple Music (opens in a new tab)`}
      className={`group ${RECORD_FRAME} block rounded-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-nebula-teal)]`}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 size-[var(--rec)] translate-x-[42%] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1/2 motion-reduce:transition-none motion-reduce:group-hover:translate-x-[42%]"
      >
        <span
          className={`vinyl-grooves absolute inset-0 flex items-center justify-center rounded-full ${
            track.isNowPlaying ? "animate-[spin_4s_linear_infinite] motion-reduce:animate-none" : ""
          }`}
        >
          <span className="block size-[36%] overflow-hidden rounded-full">
            <Artwork track={track} size={Math.round(SLEEVE_PX * 0.36)} />
          </span>
        </span>
        <span className="vinyl-sheen pointer-events-none absolute inset-0 rounded-full" />
      </span>
      <span className={SLEEVE}>
        <Artwork track={track} size={SLEEVE_PX} />
      </span>
    </a>
  );
}

function Status({ track }: { track: Track }): JSX.Element {
  if (track.isNowPlaying) {
    return (
      <p className={`${MONO} flex items-center gap-3 text-[var(--color-nebula-teal)]`}>
        <Equalizer />
        {LISTENING.nowPlaying}
      </p>
    );
  }
  return (
    <p className={`${MONO} text-[var(--color-text-muted)]`}>
      {LISTENING.lastPlayed}
      {track.playedAt && (
        <>
          {" · "}
          <time dateTime={track.playedAt.toISOString()}>{formatPlayedAgo(track.playedAt)}</time>
        </>
      )}
    </p>
  );
}

export function NowPlaying({ track }: { track: Track }): JSX.Element {
  return (
    <div>
      <Record track={track} />
      <div aria-live="polite" className="mt-7">
        <Status track={track} />
        <p
          className={`${SANS} mt-3 line-clamp-2 text-[22px] font-semibold leading-[1.15] text-[var(--color-silver)] md:text-[28px]`}
        >
          {track.title}
        </p>
        <p className={`${SANS} mt-2 truncate text-base text-[var(--color-text-body)]`}>
          {track.album ? `${track.artist} · ${track.album}` : track.artist}
        </p>
      </div>
    </div>
  );
}

/** Same footprint as the loaded record, so nothing shifts when data arrives. */
export function NowPlayingSkeleton(): JSX.Element {
  return (
    <div aria-hidden="true">
      <div className={RECORD_FRAME}>
        <span className="absolute left-0 top-0 size-[var(--rec)] translate-x-[42%] rounded-full bg-[var(--color-surface)]" />
        <span className={`${SLEEVE} bg-[var(--color-surface)]`} />
      </div>
      <div className="mt-7 space-y-3">
        <span className="block h-3 w-28 rounded-sm bg-[var(--color-surface)]" />
        <span className="block h-7 w-56 rounded-sm bg-[var(--color-surface)]" />
        <span className="block h-4 w-40 rounded-sm bg-[var(--color-surface)]" />
      </div>
    </div>
  );
}
