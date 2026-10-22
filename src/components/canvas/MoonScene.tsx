"use client";

/**
 * MoonScene — photorealistic moon mesh with NASA textures, simulated
 * sun (PointLight), GSAP Z fly-in entrance, and useFrame self-rotation.
 *
 * Renders ONLY inside an R3F <Canvas> (uses useTexture, useFrame).
 * MoonScene.client.tsx mounts this behind <Suspense>. The onReady
 * callback fires after textures upload to GPU — that is the signal
 * the client wrapper uses to fade its opacity from 0 to 1.
 *
 * Phase 2 scope:
 *   - HERO-01: NASA color + displacement + normal maps via useTexture
 *   - HERO-02: PointLight sun + AmbientLight fill (~35% shadow target)
 *   - HERO-04: Z fly-in -15 to 0 over 2.5s with power3.out
 *   - HERO-05: Y-axis rotation 0.0005 rad/frame
 *
 * Atmospheric glow (HERO-03) is Plan 03's responsibility — composed
 * as a sibling mesh in this component's JSX in that plan.
 *
 * Reduced motion (QUAL-03): tween skipped, rotation skipped.
 * StrictMode: useGSAP wraps gsap.context() — auto-cleanup, no manual kill.
 */
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import * as THREE from "three";
import gsap from "@/lib/gsap";
import {
  MOON_ENTRANCE_DURATION,
  MOON_ENTRANCE_EASE,
  MOON_ENTRANCE_START_Z,
  MOON_ENTRANCE_END_Z,
  MOON_ROTATION_PER_FRAME,
  MOON_X_OFFSET,
} from "./MoonScene.constants";

/** Sphere radius in Three.js units — 1.5 reads as ~50% viewport height
 *  given camera fov=50 + camera.z=6 (D-05, RESEARCH.md Pattern 4). */
const MOON_RADIUS = 1.5;

/** Sphere geometry segment count — 128x128 prevents displacement
 *  faceting on a 4096px displacement map (RESEARCH.md Pitfall 4). */
const MOON_SEGMENTS = 128;

/** Displacement scale — visible craters without jagged silhouette
 *  (D-15 Claude's discretion, RESEARCH.md Pattern 4 default). */
const MOON_DISPLACEMENT_SCALE = 0.08;

/** DirectionalLight sun simulation — no distance falloff, correct for
 *  a distant star. Position upper-left of moon gives ~35% shadow on
 *  the right hemisphere (UI-SPEC Lighting table; RESEARCH.md Pattern 8). */
const SUN_POSITION: [number, number, number] = [-10, 5, 8];
const SUN_INTENSITY = 2.2;
const SUN_COLOR = "#fff8e8";

/** AmbientLight fill — prevents fully-black shadow side
 *  (RESEARCH.md Pattern 8). */
const AMBIENT_INTENSITY = 0.55;

export interface MoonSceneProps {
  /** Called exactly once after the three NASA textures upload to the GPU.
   *  MoonSceneClient uses this to fade the canvas wrapper from 0 to 1
   *  opacity (D-02, D-09, D-12). */
  onReady: () => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MoonScene({ onReady }: MoonSceneProps): JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);

  // Drei useTexture with Record input — keys map to MeshStandardMaterial props.
  // The Suspense boundary in MoonSceneClient handles the loading throw.
  // onLoad fires during Suspense preloading (before this component mounts),
  // so ready signalling is handled by the useEffect below instead.
  const textures = useTexture({
    map: "/textures/moon/moon-color.png",
    displacementMap: "/textures/moon/moon-displacement.png",
    normalMap: "/textures/moon/moon-normal.png",
  });

  // Textures are guaranteed loaded when Suspense resolves and this mounts.
  useEffect(() => {
    onReady();
  }, [onReady]);

  // Initial position — apply X offset and start Z immediately so the
  // moon never flashes at the wrong location in the first frame
  // before useGSAP runs.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.position.set(MOON_X_OFFSET, 0, MOON_ENTRANCE_START_Z);
  }, []);

  // Entrance: Z fly-in -15 to 0 over 2.5s, power3.out (HERO-04, D-11, D-13).
  // useGSAP from @gsap/react (the project's standard GSAP-in-React pattern);
  // wraps gsap.context() so StrictMode double-invoke and unmount auto-revert.
  useGSAP(
    () => {
      const mesh = meshRef.current;
      if (!mesh) return;

      if (prefersReducedMotion()) {
        // Reduced motion: snap to resting Z, no tween (UI-SPEC Reduced Motion Contract).
        mesh.position.z = MOON_ENTRANCE_END_Z;
        return;
      }

      gsap.to(mesh.position, {
        z: MOON_ENTRANCE_END_Z,
        duration: MOON_ENTRANCE_DURATION,
        ease: MOON_ENTRANCE_EASE,
      });
    },
    { scope: meshRef },
  );

  // Self-rotation (HERO-05, D-18). Read reduced-motion preference once
  // outside the per-frame loop to avoid matchMedia thrash on every tick.
  const rotationDelta = prefersReducedMotion() ? 0 : MOON_ROTATION_PER_FRAME;
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationDelta;
    }
  });

  return (
    <>
      <ambientLight intensity={AMBIENT_INTENSITY} />
      <directionalLight
        position={SUN_POSITION}
        intensity={SUN_INTENSITY}
        color={SUN_COLOR}
      />
      <mesh ref={meshRef} renderOrder={4}>
        <sphereGeometry args={[MOON_RADIUS, MOON_SEGMENTS, MOON_SEGMENTS]} />
        <meshStandardMaterial
          map={textures.map}
          displacementMap={textures.displacementMap}
          displacementScale={MOON_DISPLACEMENT_SCALE}
          normalMap={textures.normalMap}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </>
  );
}
