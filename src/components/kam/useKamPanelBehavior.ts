"use client";

/**
 * Side-effects of the kam.md panel being open:
 *  - URL: #kam.md while open (shareable; browser Back closes it)
 *  - Scroll: the page behind stops scrolling
 *  - Focus: moves into the panel, stays there (Tab wraps), returns on close; Escape closes
 */
import { useEffect, useRef, type RefObject } from "react";
import { getLenis } from "@/lib/lenis-instance";
import { KAM_HASH, useKamStore } from "@/lib/kam/kam-store";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function urlWithoutHash(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function useKamHashSync(isOpen: boolean): void {
  const pushedRef = useRef(false);
  const firstRunRef = useRef(true);

  useEffect(() => {
    const syncFromUrl = (): void => {
      const wantsOpen = window.location.hash === KAM_HASH;
      const { isOpen: open, open: show, close } = useKamStore.getState();
      if (wantsOpen === open) return;
      pushedRef.current = false;
      if (wantsOpen) show();
      else close();
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener("hashchange", syncFromUrl);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("hashchange", syncFromUrl);
    };
  }, []);

  useEffect(() => {
    // The first pass would wipe a #kam.md the visitor arrived with before syncFromUrl's open lands
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    const hasHash = window.location.hash === KAM_HASH;
    if (isOpen && !hasHash) {
      window.history.pushState(null, "", KAM_HASH);
      pushedRef.current = true;
    } else if (!isOpen && hasHash) {
      if (pushedRef.current) window.history.back();
      else window.history.replaceState(null, "", urlWithoutHash());
      pushedRef.current = false;
    }
  }, [isOpen]);
}

export function useScrollLock(isOpen: boolean): void {
  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    getLenis()?.stop();
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
      getLenis()?.start();
    };
  }, [isOpen]);
}

function trapTab(event: KeyboardEvent, container: HTMLElement): void {
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function useDialogFocus(
  isOpen: boolean,
  panelRef: RefObject<HTMLElement>,
  initialFocusRef: RefObject<HTMLElement>,
  onClose: () => void
): void {
  useEffect(() => {
    if (!isOpen) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    initialFocusRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
      else if (event.key === "Tab" && panelRef.current) trapTab(event, panelRef.current);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      returnTo?.focus({ preventScroll: true });
    };
  }, [isOpen, panelRef, initialFocusRef, onClose]);
}
