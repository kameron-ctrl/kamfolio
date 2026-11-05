"use client";

/**
 * Listening (docs/specs/listening). What's playing on Apple Music now, or the last
 * play, with the five before it. Plays come from Last.fm; with no source configured
 * in production the section isn't rendered.
 */
import { useRef } from "react";
import { useStaggerReveal } from "@/hooks/useScrollReveal";
import { useRecentTracks, type RecentTracksState } from "@/hooks/useRecentTracks";
import { LISTENING, LISTENING_SOURCE } from "@/content/listening";
import type { ListeningSource } from "@/lib/listening/types";
import { MONO_LABEL, SANS } from "@/components/ui/classes";
import SectionHeading from "@/components/ui/SectionHeading";
import { NowPlaying, NowPlayingSkeleton } from "./NowPlaying";
import RecentList from "./RecentList";
import "./listening.css";

const STAGGER_S = 0.1;

const NOTE = `${SANS} text-base leading-[1.55] text-[var(--color-text-body)]`;

function Feature({ state }: { state: RecentTracksState }): JSX.Element {
  if (state.status === "loading") return <NowPlayingSkeleton />;
  if (state.status === "error") return <p className={NOTE}>{LISTENING.offline}</p>;
  const [latest] = state.tracks;
  return latest ? <NowPlaying track={latest} /> : <p className={NOTE}>{LISTENING.empty}</p>;
}

interface ListeningSectionProps {
  /** Injectable for tests; defaults to the env-configured source. */
  source?: ListeningSource;
}

export default function ListeningSection({ source = LISTENING_SOURCE }: ListeningSectionProps): JSX.Element | null {
  const sectionRef = useRef<HTMLElement>(null);
  useStaggerReveal(sectionRef, STAGGER_S);
  const state = useRecentTracks(sectionRef, source);

  if (source.kind === "off") return null;
  const history = state.status === "ready" ? state.tracks.slice(1) : [];

  return (
    <section
      ref={sectionRef}
      aria-labelledby="listening-heading"
      className="px-4 py-16 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center md:gap-[6vw] md:px-[8vw] md:py-[16vh]"
    >
      <div>
        <SectionHeading id="listening-heading" kicker={LISTENING.kicker} title={LISTENING.title} />
        <p data-reveal className={`${NOTE} mt-6 max-w-[38ch] md:text-lg`}>
          {LISTENING.line}
        </p>
        <div data-reveal className="mt-12">
          <Feature state={state} />
        </div>
      </div>

      {history.length > 0 && (
        <div data-reveal className="mt-14 md:mt-0">
          <h3 className={MONO_LABEL}>{LISTENING.recentLabel}</h3>
          <RecentList tracks={history} />
        </div>
      )}
    </section>
  );
}
