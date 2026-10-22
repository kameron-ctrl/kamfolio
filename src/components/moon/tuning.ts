/**
 * Every number that shapes the moon hero lives here.
 * These values were tuned to match the approved reference (reference/moon-hero.html).
 * Change them deliberately; don't "clean them up".
 */
export const MOON = {
  /** Camera the look depends on. A close, 45° lens is what makes the sphere read as 3D. */
  camera: { fov: 45, z: 2 },

  /** Moon radius as a fraction of the target box height. Box is full width and 1:1.2. */
  radius: { desktop: 0.3, mobile: 0.5 },
  /** Below this viewport width (px) the mobile values apply. */
  mobileBreakpoint: 768,

  /** Vertical nudge as a fraction of the visible view height. Positive = up. */
  offsetY: { desktop: 0.18, mobile: -0.08 },
  /** Scroll parallax: how far the moon lags the target, as a fraction of the box height. */
  parallax: 0.15,

  /** Radians per second of slow spin around Y. */
  spin: 0.04,
  /** Forward tilt (radians) reached when the reveal completes. */
  revealTilt: 0.4,

  /** Cursor "gaze". k values are per-60fps-frame easing factors (made frame-rate independent). */
  gaze: {
    reachX: 0.6,
    reachY: 0.4,
    ease: 0.05,
    yaw: 0.15,
    pitch: 0.1,
    roll: 0.4,
    rollMaxDeg: 1.5,
    rollSpeedPxPerMs: 1.2,
    rollEaseIn: 0.02,
    rollEaseOut: 0.07,
  },

  /** Fade + rise on first load. */
  entrance: { delay: 0.4, duration: 1.2, rise: 0.04 },

  /** Shading. */
  bump: 4.0,
  textureTexel: [1 / 2048, 1 / 1024] as const,

  /** Halo quad behind the moon, measured in moon radii. */
  halo: { size: 5.5, depth: -0.6 },
} as const;

export const MOON_TEXTURES = {
  color: '/textures/moon/moon-color.webp',
  gray: '/textures/moon/moon-gray.webp',
  height: '/textures/moon/moon-height.webp',
} as const;
