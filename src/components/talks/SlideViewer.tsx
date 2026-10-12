"use client";

/**
 * Slide viewer for the PyTorch Santa Cruz talk — docs/specs/talks.
 * Native <dialog> + showModal(): focus trap and Esc come free. Only the current
 * slide and its neighbors are mounted, and nothing loads until it opens.
 */
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { SLIDES } from "@/content/about";
import { MONO_LABEL } from "@/components/ui/classes";

const ROUND_BUTTON =
  "grid h-11 w-11 place-items-center rounded-full border border-[var(--color-hairline)] text-[var(--color-silver)] transition-colors duration-150 hover:border-[var(--color-nebula-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-nebula-teal)] disabled:opacity-30 disabled:hover:border-[var(--color-hairline)]";

interface SlideViewerProps {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement>;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function SlideViewer({ open, onClose, returnFocusRef }: SlideViewerProps): JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number>(0);
  const last = SLIDES.length - 1;

  const step = useCallback(
    (delta: number) => setIndex((i) => Math.min(last, Math.max(0, i + delta))),
    [last]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose = (): void => {
    document.documentElement.style.overflow = "";
    onClose();
    returnFocusRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>): void => {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Green Guardian talk slides"
      data-lenis-prevent
      onClose={handleClose}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[rgba(5,5,7,0.86)] backdrop:backdrop-blur-[8px] open:grid open:place-items-center"
    >
      {open && (
        <div className="flex w-[min(88vw,1080px)] flex-col items-center gap-5">
          <div className="relative aspect-video w-full overflow-hidden rounded border border-[var(--color-hairline)] bg-[#08080a]">
            {SLIDES.map((slide, i) =>
              Math.abs(i - index) <= 1 ? (
                <Image
                  key={slide.src}
                  src={slide.src}
                  alt={i === index ? slide.alt : ""}
                  aria-hidden={i !== index}
                  fill
                  sizes="(min-width: 1230px) 1080px, 88vw"
                  className={`object-contain transition-opacity duration-200 motion-reduce:transition-none ${
                    i === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ) : null
            )}
          </div>

          <div className="flex items-center gap-6">
            <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label="Previous slide" className={ROUND_BUTTON}>
              <span aria-hidden="true">←</span>
            </button>
            <p className={`${MONO_LABEL} min-w-[7ch] text-center`} aria-live="polite">
              {pad(index + 1)} / {pad(SLIDES.length)}
            </p>
            <button type="button" onClick={() => step(1)} disabled={index === last} aria-label="Next slide" className={ROUND_BUTTON}>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => dialogRef.current?.close()}
        aria-label="Close slides"
        className={`${ROUND_BUTTON} absolute right-4 top-4 md:right-8 md:top-8`}
      >
        <span aria-hidden="true">×</span>
      </button>
    </dialog>
  );
}
