"use client";

/**
 * NebulaScene — 5 particle layers wrapping the moon (Phase 3, NEB-01..05).
 *
 * Layer breakdown (D-09):
 *   index 0  stars       coefficient 0.05  z -2.0  renderOrder 1  (behind moon)
 *   index 1  farNebula   coefficient 0.15  z -1.5  renderOrder 2  (behind moon)
 *   index 2  midFog      coefficient 0.30  z -1.0  renderOrder 3  (behind moon)
 *   --- moon at renderOrder 4 ---
 *   index 3  nearBokeh   coefficient 0.60  z  0.5  renderOrder 5  (in front of moon)
 *   index 4  fgDust      coefficient 0.80  z  1.0  renderOrder 6  (in front of moon)
 *
 * Layer 1 (deep space gradient) is CSS on the MoonSceneClient wrapper —
 * see Plan 04. This component holds the 5 GL particle layers only.
 *
 * Per-frame parallax + breathe mutation lives in Plan 04. This plan ships
 * the static composition with refs ready to be mutated.
 *
 * Resources are disposed on unmount (RESEARCH.md Pitfall 3) to prevent
 * GPU memory leaks during HMR cycles.
 */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  NEBULA_LAYERS,
  NEBULA_CLUSTER_COLORS,
  NEBULA_STAR_COLOR,
  NEBULA_DUST_COLOR,
  NEBULA_MOBILE_BREAKPOINT_PX,
  NEBULA_DESKTOP_COUNTS,
  NEBULA_MOBILE_COUNTS,
  NEBULA_CLUSTER_CENTERS,
  NEBULA_CLUSTER_RADIUS,
  NEBULA_SPREAD_X,
  NEBULA_SPREAD_Y,
  type NebulaLayer,
  type NebulaParticleCounts,
} from "./NebulaScene.constants";
import { createNebulaTextures, type NebulaTextures } from "@/lib/nebula-textures";

/** Pick desktop or mobile particle counts at mount (UI-SPEC mobile contract). */
function pickCounts(): NebulaParticleCounts {
  if (typeof window === "undefined") return NEBULA_DESKTOP_COUNTS;
  return window.innerWidth <= NEBULA_MOBILE_BREAKPOINT_PX
    ? NEBULA_MOBILE_COUNTS
    : NEBULA_DESKTOP_COUNTS;
}

/** Uniform random in [-1, 1) — used to scatter particles around centers. */
function rand11(): number {
  return Math.random() * 2 - 1;
}

/**
 * Build a buffer geometry for stars / midFog / fgDust — particles spread
 * uniformly across NEBULA_SPREAD_X x NEBULA_SPREAD_Y at z = 0 (layer-local;
 * the points group is positioned at layer.z by the JSX).
 */
