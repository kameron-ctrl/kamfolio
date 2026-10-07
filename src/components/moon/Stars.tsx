'use client';

import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { starFragment, starVertex } from './shaders';

/** Seeded random so the star field is identical on every load. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** A twinkling star field placed behind the moon. */
export function Stars({ count = 1400 }: { count?: number }) {
  const geometry = useMemo(() => {
    const r = seeded(1969);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 14;
      pos[i * 3 + 1] = (r() - 0.5) * 9;
      pos[i * 3 + 2] = -3 - r() * 3;
      seed[i] = r() * 100;
      size[i] = r() < 0.93 ? 0.8 + r() * 1.2 : 2 + r() * 1.6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starVertex,
        fragmentShader: starFragment,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        uniforms: { uTime: { value: 0 }, uDpr: { value: 1 }, uFade: { value: 0 } },
      }),
    [],
  );

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    material.uniforms.uTime.value = t;
    material.uniforms.uDpr.value = state.viewport.dpr;
    material.uniforms.uFade.value = 1 - Math.pow(1 - Math.min(t / 1.2, 1), 3);
  });

  return <points geometry={geometry} material={material} renderOrder={0} frustumCulled={false} />;
}
