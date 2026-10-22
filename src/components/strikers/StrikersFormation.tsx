"use client";

/**
 * Strikers silhouette formation (PERS-03) — docs/specs/personality-timeline.
 * Seven dancers on one 520×420 SVG stage (scales with its box). Scroll progress
 * through the Strikers panel moves them V → line → diamond and swaps poses at
 * the line. Positions are written straight to the SVG — no React renders.
 */
import { useId, useRef, type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/reduced-motion";
import { DANCER_COUNT, STAGE_HEIGHT, STAGE_WIDTH, formationAt, poseAt } from "./formation";

const DANCER_WIDTH = 60;
const DANCER_HEIGHT = 132;
const REDUCED_MOTION_PROGRESS = 0.5; // the line formation

/** Limbs as polylines in a 60×132 box; the head is drawn separately. */
const POSES: readonly (readonly string[])[] = [
  // Arms raised in a V
  ["30,26 30,72", "30,32 14,8", "30,32 46,8", "30,72 21,128", "30,72 39,128"],
  // Deep wide stance, arms crossed at the chest
  ["30,26 30,70", "30,34 18,46 40,40", "30,34 42,46 20,40", "30,70 12,98 10,128", "30,70 48,98 50,128"],
  // One arm out, stepping into a lunge
  ["30,26 32,72", "30,32 4,26", "30,32 44,56", "32,72 18,128", "32,72 46,102 54,126"],
];

function placement(progress: number, i: number): { transform: string; pose: number } {
  const p = formationAt(progress)[i];
  return {
    transform: `translate(${p.x - DANCER_WIDTH / 2} ${p.y - DANCER_HEIGHT})`,
    pose: poseAt(progress, i),
  };
}

export default function StrikersFormation({ panelRef }: { panelRef: RefObject<HTMLElement> }): JSX.Element {
  const uid = useId().replace(/:/g, "");
  const dancerRefs = useRef<(SVGGElement | null)[]>([]);
  const useRefs = useRef<(SVGUseElement | null)[]>([]);
  const poseId = (n: number): string => `${uid}-pose-${n}`;

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const panel = panelRef.current;
      if (!panel) return;

      const apply = (progress: number): void => {
        for (let i = 0; i < DANCER_COUNT; i++) {
          const { transform, pose } = placement(progress, i);
          dancerRefs.current[i]?.setAttribute("transform", transform);
          useRefs.current[i]?.setAttribute("href", `#${poseId(pose)}`);
        }
      };

      if (prefersReducedMotion()) {
        apply(REDUCED_MOTION_PROGRESS);
        return;
      }

      // Progress across the panel's whole trip through the viewport
      ScrollTrigger.create({
        trigger: panel,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
    },
    { scope: panelRef }
  );

  return (
    <svg
      viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
      role="img"
      aria-label="Seven dancer silhouettes moving from a V into a line, then a diamond"
      className="h-auto w-full max-w-[520px] md:w-[520px]"
    >
      <defs>
        {POSES.map((limbs, n) => (
          <g key={n} id={poseId(n)}>
            <circle cx="30" cy="13" r="8" fill="currentColor" />
            {limbs.map((points) => (
              <polyline
                key={points}
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        ))}
      </defs>
      <ellipse cx={STAGE_WIDTH / 2} cy={STAGE_HEIGHT - 12} rx={240} ry={12} fill="rgba(241,240,224,0.05)" />
      <g className="text-[var(--color-silver)]" opacity={0.85}>
        {Array.from({ length: DANCER_COUNT }, (_, i) => {
          const { transform, pose } = placement(0, i);
          return (
            <g key={i} ref={(el) => {
                dancerRefs.current[i] = el;
              }} transform={transform}>
              <use ref={(el) => {
                  useRefs.current[i] = el;
                }} href={`#${poseId(pose)}`} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
