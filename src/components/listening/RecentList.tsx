/** History rows under "Recently played" (docs/specs/listening → Right column). */
import { appleMusicSearchUrl, formatPlayedAgo } from "@/lib/listening/format";
import type { Track } from "@/lib/listening/types";
import { MONO, SANS } from "@/components/ui/classes";
import Artwork from "./Artwork";

const ROW_ART_PX = 52;

export default function RecentList({ tracks }: { tracks: Track[] }): JSX.Element {
  return (
    <ol className="mt-5 border-t border-[var(--color-hairline)]">
      {tracks.map((track) => (
        <li key={track.id} className="border-b border-[var(--color-hairline)]">
          <a
            href={appleMusicSearchUrl(track)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${track.title} by ${track.artist}, find on Apple Music (opens in a new tab)`}
            className="group grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 rounded-[3px] px-3 py-[14px] transition-colors duration-150 hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-nebula-teal)] motion-reduce:transition-none"
          >
            <span className="block size-[52px] overflow-hidden rounded-[3px] transition-transform duration-150 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
              <Artwork track={track} size={ROW_ART_PX} />
            </span>
            <span className="min-w-0">
              <span
                className={`${SANS} block truncate text-base font-medium text-[var(--color-silver)] underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-150 group-hover:decoration-[var(--color-nebula-teal)]`}
              >
                {track.title}
              </span>
              <span className={`${SANS} mt-0.5 block truncate text-sm text-[var(--color-text-body)]`}>
                {track.artist}
              </span>
            </span>
            {track.playedAt && (
              <time dateTime={track.playedAt.toISOString()} className={`${MONO} text-[var(--color-text-muted)]`}>
                {formatPlayedAgo(track.playedAt)}
              </time>
            )}
          </a>
        </li>
      ))}
    </ol>
  );
}
