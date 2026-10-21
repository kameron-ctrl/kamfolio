"use client";

/**
 * Rocket "Hire me" CTA (HIRE-01…04) — docs/specs/rocket-cta.
 * Fixed bottom-right on every scroll position. Click: the rocket squashes,
 * a 40px clone launches with a 2D particle trail, then the email panel opens.
 * Desktop flies up; mobile turns and flies left. Reduced motion just opens it.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "@/lib/gsap";
import { DESKTOP_QUERY, prefersReducedMotion } from "@/lib/reduced-motion";
import { MONO } from "@/components/ui/classes";
import RocketIcon from "./RocketIcon";
import ContactPanel from "./ContactPanel";
import { flightPlan } from "./flight";
import { startTrail, type Trail } from "./trail";

const PANEL_ID = "hire-me-panel";
const CLONE_SIZE = 40;
const CLONE_HALF_LENGTH = 15; // rocket body half-length at 40px, for the nozzle

interface LaunchRefs {
  button: HTMLButtonElement;
  icon: HTMLSpanElement;
  clone: HTMLDivElement;
}

/** Builds the launch timeline (spec "Launch sequence"); `onPanel` fires at 1.1s. */
function buildLaunch({ button, icon, clone }: LaunchRefs, onPanel: () => void, onDone: () => void): gsap.core.Timeline {
  const rect = button.getBoundingClientRect();
  const mobile = !window.matchMedia(DESKTOP_QUERY).matches;
  const plan = flightPlan(rect, { width: window.innerWidth, height: window.innerHeight }, mobile);
  let trail: Trail | null = null;

  const tl = gsap.timeline({
    onComplete: onDone,
    onInterrupt: () => trail?.destroy(),
  });
  tl.to(icon, { scaleY: 0.9, scaleX: 1.05, duration: 0.18, ease: "power1.out" }, 0)
    .to(icon, { x: 1.5, duration: 0.03, repeat: 5, yoyo: true, ease: "none" }, 0)
    .call(() => {
      gsap.set(clone, {
        left: rect.left + rect.width / 2 - CLONE_SIZE / 2,
        top: rect.top + rect.height / 2 - CLONE_SIZE / 2,
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
      });
      trail = startTrail(() => {
        const r = clone.getBoundingClientRect();
        return {
          center: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
          rotation: Number(gsap.getProperty(clone, "rotate")) || 0,
          halfLength: CLONE_HALF_LENGTH,
        };
      });
    }, [], 0.18)
    .to(icon, { opacity: 0, scaleX: 1, scaleY: 1, x: 0, duration: 0.1 }, 0.18);

  if (mobile) {
    tl.to(clone, { rotate: plan.rotate, duration: 0.15, ease: "power1.out" }, 0.18).to(
      clone,
      { x: plan.x, duration: 0.8, ease: "power2.in" },
      0.33
    );
  } else {
    tl.to(clone, { x: plan.x, y: plan.y, rotate: plan.rotate, duration: 0.9, ease: "power2.in" }, 0.18);
  }

  return tl
    .call(() => trail?.stopEmitting(), [], 1.08)
    .call(onPanel, [], 1.1)
    .call(() => {
      trail?.destroy();
      gsap.set(clone, { opacity: 0 });
    }, [], 1.5)
    .to(icon, { opacity: 1, duration: 0.3 }, 1.5);
}

export default function HireMe(): JSX.Element {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launchRef = useRef<gsap.core.Timeline | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [launching, setLaunching] = useState<boolean>(false);

  const close = useCallback((): void => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  const handleClick = (): void => {
    if (launching) return;
    if (open) {
      close();
      return;
    }
    const [button, icon, clone] = [buttonRef.current, iconRef.current, cloneRef.current];
    if (!button || !icon || !clone || prefersReducedMotion()) {
      setOpen(true);
      return;
    }
    setLaunching(true);
    launchRef.current = buildLaunch(
      { button, icon, clone },
      () => setOpen(true),
      () => setLaunching(false)
    );
  };

  // Panel entrance: lift + fade (a plain 150ms fade under reduced motion)
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const reduced = prefersReducedMotion();
    gsap.fromTo(
      panel,
      { opacity: 0, y: reduced ? 0 : 12 },
      { opacity: 1, y: 0, duration: reduced ? 0.15 : 0.35, ease: reduced ? "none" : "expo.out" }
    );
  }, [open]);

  // Esc and outside clicks close the panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") close();
    };
    const onPointer = (e: PointerEvent): void => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  useEffect(() => () => void launchRef.current?.kill(), []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Hire me — show contact email"
        aria-expanded={open}
        aria-controls={open ? PANEL_ID : undefined}
        aria-disabled={launching}
        onClick={handleClick}
        className="group fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-[calc(16px+env(safe-area-inset-right))] z-50 grid h-14 w-14 place-items-center rounded-full border border-[var(--color-hairline)] bg-[rgba(28,28,31,0.72)] text-[var(--color-silver)] backdrop-blur-[12px] transition-[border-color,transform] duration-150 hover:border-[rgba(241,240,224,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--color-nebula-teal)] active:scale-[0.94] md:bottom-[calc(24px+env(safe-area-inset-bottom))] md:right-[calc(24px+env(safe-area-inset-right))] md:h-16 md:w-16"
      >
        <span
          aria-hidden="true"
          className={`${MONO} pointer-events-none absolute right-full hidden md:block top-1/2 mr-3 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full border border-[var(--color-hairline)] bg-[rgba(18,18,20,0.88)] px-3 py-1.5 text-[var(--color-silver)] opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none`}
        >
          Hire me
        </span>
        <span className="transition-transform duration-150 group-hover:-translate-y-0.5 motion-reduce:transition-none">
          <span ref={iconRef} className="block">
            <RocketIcon className="h-6 w-6 md:h-7 md:w-7" />
          </span>
        </span>
      </button>

      <div
        ref={cloneRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[51] h-10 w-10 text-[var(--color-silver)] opacity-0"
      >
        <RocketIcon className="h-10 w-10" />
      </div>

      {open && <ContactPanel ref={panelRef} id={PANEL_ID} onClose={close} />}
    </>
  );
}
