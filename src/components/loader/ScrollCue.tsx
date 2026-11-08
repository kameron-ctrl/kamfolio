"use client";

/**
 * Scroll cue: fixed bottom-center "Scroll" label over a hairline with a
 * moon-glow dot falling down it. Appears once the intro loader leaves, hides
 * after the first CUE_HIDE_AFTER_PX of scroll. Click glides to About via Lenis.
 */
import type { MouseEvent } from "react";
import { MONO } from "@/components/ui/classes";
import { useLoadStore } from "@/lib/load-store";
import { useScrollStore } from "@/lib/scroll-store";
import { getLenis } from "@/lib/lenis-instance";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import "./loader.css";

export const CUE_HIDE_AFTER_PX = 80;
export const CUE_TARGET_ID = "about";

export default function ScrollCue(): JSX.Element {
  const introDone = useLoadStore((s) => s.introDone);
  const isScrolled = useScrollStore((s) => s.scrollY > CUE_HIDE_AFTER_PX);
  const isVisible = introDone && !isScrolled;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    const lenis = getLenis();
    const target = document.getElementById(CUE_TARGET_ID);
    if (!lenis || !target) return; // plain anchor jump still works
    event.preventDefault();
    lenis.scrollTo(target, { immediate: prefersReducedMotion() });
  };

  return (
    <a
      href={`#${CUE_TARGET_ID}`}
      onClick={handleClick}
      className={`scroll-cue${isVisible ? " is-visible" : ""}`}
      aria-label="Scroll to About"
      aria-hidden={isVisible ? undefined : true}
      tabIndex={isVisible ? 0 : -1}
      data-testid="scroll-cue"
    >
      <span className={`${MONO} scroll-cue__label`}>Scroll</span>
      <span className="scroll-cue__track" aria-hidden="true">
        <span className="scroll-cue__dot" />
      </span>
    </a>
  );
}
