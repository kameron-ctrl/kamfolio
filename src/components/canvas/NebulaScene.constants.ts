/**
 * Nebula scene constants — single source of truth for the 6-layer parallax
 * nebula (Phase 3). Imported by:
 *   - NebulaScene.tsx                  (layer iteration, breathe math)
 *   - NebulaScene.test.tsx             (Wave 0 unit assertions)
 *   - MoonScene.client.tsx             (gradient wrapper background — Layer 1)
 *
 * Values are locked by:
 *   - REQUIREMENTS.md       NEB-01..05
 *   - CONTEXT.md            D-01..D-18 (treat as gospel)
 *   - UI-SPEC.md            Layer Visual Character + Velocity Breathe contracts
 */

/** Layer 1 (deep space gradient) handled as CSS — see MoonScene.client.tsx wrapper. */

export interface NebulaLayer {
  readonly name: "stars" | "farNebula" | "midFog" | "nearBokeh" | "fgDust";
  readonly coefficient: number;
  readonly z: number;
  readonly renderOrder: number;
  readonly textureKey: "star" | "nebulaBlob" | "bokeh" | "dustGrain";
  readonly opacity: number;
  readonly particleSize: number;
}

/**
 * Particle layers 2-6. Index 0 = Layer 2 (stars). Coefficients monotonically
 * increase per D-09. renderOrder per D-02:
 *   layers 2-4 (renderOrder 1-3) sit BEHIND moon (renderOrder 4);
 *   layers 5-6 (renderOrder 5-6) sit IN FRONT of moon.
 */
export const NEBULA_LAYERS: readonly NebulaLayer[] = [
  { name: "stars",     coefficient: 0.05, z: -2.0, renderOrder: 1, textureKey: "star",       opacity: 0.95, particleSize: 0.025 },
  { name: "farNebula", coefficient: 0.15, z: -1.5, renderOrder: 2, textureKey: "nebulaBlob", opacity: 0.28, particleSize: 0.28  },
  { name: "midFog",    coefficient: 0.30, z: -1.0, renderOrder: 3, textureKey: "nebulaBlob", opacity: 0.10, particleSize: 0.38  },
  { name: "nearBokeh", coefficient: 0.60, z:  0.5, renderOrder: 5, textureKey: "bokeh",      opacity: 0.18, particleSize: 1.20  },
  { name: "fgDust",    coefficient: 0.80, z:  1.0, renderOrder: 6, textureKey: "dustGrain",  opacity: 0.10, particleSize: 0.030 },
] as const;

/** Three nebula cluster colors — locked by UI-SPEC NEB-03 and tokens.css. */
export const NEBULA_CLUSTER_COLORS: readonly ["#7b4fa6", "#2ec4b6", "#ff6b6b"] = [
  "#7b4fa6", // nebula purple (--color-nebula-purple)
  "#2ec4b6", // nebula teal   (--color-nebula-teal)
  "#ff6b6b", // nebula coral  (--color-nebula-coral)
] as const;

/** Layer 2 star color — UI-SPEC Layer 2 character. */
export const NEBULA_STAR_COLOR = "#c8d8ff";

/** Layer 6 dust color — UI-SPEC Layer 6 character. */
export const NEBULA_DUST_COLOR = "#d0e0ff";

/** Mobile breakpoint — UI-SPEC Mobile Rendering Contract. Detected once at mount. */
export const NEBULA_MOBILE_BREAKPOINT_PX = 768;

export interface NebulaParticleCounts {
  readonly stars: number;
  readonly clusterEach: number; // Layer 3: 3 clusters × clusterEach
  readonly midFog: number;
  readonly nearBokeh: number;
  readonly fgDust: number;
}

export const NEBULA_DESKTOP_COUNTS: NebulaParticleCounts = {
  stars: 2500,
  clusterEach: 1500,
  midFog: 1000,
  nearBokeh: 120,
  fgDust: 400,
} as const;

export const NEBULA_MOBILE_COUNTS: NebulaParticleCounts = {
  stars: 1000,
  clusterEach: 300,
  midFog: 300,
  nearBokeh: 40,
  fgDust: 120,
} as const;

/**
 * Far-nebula cluster spatial centers (UI-SPEC Layer 3 character). All at
 * z = -1.5 (Layer 3 plane). Order matches NEBULA_CLUSTER_COLORS.
 */
export const NEBULA_CLUSTER_CENTERS: readonly (readonly [number, number])[] = [
  [-2.5,  1.5], // purple — upper-left, behind/above moon
  [ 2.0,  1.0], // teal   — upper-right, partially overlapping moon's lit edge
  [ 2.5, -1.5], // coral  — lower-right, below moon's equator
] as const;

/** Cluster spread radius in world units — particles distributed around the center. */
export const NEBULA_CLUSTER_RADIUS = 1.4;

/**
 * Velocity breathe range (D-03, D-05). At velocity ≈ 0 multiplier = 1.0.
 * At peak velocity multiplier = NEBULA_BREATHE_MAX.
 * 1.25 sits centrally in the locked 1.2-1.3 band.
 */
export const NEBULA_BREATHE_MAX = 1.25;

/**
 * Velocity normalization scale (D-04). Multiply |displayVelocity| by this
 * scale and clamp to [0, 1] to get the breathe ramp input. Tune during
 * execution if peak feels under/over.
 */
export const NEBULA_BREATHE_VELOCITY_SCALE = 0.02;

/**
 * Horizontal parallax world-unit range (RESEARCH.md Pitfall 4). progress is
 * 0-1 within the horizontal phase zone. Mapping to ~12 world units gives
 * visible per-layer separation given camera fov=50, z=6 (~±5 unit fov at z=0).
 */
export const NEBULA_H_PARALLAX_RANGE = 12;

/**
 * Particle distribution extents — wide enough that breathing scale (1.25×)
 * and horizontal parallax (12 units) never reveal an empty edge.
 */
export const NEBULA_SPREAD_X = 18;
export const NEBULA_SPREAD_Y = 14;

/**
 * Vertical scrollY → world-unit conversion. scrollY is in pixels (0..several
 * thousand); raw multiply by coefficient 0.05 still yields tens of units.
 * We scale down so that even high coefficients (0.8) keep particles within
 * a sensible world-space range while scrolling vertically.
 */
export const NEBULA_V_PARALLAX_PX_TO_UNIT = 0.0015;

/**
 * Layer 1 (deep space gradient) CSS — applied as background on the
 * MoonSceneClient wrapper div (D-10). Uses tokens already declared in
 * src/styles/tokens.css (--color-void, --color-space).
 */
export const NEBULA_L1_GRADIENT =
  "radial-gradient(ellipse at 50% 40%, var(--color-void) 0%, var(--color-space) 70%)";

/**
 * Reduced-motion parallax scale (UI-SPEC Reduced Motion Contract).
 * Multiply every layer's effective coefficient by this when
 * prefers-reduced-motion: reduce. 0.2 = 20% of nominal motion.
 */
export const NEBULA_REDUCED_MOTION_PARALLAX_SCALE = 0.2;
