"use client";

/**
 * MoonSceneClient — global R3F <Canvas> mount point + opacity reveal wrapper.
 *
 * Owns the fixed-position canvas wrapper div (D-01) and dynamically imports
 * MoonScene with { ssr: false } so WebGL APIs never run on the server
 * (QUAL-01, RESEARCH.md Pitfall 2). MoonScene's onReady prop fires after
 * textures upload to the GPU; that flips local `ready` state, which fades
 * the wrapper from opacity 0 to 1 over 0.5s (D-02, D-09, D-12).
 *
 * This is a Client Component island — layout.tsx remains a Server Component
 * so `export const metadata` continues to work.
 *
 * DPR cap [1, 1.5] is applied directly via the MOON_DPR_CAP constant on the
 * Canvas element — this is the runtime enforcement of QUAL-04.
 *
 * The wrapper has `pointer-events: none` so HTML content above it
 * (z-index: 1 in layout) remains fully interactive.
 */
import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { MOON_DPR_CAP } from "./MoonScene.constants";

const MoonScene = dynamic(() => import("./MoonScene"), { ssr: false });

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
          <MoonScene onReady={handleReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
