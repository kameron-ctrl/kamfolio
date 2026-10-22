/**
 * Particle trail overlay for the rocket launch (HIRE-02) — docs/specs/rocket-cta.
 * A temporary full-viewport **2D** canvas (never WebGL, so the page keeps one
 * WebGL context), added at launch and removed by `destroy()`.
 */
import gsap from "@/lib/gsap";
import {
  makeParticle,
  nozzlePoint,
  particleLook,
  spawnCount,
  stepParticles,
  type Particle,
  type Point,
} from "./flight";

const MAX_FRAME_MS = 50; // ignore long stalls (tab switches) instead of jumping particles

export interface TrailSource {
  center: Point;
  rotation: number;
  halfLength: number;
}

export interface Trail {
  /** Stop spawning; live particles keep fading until `destroy()`. */
  stopEmitting: () => void;
  destroy: () => void;
}

export function startTrail(source: () => TrailSource | null): Trail {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "49" });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let particles: Particle[] = [];
  let carry = 0;
  let emitting = true;
  let last = performance.now();

  const tick = (): void => {
    if (!ctx) return;
    const now = performance.now();
    const dt = Math.min(MAX_FRAME_MS, now - last);
    last = now;

    particles = stepParticles(particles, dt);
    const s = emitting ? source() : null;
    if (s) {
      const spawn = spawnCount(dt, carry);
      carry = spawn.carry;
      const nozzle = nozzlePoint(s.center, s.rotation, s.halfLength);
      const fresh = Array.from({ length: spawn.count }, () => makeParticle(nozzle, s.rotation, Math.random));
      particles = [...particles, ...fresh];
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      const { rgb, alpha } = particleLook(p);
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  gsap.ticker.add(tick);

  return {
    stopEmitting: () => {
      emitting = false;
    },
    destroy: () => {
      gsap.ticker.remove(tick);
      canvas.remove();
    },
  };
}
