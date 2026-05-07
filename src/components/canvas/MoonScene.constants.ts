/**
 * Moon scene constants — single source of truth for the photorealistic moon
 * hero (Phase 2). Imported by:
 *   - MoonScene.tsx              (entrance, rotation, position values)
 *   - MoonScene.client.tsx       (DPR cap on Canvas)
 *   - MoonGlow.tsx               (glow radius multiplier — Plan 03)
 *   - MoonScene.test.tsx         (Wave 0 unit assertions)
 *
 * Values are locked by:
 *   - REQUIREMENTS.md            QUAL-04 (DPR), HERO-04 (entrance), HERO-05 (rotation)
 *   - CONTEXT.md                 D-03, D-04, D-05, D-11, D-13, D-17, D-18
 *   - UI-SPEC.md                 Canvas Layer Contract + Entrance Animation Contract
 *
 * Do not change without updating CONTEXT.md and the failing test cases.
 */

/**
 * Device pixel ratio cap for the global R3F Canvas (QUAL-04, D-03).
 * The architecture research mentioned [1, 2] — that is a typo. The
 * authoritative requirement is [1, 1.5]. Caps retina rendering on
 * mobile and high-DPI displays.
 */
export const MOON_DPR_CAP: readonly [1, 1.5] = [1, 1.5] as const;

/**
 * Z fly-in entrance duration in GSAP units (seconds).
 * HERO-04 calls for "~2.5 seconds" — exact value 2.5.
 */
export const MOON_ENTRANCE_DURATION = 2.5;

/**
 * GSAP ease curve name for the entrance.
 * D-13 specifies "ease-out" (fast start, settles gently).
 * power3.out is the canonical GSAP curve matching this profile and
 * mirrors --ease-out-expo in tokens.css for visual continuity.
 */
export const MOON_ENTRANCE_EASE = "power3.out";

/**
 * Initial mesh.position.z value at mount (D-11).
 * -15 places the moon as a tiny distant point in the camera frustum
 * given camera fov=50 and camera.z=6.
 */
export const MOON_ENTRANCE_START_Z = -15;

/**
 * Resting mesh.position.z value (D-11). Plays through perspective
 * foreshortening — NOT a CSS scale — that is the intended look.
 */
export const MOON_ENTRANCE_END_Z = 0;

/**
 * Per-frame Y-axis rotation in radians applied inside useFrame
 * (HERO-05, D-18). Subtle on glance, perceptible on sustained viewing.
 * At 60fps this works out to ~1.7° per second.
 */
export const MOON_ROTATION_PER_FRAME = 0.0005;

/**
 * Mesh.position.x offset that places the moon right-of-center
 * (D-04, D-05). Camera fov=50 + camera.z=6 means a sphere at x=2.0
 * sits visually around 65-70% across the viewport horizontally.
 * Tunable Claude's discretion — the constant lets us adjust without
 * editing the JSX.
 */
export const MOON_X_OFFSET = 2.0;

/**
 * Atmospheric glow sphere radius multiplier (D-17).
 * Glow sphere = MOON_GLOW_RADIUS_MULTIPLIER * moonRadius.
 * 1.05 = 5% larger, halo barely larger than silhouette — subtle rim glow,
 * not a bloom effect.
 * Consumed by MoonGlow.tsx in Plan 03.
 */
export const MOON_GLOW_RADIUS_MULTIPLIER = 1.05;
