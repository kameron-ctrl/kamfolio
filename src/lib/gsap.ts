/**
 * Single GSAP plugin registration site (D-15, FOUND-05).
 *
 * Every component that uses GSAP imports gsap and ScrollTrigger from THIS file.
 * No other file in the codebase may call `gsap.registerPlugin`.
 *
 * Per RESEARCH.md Pitfall 4: this file must only be imported from "use client"
 * components. Importing from a Server Component will trigger SSR crashes
 * because ScrollTrigger references DOM globals at module-load time.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default gsap;
export { ScrollTrigger };
