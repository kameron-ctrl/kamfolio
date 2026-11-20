"use client";

/**
 * kam.md side page (docs/specs/kam-md/SPEC.md). A Twitter-style feed that
 * slides in from the right over the site. Lives in a portal on <body> so no
 * section transform or stacking context can trap it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { countPosts, formatDayLabel, postDomId, thoughtsLabel } from "@/lib/kam/format";
import { useKamStore } from "@/lib/kam/kam-store";
import type { KamDay } from "@/lib/kam/types";
import { MONO, SANS } from "@/components/ui/classes";
import KamAvatar from "./KamAvatar";
import KamPost from "./KamPost";
import KamSky from "./KamSky";
import { useDialogFocus, useKamHashSync, useScrollLock } from "./useKamPanelBehavior";
import "./kam.css";

const TITLE_ID = "kam-panel-title";
/** How long a post jumped to from the sky stays highlighted. */
const PICK_HIGHLIGHT_MS = 1800;

function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function Profile({ total }: { total: number }): JSX.Element {
  return (
    <section className="kam-profile" aria-label="About kam.md">
      <div className="kam-profile__banner" aria-hidden="true" />
      <KamAvatar size="lg" />
      <p className={`${SANS} kam-profile__name`}>Kameron Benjamin</p>
      <p className={`${MONO} kam-profile__handle`}>@kam.md</p>
      <p className={`${SANS} kam-profile__bio`}>
        Thoughts, half-thoughts, and whatever I&apos;m building today. Posted from my phone, published by my homelab.
      </p>
      <p className={`${MONO} kam-profile__stat`}>
        <span className="kam-profile__count">{total}</span> {total === 1 ? "thought" : "thoughts"} so far
      </p>
    </section>
  );
}

function Feed({ days, pickedId }: { days: readonly KamDay[]; pickedId: string | null }): JSX.Element {
  if (days.length === 0) {
    return <p className={`${SANS} kam-feed__empty`}>No thoughts yet. Check back later today.</p>;
  }
  return (
    <ol className="kam-feed">
      {days.map((day) => (
        <li key={day.date} className="kam-day">
          <h3 className={`${MONO} kam-day__label`}>{formatDayLabel(day.date)}</h3>
          <ol className="kam-day__posts">
            {day.posts.map((post) => (
              <li
                key={post.id}
                id={postDomId(post.id)}
                tabIndex={-1}
                className={`kam-feed__item${post.id === pickedId ? " is-picked" : ""}`}
              >
                <KamPost post={post} />
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}

export default function KamPanel({ days }: { days: readonly KamDay[] }): JSX.Element | null {
  const isOpen = useKamStore((s) => s.isOpen);
  const close = useKamStore((s) => s.close);
  const mounted = useMounted();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = countPosts(days);
  const [pickedId, setPickedId] = useState<string | null>(null);

  // A star in the sky was clicked: bring its post into view and keep focus inside the dialog.
  const pick = useCallback((postId: string) => {
    const target = document.getElementById(postDomId(postId));
    if (!target) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    // Focus first: focusing after a smooth scroll starts cancels the scroll in Chromium.
    target.focus({ preventScroll: true });
    target.scrollIntoView?.({ block: "center", behavior: reduced ? "auto" : "smooth" });
    setPickedId(postId);
  }, []);

  useEffect(() => {
    if (!pickedId) return;
    const timer = window.setTimeout(() => setPickedId(null), PICK_HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [pickedId]);

  // Closed: out of the tab order and the accessibility tree, but still mounted so it can slide out.
  // Runs before useDialogFocus so the panel is no longer inert when focus moves in.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (isOpen) panel.removeAttribute("inert");
    else panel.setAttribute("inert", "");
  }, [isOpen, mounted]);

  useKamHashSync(isOpen);
  useScrollLock(isOpen);
  useDialogFocus(isOpen, panelRef, closeRef, close);

  if (!mounted) return null;

  return createPortal(
    <div className={`kam-layer${isOpen ? " is-open" : ""}`} data-testid="kam-layer">
      <div className="kam-scrim" aria-hidden="true" onClick={close} />
      <KamSky days={days} onPick={pick} />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        aria-hidden={isOpen ? undefined : true}
        className="kam-panel"
        data-lenis-prevent
      >
        <header className="kam-panel__bar">
          <button ref={closeRef} type="button" onClick={close} className="kam-panel__back" aria-label="Back to the site">
            <span aria-hidden="true">←</span>
          </button>
          <div>
            <h2 id={TITLE_ID} className={`${SANS} kam-panel__title`}>
              kam.md
            </h2>
            <p className={`${MONO} kam-panel__subtitle`}>{thoughtsLabel(total)}</p>
          </div>
        </header>
        <Profile total={total} />
        <Feed days={days} pickedId={pickedId} />
      </aside>
    </div>,
    document.body
  );
}
