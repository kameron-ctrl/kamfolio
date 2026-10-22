"use client";

/**
 * The email panel the rocket reveals (HIRE-03) — docs/specs/rocket-cta.
 * Desktop: 360px card above the button. Mobile: bottom sheet with 16px gutters.
 */
import { forwardRef, useEffect, useRef, useState } from "react";
import { CONTACT_EMAIL, copyEmail, mailtoHref } from "@/content/contact";
import { MONO_LABEL } from "@/components/ui/classes";

const COPIED_MS = 2000;

const ACTION =
  "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--color-nebula-teal)] md:h-9";

type CopyLabel = "Copy" | "Copied ✓" | "Press ⌘C" | "Press Ctrl+C";

interface ContactPanelProps {
  id: string;
  onClose: () => void;
}

function selectText(el: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(el);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

const ContactPanel = forwardRef<HTMLDivElement, ContactPanelProps>(function ContactPanel({ id, onClose }, ref) {
  const copyRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLParagraphElement>(null);
  const [label, setLabel] = useState<CopyLabel>("Copy");
  const [announcement, setAnnouncement] = useState<string>("");

  useEffect(() => {
    copyRef.current?.focus();
  }, []);

  useEffect(() => {
    if (label !== "Copied ✓") return;
    const t = window.setTimeout(() => setLabel("Copy"), COPIED_MS);
    return () => window.clearTimeout(t);
  }, [label]);

  const handleCopy = async (): Promise<void> => {
    const result = await copyEmail(navigator.clipboard);
    if (result === "copied") {
      setLabel("Copied ✓");
      setAnnouncement("Email copied to clipboard");
      return;
    }
    if (emailRef.current) selectText(emailRef.current);
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    setLabel(mac ? "Press ⌘C" : "Press Ctrl+C");
    setAnnouncement("Couldn't copy automatically. The email is selected; copy it with your keyboard.");
  };

  return (
    <div
      ref={ref}
      id={id}
      role="dialog"
      aria-labelledby={`${id}-title`}
      className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] left-4 right-4 z-50 rounded-md border border-[var(--color-hairline)] bg-[rgba(18,18,20,0.92)] p-6 backdrop-blur-[16px] md:bottom-[calc(104px+env(safe-area-inset-bottom))] md:left-auto md:right-[calc(24px+env(safe-area-inset-right))] md:w-[360px]"
    >
      <p id={`${id}-title`} className={MONO_LABEL}>
        Say hello
      </p>
      <p
        ref={emailRef}
        className="mt-3 select-all break-all font-[family-name:var(--font-geist-mono)] text-base text-[var(--color-silver)]"
      >
        {CONTACT_EMAIL}
      </p>
      <div className="mt-5 flex gap-3">
        <button
          ref={copyRef}
          type="button"
          onClick={handleCopy}
          className={`${ACTION} min-w-[7.5rem] bg-[var(--color-silver)] text-[#141416] hover:bg-white`}
        >
          {label}
        </button>
        <a
          href={mailtoHref()}
          className={`${ACTION} border border-[var(--color-hairline)] text-[var(--color-silver)] hover:border-[rgba(241,240,224,0.4)]`}
        >
          Email me ↗
        </a>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-lg text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-silver)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-nebula-teal)]"
      >
        <span aria-hidden="true">×</span>
      </button>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
});

export default ContactPanel;
