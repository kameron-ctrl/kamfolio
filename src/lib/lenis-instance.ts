/**
 * The page's single Lenis instance, set by LenisProvider.
 * Lets UI outside the provider pause scrolling or glide to an anchor.
 */
import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
