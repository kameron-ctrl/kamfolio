"use client";

/**
 * Project card (PROJ-05, PROJ-07, FOUND-03 skew) — docs/specs/project-cards.
 *
 * Outer div takes the velocity skew; the inner <article> takes the clip-path
 * wipe, so the wipe edge travels with the skew instead of cropping it.
 * The page scrolls vertically, so the skew is on Y and desktop-only.
 */
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap, { ScrollTrigger } from "@/lib/gsap";
import { useScrollStore } from "@/lib/scroll-store";
import { DESKTOP_QUERY, prefersReducedMotion } from "@/lib/reduced-motion";
import { display } from "@/lib/fonts";
import type { Project } from "@/content/projects";
import ProjectMedia from "./ProjectMedia";

const WIPE_DURATION = 0.9;
const WIPE_START = "top 85%";
const SKEW_PER_VELOCITY = 0.15;
const SKEW_MAX_DEG = 4;
const SKEW_EASE = 0.15;

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function ProjectCard({ project, index, total }: ProjectCardProps): JSX.Element {
  const skewRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState<boolean>(false);
  const titleId = `project-${project.id}-title`;

  // Clip-path wipe, once, when the card's leading edge reaches 85% of the viewport
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const frame = frameRef.current;
      if (!frame) return;
      if (prefersReducedMotion()) {
        setRevealed(true);
        return;
      }
      gsap.set(frame, { clipPath: "inset(0 100% 0 0)" });
      ScrollTrigger.create({
        trigger: frame,
        start: WIPE_START,
        once: true,
        onEnter: () => {
          gsap.to(frame, {
            clipPath: "inset(0 0% 0 0)",
            duration: WIPE_DURATION,
            ease: "expo.out",
            onComplete: () => setRevealed(true),
          });
        },
      });
    },
    { scope: frameRef }
  );

  // Velocity skew — desktop only, driven off the GSAP ticker (no React renders)
  useEffect(() => {
    const el = skewRef.current;
    if (!el || prefersReducedMotion() || !window.matchMedia(DESKTOP_QUERY).matches) return;
    const setSkew = gsap.quickSetter(el, "skewY", "deg") as (v: number) => void;
    let skew = 0;
    const tick = (): void => {
      const v = useScrollStore.getState().velocity;
      const target = Math.max(-SKEW_MAX_DEG, Math.min(SKEW_MAX_DEG, -v * SKEW_PER_VELOCITY));
      skew += (target - skew) * SKEW_EASE;
      setSkew(Math.abs(skew) < 0.01 ? 0 : skew);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      setSkew(0);
    };
  }, []);

  const { live, github } = project.links;

  return (
    <div className="flex justify-center px-4 py-3 md:px-[8vw] md:py-0">
      <div ref={skewRef} className="w-full md:w-auto">
        <article
          ref={frameRef}
          aria-labelledby={titleId}
          className="flex w-full flex-col gap-6 rounded border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 md:grid md:h-[min(70vh,640px)] md:w-[min(62vw,920px)] md:grid-cols-[56fr_44fr] md:gap-8 md:p-10"
        >
          <ProjectMedia media={project.media} revealed={revealed} />

          <div className="flex min-w-0 flex-col justify-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {pad(index + 1)} / {pad(total)}
            </p>
            <h3
              id={titleId}
              className={`${display.className} mt-4 bg-[image:var(--gradient-silver)] bg-clip-text text-[28px] uppercase leading-none text-transparent [overflow-wrap:anywhere] md:text-[clamp(28px,2.5vw,40px)]`}
            >
              {project.title}
            </h3>
            <p className="mt-5 text-base leading-[1.55] text-[var(--color-text-body)]">{project.description}</p>

            {project.pills.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tech stack">
                {project.pills.map((pill) => (
                  <li
                    key={pill}
                    className="rounded-full border border-[var(--color-hairline)] px-3 py-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]"
                  >
                    {pill}
                  </li>
                ))}
              </ul>
            )}

            {(live || github) && (
              <div className="mt-7 flex gap-6 text-sm">
                {live && <ProjectLink href={live} label="Live" project={project.title} />}
                {github && <ProjectLink href={github} label="GitHub" project={project.title} />}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function ProjectLink({ href, label, project }: { href: string; label: string; project: string }): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project} — ${label} (opens in a new tab)`}
      className="text-[var(--color-silver)] underline decoration-[var(--color-hairline)] underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-[var(--color-nebula-teal)] focus-visible:decoration-[var(--color-nebula-teal)] focus-visible:outline-none"
    >
      {label} ↗
    </a>
  );
}
