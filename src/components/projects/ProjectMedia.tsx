"use client";

/**
 * Left-column media for each project card (PROJ-02, PROJ-03, PROJ-04).
 * `revealed` flips true when the card's wipe finishes (immediately under reduced motion).
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { useCubeStore } from "@/components/cube/cube-store";
import { LEAF_DIAGNOSIS, type ProjectMedia as MediaKind } from "@/content/projects";

const MEDIA_FRAME =
  "relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-[var(--color-hairline)] md:aspect-auto md:h-full";

const SCAN_DURATION = 1.6;
const SCAN_FADE = 0.3;
const LABEL_DELAY = 0.4;
const LABEL_DURATION = 0.5;

interface MediaProps {
  media: MediaKind;
  revealed: boolean;
}

export default function ProjectMedia({ media, revealed }: MediaProps): JSX.Element {
  if (media === "leaf") return <LeafScan revealed={revealed} />;
  if (media === "cube") return <CubeSlot revealed={revealed} />;
  return <SkeletonMedia />;
}

/** Green Guardian: teal scan line sweeps the leaf, then the diagnosis label fades in. */
function LeafScan({ revealed }: { revealed: boolean }): JSX.Element {
  const frameRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const frame = frameRef.current;
      const sweep = sweepRef.current;
      const label = labelRef.current;
      if (!revealed || !frame || !sweep || !label) return;
      if (prefersReducedMotion()) {
        gsap.set(label, { opacity: 1, y: 0 });
        return;
      }
      gsap
        .timeline()
        .set(sweep, { opacity: 1, y: 0 })
        .to(sweep, { y: () => frame.offsetHeight, duration: SCAN_DURATION, ease: "power1.inOut" })
        .to(sweep, { opacity: 0, duration: SCAN_FADE })
        .to(label, { opacity: 1, y: 0, duration: LABEL_DURATION, ease: "power2.out" }, `+=${LABEL_DELAY - SCAN_FADE}`);
    },
    { dependencies: [revealed], scope: frameRef }
  );

  return (
    <div ref={frameRef} className={MEDIA_FRAME}>
      <Image
        src="/projects/green-guardian-leaf-mold.jpg"
        alt="Tomato leaf yellowing from leaf mold, the kind of photo Green Guardian diagnoses"
        fill
        sizes="(min-width: 768px) 500px, 100vw"
        className="object-cover"
      />
      {/* Sweep: a 12%-tall brightened band trailing a 2px teal line. Starts just above the frame (line at top), moved as one. */}
      <div
        ref={sweepRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-[12%] h-[12%] opacity-0"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(46,196,182,0.22))] mix-blend-screen" />
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-nebula-teal)] shadow-[0_0_24px_4px_rgba(46,196,182,0.7)]" />
      </div>
      <p
        ref={labelRef}
        className="absolute bottom-4 left-4 flex translate-y-2 items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-[rgba(8,8,10,0.72)] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-silver)] opacity-0 backdrop-blur"
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--color-nebula-teal)]" />
        {LEAF_DIAGNOSIS}
      </p>
    </div>
  );
}

/**
 * CubeCoach: an empty slot the global-canvas cube tracks (`data-cube-target`).
 * Mouse hover scrambles; touch tap / Enter / Space toggles.
 */
function CubeSlot({ revealed }: { revealed: boolean }): JSX.Element {
  const setEngaged = useCubeStore((s) => s.setEngaged);
  const setRevealed = useCubeStore((s) => s.setRevealed);
  const engaged = useCubeStore((s) => s.engaged);
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    setRevealed(revealed);
  }, [revealed, setRevealed]);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches);
    return () => setEngaged(false);
  }, [setEngaged]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={engaged}
      aria-label={engaged ? "Solve the Rubik's cube" : "Scramble the Rubik's cube"}
      onPointerEnter={(e) => e.pointerType === "mouse" && setEngaged(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setEngaged(false)}
      onClick={() => isTouch && setEngaged(!engaged)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        setEngaged(!engaged);
      }}
      className={`${MEDIA_FRAME} cursor-pointer bg-[radial-gradient(circle_at_50%_45%,rgba(241,240,224,0.06),transparent_65%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--color-nebula-teal)]`}
    >
      <div data-cube-target className="absolute inset-0" />
      <p className="absolute inset-x-0 bottom-4 text-center font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        {isTouch ? "Tap to scramble" : "Hover to scramble"}
      </p>
    </div>
  );
}

/** Placeholder: three pulsing skeleton blocks. */
function SkeletonMedia(): JSX.Element {
  return (
    <div className={`${MEDIA_FRAME} flex flex-col gap-4 p-6`} aria-hidden="true">
      <div className="h-1/2 rounded-sm bg-[var(--color-silver)] animate-skeleton motion-reduce:animate-none motion-reduce:opacity-[0.06]" />
      <div className="h-6 w-3/4 rounded-sm bg-[var(--color-silver)] animate-skeleton [animation-delay:200ms] motion-reduce:animate-none motion-reduce:opacity-[0.06]" />
      <div className="h-6 w-1/2 rounded-sm bg-[var(--color-silver)] animate-skeleton [animation-delay:400ms] motion-reduce:animate-none motion-reduce:opacity-[0.06]" />
    </div>
  );
}
