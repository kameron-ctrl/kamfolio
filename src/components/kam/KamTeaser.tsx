"use client";

/**
 * Mid-site doorway to kam.md. Asks what Kam is thinking, previews the latest
 * post, and points chevrons at a glowing seam on the right edge where the side
 * page slides in from. Click the call to action, swipe left, or scroll sideways
 * on a trackpad to open it.
 */
import { useRef, type TouchEvent, type WheelEvent } from "react";
import { formatPostTime, isSideSwipe, thoughtsLabel, truncate } from "@/lib/kam/format";
import { useKamStore } from "@/lib/kam/kam-store";
import type { KamPost } from "@/lib/kam/types";
import { MONO, MONO_LABEL, SANS } from "@/components/ui/classes";
import "./kam.css";

const PREVIEW_CHARS = 160;
/** Trackpad wheel deltas arrive in small bursts; sum those this close together. */
const WHEEL_GESTURE_MS = 250;

interface KamTeaserProps {
  latest?: KamPost;
  total: number;
}

function useSideGesture(onSide: () => void): {
  onWheel: (e: WheelEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
} {
  const wheel = useRef({ dx: 0, dy: 0, t: 0 });
  const touch = useRef<{ x: number; y: number } | null>(null);

  return {
    onWheel: (e) => {
      const fresh = e.timeStamp - wheel.current.t > WHEEL_GESTURE_MS;
      const dx = (fresh ? 0 : wheel.current.dx) + e.deltaX;
      const dy = (fresh ? 0 : wheel.current.dy) + e.deltaY;
      wheel.current = { dx, dy, t: e.timeStamp };
      // Positive deltaX = content heading left = toward the side page; isSideSwipe wants a leftward drag
      if (isSideSwipe(-dx, dy)) {
        wheel.current = { dx: 0, dy: 0, t: 0 };
        onSide();
      }
    },
    onTouchStart: (e) => {
      const t = e.touches[0];
      touch.current = t ? { x: t.clientX, y: t.clientY } : null;
    },
    onTouchEnd: (e) => {
      const start = touch.current;
      const t = e.changedTouches[0];
      touch.current = null;
      if (start && t && isSideSwipe(t.clientX - start.x, t.clientY - start.y)) onSide();
    },
  };
}

export default function KamTeaser({ latest, total }: KamTeaserProps): JSX.Element {
  const open = useKamStore((s) => s.open);
  const gesture = useSideGesture(open);

  return (
    <section aria-labelledby="kam-teaser-heading" className="kam-teaser" data-testid="kam-teaser" {...gesture}>
      <div className="kam-teaser__inner">
        <p className={`${MONO_LABEL} kam-teaser__kicker`}>
          <span className="kam-teaser__pulse" aria-hidden="true" />
          kam.md · {thoughtsLabel(total)}
        </p>
        <h2 id="kam-teaser-heading" className={`${SANS} kam-teaser__heading`}>
          What&apos;s Kam thinking?
        </h2>

        {latest && (
          <figure className="kam-teaser__preview">
            <blockquote className={`${SANS} kam-teaser__quote`}>{truncate(latest.text, PREVIEW_CHARS)}</blockquote>
            <figcaption className={`${MONO} kam-teaser__when`}>
              latest · <time dateTime={latest.at}>{formatPostTime(latest.at)}</time>
            </figcaption>
          </figure>
        )}

        <button type="button" onClick={open} className={`${MONO} kam-teaser__cta`}>
          Check out kam.md
          <span aria-hidden="true" className="kam-teaser__cta-arrow">
            →
          </span>
        </button>
        <p className={`${MONO} kam-teaser__hint`} aria-hidden="true">
          or swipe / scroll sideways
        </p>
      </div>

      <div className="kam-teaser__chevrons" aria-hidden="true">
        <span className="kam-teaser__chevron" />
        <span className="kam-teaser__chevron" />
        <span className="kam-teaser__chevron" />
      </div>
      <div className="kam-teaser__seam" aria-hidden="true" />
    </section>
  );
}
