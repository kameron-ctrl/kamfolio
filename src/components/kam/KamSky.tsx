"use client";

/**
 * The empty space beside the kam.md panel on wide screens. Each post is a star
 * (see src/lib/kam/sky.ts); a day's posts form a constellation. Hovering a star
 * shows its text as a pull quote; clicking it jumps the feed to that post.
 * With too few posts for a sky, the latest post is shown as a large pull quote.
 *
 * Decorative: every word here is also in the feed, so it is hidden from
 * assistive tech and stays out of the tab order. Empty sky still closes the
 * panel because clicks pass through to the scrim underneath.
 */
import { useMemo, useState, type CSSProperties } from "react";
import { formatDayLabel, formatPostTime, truncate } from "@/lib/kam/format";
import { SKY_MIN_STARS, buildSky } from "@/lib/kam/sky";
import type { KamDay } from "@/lib/kam/types";
import { MONO, SANS } from "@/components/ui/classes";

const QUOTE_MAX_CHARS = 240;

interface QuoteSource {
  readonly id: string;
  readonly date: string;
  readonly at: string;
  readonly text: string;
}

function PullQuote({ post, large }: { post: QuoteSource; large: boolean }): JSX.Element {
  return (
    <figure className={`kam-quote${large ? " kam-quote--large" : ""}`}>
      <blockquote className={`${SANS} kam-quote__text`}>{truncate(post.text, QUOTE_MAX_CHARS)}</blockquote>
      <figcaption className={`${MONO} kam-quote__meta`}>
        {formatDayLabel(post.date)} · {formatPostTime(post.at)}
      </figcaption>
    </figure>
  );
}

export default function KamSky({
  days,
  onPick,
}: {
  days: readonly KamDay[];
  onPick: (postId: string) => void;
}): JSX.Element | null {
  const sky = useMemo(() => buildSky(days), [days]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const latestDay = days[0];
  const latestPost = latestDay?.posts[0];
  if (!latestDay || !latestPost) return null;

  const latest: QuoteSource = { ...latestPost, date: latestDay.date };
  const isSky = sky.stars.length >= SKY_MIN_STARS;
  const active = sky.stars.find((s) => s.id === activeId);
  const activeDate = active?.date;

  return (
    <div className="kam-sky" aria-hidden="true" data-testid="kam-sky" data-mode={isSky ? "sky" : "quote"}>
      {isSky && (
        <div className="kam-sky__field">
          <svg className="kam-sky__lines" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            {sky.links.map((link) => (
              <line
                key={`${link.from}>${link.to}`}
                x1={link.x1 * 100}
                y1={link.y1 * 100}
                x2={link.x2 * 100}
                y2={link.y2 * 100}
                vectorEffect="non-scaling-stroke"
                className={`kam-sky__line${link.date === activeDate ? " is-lit" : ""}`}
              />
            ))}
          </svg>
          {sky.stars.map((star, i) => (
            <span
              key={star.id}
              data-testid="kam-star"
              className={`kam-star${star.id === activeId ? " is-active" : ""}`}
              style={
                {
                  left: `${star.x * 100}%`,
                  top: `${star.y * 100}%`,
                  "--star-r": `${star.r}px`,
                  "--star-delay": `${star.delay}s`,
                  "--star-enter": `${Math.min(i, 40) * 18}ms`,
                } as CSSProperties
              }
              onMouseEnter={() => setActiveId(star.id)}
              onMouseLeave={() => setActiveId((current) => (current === star.id ? null : current))}
              onClick={() => onPick(star.id)}
            />
          ))}
        </div>
      )}
      {/* keyed so each new quote re-runs its fade-in */}
      <PullQuote key={(active ?? latest).id} post={active ?? latest} large={!isSky} />
    </div>
  );
}
