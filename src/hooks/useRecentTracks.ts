"use client";

/**
 * Recent plays for the listening section. Fetches once the section is within
 * 200px of the viewport, then every 30s while it stays on screen and the tab is
 * visible. A failed refresh keeps the last good list (docs/specs/listening → Data).
 */
import { useEffect, useState, type RefObject } from "react";
import { fetchRecentTracks } from "@/lib/listening/lastfm";
import { fixtureTracks } from "@/lib/listening/fixture";
import type { ListeningSource, Track } from "@/lib/listening/types";

const POLL_MS = 30_000;
const PREFETCH_MARGIN = "200px 0px";

export type RecentTracksState =
  | { status: "loading" }
  | { status: "ready"; tracks: Track[] }
  | { status: "error"; message: string };

function useInView(ref: RefObject<HTMLElement>): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: PREFETCH_MARGIN,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

export function useRecentTracks(ref: RefObject<HTMLElement>, source: ListeningSource): RecentTracksState {
  // Always "loading" first: the page is prerendered at build time, so any
  // relative time computed there would mismatch on hydration
  const [state, setState] = useState<RecentTracksState>({ status: "loading" });
  const inView = useInView(ref);

  useEffect(() => {
    if (source.kind === "fixture") setState({ status: "ready", tracks: fixtureTracks() });
  }, [source]);

  useEffect(() => {
    if (source.kind !== "lastfm" || !inView) return;
    let controller: AbortController | null = null;

    const load = async (): Promise<void> => {
      if (document.hidden) return;
      controller?.abort();
      const current = new AbortController();
      controller = current;
      try {
        const tracks = await fetchRecentTracks(source, current.signal);
        setState({ status: "ready", tracks });
      } catch (error) {
        if (current.signal.aborted) return;
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[listening] ${message}`);
        setState((prev) => (prev.status === "ready" ? prev : { status: "error", message }));
      }
    };

    const onVisibility = (): void => {
      if (!document.hidden) void load();
    };

    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      controller?.abort();
    };
  }, [source, inView]);

  return state;
}
