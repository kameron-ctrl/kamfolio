"use client";

/**
 * MoonSceneClient — global R3F <Canvas> mount point + opacity reveal wrapper.
 *
 * Owns the fixed-position canvas wrapper div (D-01) and dynamically imports
 * every scene with { ssr: false } so WebGL APIs never run on the server
 * (QUAL-01, RESEARCH.md Pitfall 2). The wrapper fades from opacity 0 to 1
 * over 0.5s once the moon textures have uploaded (D-02, D-09, D-12).
 *
 * Two cameras, one WebGL context:
 *   - The default camera (fov 50, z = 6) frames NebulaScene.
 *   - The moon hero (src/components/moon) needs fov 45 at z = 2, so it renders
 *     in a drei <Hud> layer with its own camera, drawn after the nebula.
 *
 * This is a Client Component island — layout.tsx remains a Server Component
 * so `export const metadata` continues to work.
 *
 * DPR cap [1, 1.5] is applied directly via the MOON_DPR_CAP constant on the
 * Canvas element — this is the runtime enforcement of QUAL-04.
 *
 * The wrapper has `pointer-events: none` so HTML content above it
 * (z-index: 1 in layout) remains fully interactive. It paints no background:
 * the page's charcoal sky gradient (globals.css) shows through the canvas.
 */
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Hud, PerspectiveCamera, useTexture } from "@react-three/drei";
import { MOON, MOON_TEXTURES } from "@/components/moon/tuning";
import { MOON_DPR_CAP } from "./MoonScene.constants";

const MoonScene = dynamic(() => import("@/components/moon/MoonScene"), { ssr: false });
const NebulaScene = dynamic(() => import("./NebulaScene"), { ssr: false });

const MOON_TEXTURE_URLS = [MOON_TEXTURES.color, MOON_TEXTURES.gray, MOON_TEXTURES.height];

/** Suspends until the moon textures are loaded (shared drei cache), then signals once. */
function MoonTexturesReady({ onReady }: { onReady: () => void }): null {
  useTexture(MOON_TEXTURE_URLS);
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export default function MoonSceneClient(): JSX.Element {
  const [ready, setReady] = useState<boolean>(false);

  const handleReady = useCallback((): void => {
    setReady(true);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: ready ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
      data-testid="moon-canvas-wrapper"
    >
      <Canvas
        dpr={[...MOON_DPR_CAP]}
        gl={{ alpha: true }}
        camera={{ fov: 50, position: [0, 0, 6] }}
      >
        <Suspense fallback={null}>
          <NebulaScene />
        </Suspense>
        <Hud renderPriority={1}>
          <PerspectiveCamera
            makeDefault
            fov={MOON.camera.fov}
            near={0.05}
            far={100}
            position={[0, 0, MOON.camera.z]}
          />
          <MoonScene />
          <Suspense fallback={null}>
            <MoonTexturesReady onReady={handleReady} />
          </Suspense>
        </Hud>
      </Canvas>
    </div>
  );
}
