"use client";

/**
 * Intro loader: a hairline progress bar and percentage fed by the real texture
 * download (drei useProgress). Leaves once the moon textures are ready (or
 * after LOADER_MAX_MS if WebGL never reports), then unmounts.
 * Scroll is paused through Lenis while it covers the page.
 * Reduced motion: it disappears without the fade.
 */
import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { MONO } from "@/components/ui/classes";
import { useLoadStore } from "@/lib/load-store";
import { getLenis } from "@/lib/lenis-instance";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import "./loader.css";

export const LOADER_MIN_MS = 900; // never flash
export const LOADER_MAX_MS = 6000; // never trap the page if the scene stalls
export const LOADER_EXIT_MS = 900; // matches --loader-exit in loader.css

type Stage = "loading" | "leaving" | "gone";

/** Whole percent, zero-padded to three digits ("047"). */
export function formatPercent(progress: number): string {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  return String(clamped).padStart(3, "0");
}

export default function SiteLoader(): JSX.Element | null {
  const sceneReady = useLoadStore((s) => s.sceneReady);
  const { progress } = useProgress();
  const [stage, setStage] = useState<Stage>("loading");
  const [minElapsed, setMinElapsed] = useState<boolean>(false);
  const [timedOut, setTimedOut] = useState<boolean>(false);

  useEffect(() => {
    const minId = setTimeout(() => setMinElapsed(true), LOADER_MIN_MS);
    const maxId = setTimeout(() => setTimedOut(true), LOADER_MAX_MS);
    return () => {
      clearTimeout(minId);
      clearTimeout(maxId);
    };
  }, []);

  const isDone = minElapsed && (sceneReady || timedOut);

  useEffect(() => {
    if (!isDone) return;
    setStage("leaving");
    useLoadStore.getState().markIntroDone();
    const id = setTimeout(() => setStage("gone"), prefersReducedMotion() ? 0 : LOADER_EXIT_MS);
    return () => clearTimeout(id);
  }, [isDone]);

  // LenisProvider's layout effect has already created the instance by now
  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;
    if (stage === "loading") {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [stage]);

  if (stage === "gone") return null;

  const percent = formatPercent(isDone ? 100 : progress);

  return (
    <div
      className={`site-loader${stage === "leaving" ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={stage === "leaving" ? true : undefined}
      data-testid="site-loader"
    >
      <div className="site-loader__inner">
        <span className="site-loader__track" aria-hidden="true">
          <span className="site-loader__bar" style={{ transform: `scaleX(${Number(percent) / 100})` }} />
        </span>
        <span className={`${MONO} site-loader__readout`} aria-label={`Loading ${Number(percent)} percent`}>
          <span data-testid="site-loader-percent">{percent}%</span>
        </span>
      </div>
    </div>
  );
}
