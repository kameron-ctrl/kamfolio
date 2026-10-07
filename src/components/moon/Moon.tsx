'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { haloFragment, haloVertex, moonFragment, moonVertex } from './shaders';
import { MOON, MOON_TEXTURES } from './tuning';

export type MoonSurface = 'color' | 'gray';

export interface MoonProps {
  /** CSS selector for the DOM box the moon tracks. */
  targetSelector?: string;
  /** Which albedo map to put on the surface. */
  surface?: MoonSurface;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
/** Turns a "move k of the way per 60fps frame" factor into one that is correct at any frame rate. */
const frameEase = (k: number, dtMs: number) => 1 - Math.pow(1 - k, dtMs / 16.67);

/**
 * A huge, backlit moon that tracks an invisible DOM box (default: [data-moon-target]).
 * Render inside an R3F <Canvas> whose camera is fov 45 at z = 2 (see MoonCanvas).
 * The canvas must be fixed full-screen behind the page with pointer-events: none.
 */
export function Moon({ targetSelector = '[data-moon-target]', surface = 'color' }: MoonProps) {
  const [colorMap, grayMap, heightMap] = useTexture([
    MOON_TEXTURES.color,
    MOON_TEXTURES.gray,
    MOON_TEXTURES.height,
  ]);

  const moonMat = useMemo(() => {
    for (const t of [colorMap, grayMap, heightMap]) {
      // The shader writes texture values straight out, so keep them unconverted.
      t.colorSpace = THREE.NoColorSpace;
      t.wrapS = THREE.RepeatWrapping;
      t.anisotropy = 8;
      t.needsUpdate = true;
    }
    return new THREE.ShaderMaterial({
      vertexShader: moonVertex,
      fragmentShader: moonFragment,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        tAlbedo: { value: colorMap },
        tHeight: { value: heightMap },
        uTexel: { value: new THREE.Vector2(...MOON.textureTexel) },
        uBump: { value: MOON.bump },
        uReveal: { value: 0.5 },
        uAlpha: { value: 0 },
      },
    });
  }, [colorMap, grayMap, heightMap]);

  const haloMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: haloFragment,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: { uStrength: { value: 0 }, uSize: { value: MOON.halo.size } },
      }),
    [],
  );

  useEffect(() => {
    moonMat.uniforms.tAlbedo.value = surface === 'gray' ? grayMap : colorMap;
  }, [surface, moonMat, colorMap, grayMap]);

  useEffect(
    () => () => {
      moonMat.dispose();
      haloMat.dispose();
    },
    [moonMat, haloMat],
  );

  const group = useRef<THREE.Group>(null!);
  const sphere = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const origin = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  // Pointer + animation state lives in a ref so frames never trigger React renders.
  const s = useRef({
    nx: 0, ny: 0, x: 0, lastX: 0,
    gx: 0, gy: 0, rollTarget: 0, roll: 0,
    start: -1,
    reduce: false,
    target: null as Element | null,
  });

  useEffect(() => {
    const st = s.current;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    st.reduce = mq.matches;
    const onMq = (e: MediaQueryListEvent) => { st.reduce = e.matches; };
    // The canvas has pointer-events: none, so listen on the window instead of using R3F pointer state.
    const onMove = (e: PointerEvent) => {
      st.nx = (e.clientX / window.innerWidth) * 2 - 1;
      st.ny = -((e.clientY / window.innerHeight) * 2 - 1);
      st.x = e.clientX;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('pointermove', onMove);
      mq.removeEventListener('change', onMq);
    };
  }, []);

  useFrame((state, delta) => {
    const st = s.current;
    if (!st.target || !st.target.isConnected) st.target = document.querySelector(targetSelector);
    const el = st.target;
    if (!el) {
      group.current.visible = false;
      halo.current.visible = false;
      return;
    }

    if (st.start < 0) st.start = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - st.start;
    const dt = Math.min(64, delta * 1000);

    // World size of the screen at z = 0, and screen size in CSS px
    const { width: viewW, height: viewH } = state.viewport.getCurrentViewport(state.camera, origin);
    const vw = state.size.width;
    const vh = state.size.height;
    const mobile = vw < MOON.mobileBreakpoint;

    const enter = easeOutCubic(clamp((t - MOON.entrance.delay) / MOON.entrance.duration, 0, 1));

    // Where the target box is, and how far it has travelled through the viewport (0..1)
    const rect = el.getBoundingClientRect();
    const boxH = rect.height;
    const visible = rect.bottom + vh * 0.5 > 0 && rect.top - vh * 0.5 < vh && boxH > 0;
    const travel = clamp((vh - rect.top) / (boxH + vh), 0, 1);
    const reveal = 0.5 * (1 - travel);

    // Size and position
    const radius = viewH * (boxH / vh) * (mobile ? MOON.radius.mobile : MOON.radius.desktop);
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + boxH / 2;
    const parallax = (travel - 0.5) * viewH * (boxH / vh) * -MOON.parallax;
    const offset = viewH * (mobile ? MOON.offsetY.mobile : MOON.offsetY.desktop);
    const rise = -(1 - enter) * viewH * MOON.entrance.rise;

    const g = group.current;
    g.visible = visible;
    g.scale.setScalar(radius);
    g.position.x = viewW * (cx / vw - 0.5);
    g.position.y = -viewH * (cy / vh - 0.5) + parallax + offset + rise;

    // Gaze toward the cursor, plus a small roll on fast sideways moves
    const m = st.reduce ? 0 : 1;
    const G = MOON.gaze;
    st.gx += (st.nx * G.reachX * m - st.gx) * frameEase(G.ease, dt);
    st.gy += (st.ny * G.reachY * m - st.gy) * frameEase(G.ease, dt);
    const vx = (st.x - st.lastX) / dt;
    st.lastX = st.x;
    const kick = Math.sign(vx) * Math.min(Math.abs(vx) / G.rollSpeedPxPerMs, 1) * THREE.MathUtils.degToRad(G.rollMaxDeg) * m;
    st.rollTarget += (kick - st.rollTarget) * frameEase(G.rollEaseIn, dt);
    st.roll += (st.rollTarget - st.roll) * frameEase(G.rollEaseOut, dt);
    g.rotation.set(-st.gy * G.pitch, st.gx * G.yaw, st.roll * G.roll);

    // Spin, scroll tilt, reveal
    const sp = sphere.current;
    sp.rotation.y = -Math.PI / 2 + (st.reduce ? 0 : t * MOON.spin);
    sp.rotation.x = (1 - reveal) * MOON.revealTilt;
    moonMat.uniforms.uReveal.value = reveal;
    moonMat.uniforms.uAlpha.value = enter;

    // Halo always faces the camera, sits just behind the sphere
    const h = halo.current;
    h.visible = visible;
    h.position.set(g.position.x, g.position.y, MOON.halo.depth * radius);
    h.scale.setScalar(radius);
    haloMat.uniforms.uStrength.value = Math.pow(1 - reveal, 3) * enter;
  });

  return (
    <>
      <mesh ref={halo} material={haloMat} renderOrder={1} frustumCulled={false}>
        <planeGeometry args={[MOON.halo.size, MOON.halo.size]} />
      </mesh>
      <group ref={group}>
        <mesh ref={sphere} material={moonMat} renderOrder={2} frustumCulled={false}>
          <sphereGeometry args={[1, 160, 80]} />
        </mesh>
      </group>
    </>
  );
}

useTexture.preload(MOON_TEXTURES.color);
useTexture.preload(MOON_TEXTURES.height);