function buildSpreadGeometry(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = rand11() * (NEBULA_SPREAD_X / 2);
    positions[i * 3 + 1] = rand11() * (NEBULA_SPREAD_Y / 2);
    positions[i * 3 + 2] = 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

/**
 * Build a buffer geometry for the farNebula layer — `perCluster` particles
 * per cluster around each NEBULA_CLUSTER_CENTERS entry, plus per-vertex
 * colors matching NEBULA_CLUSTER_COLORS so a single PointsMaterial+vertexColors
 * draw produces 3 distinct color clouds.
 *
 * Particles within each cluster are gaussian-ish via the average of two
 * uniforms (cheap Box-Muller approximation).
 */
function buildClusterGeometry(perCluster: number): THREE.BufferGeometry {
  const total = perCluster * NEBULA_CLUSTER_CENTERS.length;
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);

  const colorObjs = NEBULA_CLUSTER_COLORS.map((hex) => new THREE.Color(hex));

  let writeIdx = 0;
  NEBULA_CLUSTER_CENTERS.forEach((center, ci) => {
    const cx = center[0];
    const cy = center[1];
    const colr = colorObjs[ci];
    for (let i = 0; i < perCluster; i++) {
      const dx = ((rand11() + rand11()) / 2) * NEBULA_CLUSTER_RADIUS;
      const dy = ((rand11() + rand11()) / 2) * NEBULA_CLUSTER_RADIUS;
      positions[writeIdx * 3]     = cx + dx;
      positions[writeIdx * 3 + 1] = cy + dy;
      positions[writeIdx * 3 + 2] = 0;
      colors[writeIdx * 3]     = colr.r;
      colors[writeIdx * 3 + 1] = colr.g;
      colors[writeIdx * 3 + 2] = colr.b;
      writeIdx++;
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/**
 * Build a buffer geometry for nearBokeh — wide spread, but each particle
 * gets a per-vertex color so we can mix the 3 cluster colors at the locked
 * 40/40/20 ratio (UI-SPEC Layer 5 character).
 */
function buildBokehGeometry(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const colPurple = new THREE.Color(NEBULA_CLUSTER_COLORS[0]);
  const colTeal   = new THREE.Color(NEBULA_CLUSTER_COLORS[1]);
  const colCoral  = new THREE.Color(NEBULA_CLUSTER_COLORS[2]);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = rand11() * (NEBULA_SPREAD_X / 2);
    positions[i * 3 + 1] = rand11() * (NEBULA_SPREAD_Y / 2);
    positions[i * 3 + 2] = 0;

    // 40% purple, 40% teal, 20% coral
    const r = Math.random();
    const c = r < 0.4 ? colPurple : r < 0.8 ? colTeal : colCoral;
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

interface LayerResources {
  geometry: THREE.BufferGeometry;
  material: THREE.PointsMaterial;
}

function buildLayerResources(
  layer: NebulaLayer,
  counts: NebulaParticleCounts,
  textures: NebulaTextures
): LayerResources {
  let geometry: THREE.BufferGeometry;
  let materialProps: THREE.PointsMaterialParameters;

  switch (layer.name) {
    case "stars": {
      geometry = buildSpreadGeometry(counts.stars);
      materialProps = {
        map: textures.star,
        color: new THREE.Color(NEBULA_STAR_COLOR),
        size: layer.particleSize,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false, // D-02 — prevent z-fighting
        blending: THREE.AdditiveBlending,
        opacity: layer.opacity,
      };
      break;
    }
    case "farNebula": {
      geometry = buildClusterGeometry(counts.clusterEach);
      materialProps = {
        map: textures.nebulaBlob,
        vertexColors: true, // 3 cluster colors per-vertex
        size: layer.particleSize,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: layer.opacity,
      };
      break;
    }
    case "midFog": {
      geometry = buildSpreadGeometry(counts.midFog);
      // Mid fog uses a single tinted color (purple-shifted) at very low
      // opacity — UI-SPEC says "barely tinted, not vividly colored".
      materialProps = {
        map: textures.nebulaBlob,
        color: new THREE.Color(NEBULA_CLUSTER_COLORS[0]),
        size: layer.particleSize,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: layer.opacity,
      };
      break;
    }
    case "nearBokeh": {
      geometry = buildBokehGeometry(counts.nearBokeh);
      materialProps = {
        map: textures.bokeh,
        vertexColors: true,
        size: layer.particleSize,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: layer.opacity,
      };
      break;
    }
    case "fgDust": {
      geometry = buildSpreadGeometry(counts.fgDust);
      materialProps = {
        map: textures.dustGrain,
        color: new THREE.Color(NEBULA_DUST_COLOR),
        size: layer.particleSize,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: layer.opacity,
      };
      break;
    }
    default: {
      // Exhaustive check — TypeScript will error here if NebulaLayer['name']
      // ever gains a new variant that this switch doesn't handle. Also
      // guarantees the strict-mode `let geometry`/`let materialProps`
      // declarations are definitely assigned before the return below
      // (closes the 'not definitely assigned' tsc --noEmit failure mode).
      const _exhaustive: never = layer.name;
      throw new Error(`Unknown nebula layer: ${_exhaustive}`);
    }
  }

  const material = new THREE.PointsMaterial(materialProps);
  return { geometry, material };
}

export default function NebulaScene(): JSX.Element {
  // One ref per layer. Plan 04 mutates these in useFrame.
  const refStars     = useRef<THREE.Points>(null);
  const refFarNebula = useRef<THREE.Points>(null);
  const refMidFog    = useRef<THREE.Points>(null);
  const refNearBokeh = useRef<THREE.Points>(null);
  const refFgDust    = useRef<THREE.Points>(null);

  const layerRefs = [
    refStars,
    refFarNebula,
    refMidFog,
    refNearBokeh,
    refFgDust,
  ] as const;

  // Generate textures once at mount (D-14). useMemo with empty deps so the
  // canvases live for the full component lifetime.
  const textures = useMemo<NebulaTextures>(() => createNebulaTextures(), []);

  const counts = useMemo<NebulaParticleCounts>(() => pickCounts(), []);

  // Build geometry + material per layer once.
  const resources = useMemo<readonly LayerResources[]>(
    () => NEBULA_LAYERS.map((layer) => buildLayerResources(layer, counts, textures)),
    [counts, textures]
  );

  // Dispose imperative resources on unmount (RESEARCH.md Pitfall 3).
  useEffect(() => {
    return () => {
      textures.star.dispose();
      textures.nebulaBlob.dispose();
      textures.bokeh.dispose();
      textures.dustGrain.dispose();
      resources.forEach((r) => {
        r.geometry.dispose();
        r.material.dispose();
      });
    };
  }, [textures, resources]);

  return (
    <>
      {NEBULA_LAYERS.map((layer, i) => {
        const res = resources[i];
        const ref = layerRefs[i];
        return (
          <points
            key={layer.name}
            ref={ref}
            geometry={res.geometry}
            material={res.material}
            position={[0, 0, layer.z]}
            renderOrder={layer.renderOrder}
          />
        );
      })}
    </>
  );
}
