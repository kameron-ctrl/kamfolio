/**
 * Pure GSAP re-export — no side effects, safe to import from any module.
 *
 * Plugin registration is intentionally NOT done here. `gsap.registerPlugin`
 * must be called inside a `useLayoutEffect` (client-only) to avoid SSR crashes
 * in Next.js App Router. See CLAUDE.md: "GSAP plugins must be registered inside
 * useEffect (never at module level — SSR will fail)."
 *
 * Registration happens in LenisProvider, which is the guaranteed first client
 * context where GSAP is wired up (D-04, FOUND-05).
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default gsap;
export { ScrollTrigger };
