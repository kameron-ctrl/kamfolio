"use client";

/**
 * MoonGlow — atmospheric glow rim around the moon (HERO-03, D-17).
 *
 * Renders a single sphere ~5% larger than the moon, using:
 *   - THREE.BackSide          (only inward faces render — the glow appears
 *                              from outside the silhouette, not as a solid orb)
 *   - THREE.AdditiveBlending  (color adds to background pixels — looks like
 *                              emitted light against deep space)
 *   - transparent + opacity   (low value ~0.18 — subtle halo, not bloom)
 *   - depthWrite: false       (prevents z-fighting with the moon mesh that
 *                              sits at the same depth — RESEARCH Pitfall 5)
 *
 * Color #a0c8ff matches tokens.css --color-moon-glow for system continuity.
 *
 * No state, no effects, no animations of its own. The parent (MoonScene)
 * controls the moon's entrance animation; the glow stays at its resting
 * position. Before the moon settles at z=0 the canvas wrapper is at
 * opacity 0, so users never see the glow isolated.
 *
 * Renders ONLY inside an R3F <Canvas>.
 */
import * as THREE from "three";
import { MOON_GLOW_RADIUS_MULTIPLIER } from "./MoonScene.constants";

/** Glow sphere segment count — no displacement here, 32x32 is plenty
 *  smooth for a uniform halo (RESEARCH.md Pattern 5). */
const GLOW_SEGMENTS = 32;

/** Glow color — must match --color-moon-glow in src/styles/tokens.css.
 *  Hardcoded as a literal (R3F materials cannot read CSS custom properties). */
const GLOW_COLOR = "#a0c8ff";

/** Glow opacity — UI-SPEC locked value; within D-17's 0.15–0.25 band.
 *  Subtle rim, not a bloom effect. */
const GLOW_OPACITY = 0.18;

export interface MoonGlowProps {
  /** Radius of the parent moon mesh in Three.js units. */
  moonRadius: number;
  /** World-space X offset matching the moon mesh. */
  xOffset: number;
}

export default function MoonGlow({
  moonRadius,
  xOffset,
}: MoonGlowProps): JSX.Element {
  const glowRadius = moonRadius * MOON_GLOW_RADIUS_MULTIPLIER;

  return (
    <mesh position={[xOffset, 0, 0]}>
      <sphereGeometry args={[glowRadius, GLOW_SEGMENTS, GLOW_SEGMENTS]} />
      <meshBasicMaterial
        color={GLOW_COLOR}
        transparent
        opacity={GLOW_OPACITY}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
