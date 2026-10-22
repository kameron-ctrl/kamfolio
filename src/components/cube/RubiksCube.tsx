"use client";

/**
 * CubeCoach card's live Rubik's cube (PROJ-03, docs/specs/project-cards).
 *
 * Drawn in the moon's HUD layer of the single global canvas (fov 45, z 2) and
 * placed every frame over the DOM box `[data-cube-target]` — the same tracking
 * approach Moon.tsx uses for its target. Hover state comes from useCubeStore.
 *
 * Built imperatively (not JSX) because layer turns re-parent cubies into a
 * pivot group and back, which React's reconciler must not own.
 */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { nextMove, type CubeAxis, type CubeMove, type CubePlan } from "./cube-moves";
import { useCubeStore } from "./cube-store";
import { prefersReducedMotion } from "@/lib/reduced-motion";

const TARGET_SELECTOR = "[data-cube-target]";
const CUBIE_SIZE = 0.94;
const STICKER_SIZE = 0.8;
const STICKER_OFFSET = CUBIE_SIZE / 2 + 0.002;
/** Cube extent in its own units (3 cubies, outer faces at ±1.47). */
const CUBE_EXTENT = 2 + CUBIE_SIZE;
/** On-screen cube silhouette width as a fraction of the slot's smaller side. */
const SCREEN_FILL = 0.62;
/**
 * Silhouette ÷ edge for the idle pose: the turned cube shows its diagonal and
 * its near half sits closer to the z = 2 camera. Measured at 1440×900.
 */
const SILHOUETTE_PER_EDGE = 1.48;
const IDLE_TILT_X = 0.45;
const IDLE_SPIN = 0.15; // rad/s
const SCRAMBLE_MOVES = 20;
const SCRAMBLE_TURN_S = 0.09;
const SOLVE_TURN_S = 0.35;
const APPEAR_S = 0.6;
const QUARTER = Math.PI / 2;
const ORIGIN = new THREE.Vector3(0, 0, 0);

/** Face order matches the sticker normals below: +x, -x, +y, -y, +z, -z. */
const FACE_COLORS = ["#c8323c", "#ef7a2a", "#e8e6dc", "#f2c230", "#2a9d5c", "#2f5fbf"] as const;
const FACE_NORMALS: readonly THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);
const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const roundQuarter = (a: number): number => Math.round(a / QUARTER) * QUARTER;

interface CubeRig {
  outer: THREE.Group;
  root: THREE.Group;
  pivot: THREE.Group;
  cubies: THREE.Group[];
  dispose: () => void;
}

function buildRig(): CubeRig {
  const outer = new THREE.Group();
  const root = new THREE.Group();
  const pivot = new THREE.Group();
  outer.add(root);
  root.add(pivot);

  const bodyGeo = new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE);
  const stickerGeo = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE);
  const bodyMat = new THREE.MeshStandardMaterial({ color: "#0d0d0f", roughness: 0.6 });
  const stickerMats = FACE_COLORS.map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0 })
  );

  const cubies: THREE.Group[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        const cubie = new THREE.Group();
        cubie.position.set(x, y, z);
        cubie.add(new THREE.Mesh(bodyGeo, bodyMat));
        FACE_NORMALS.forEach((n, i) => {
          // Only outward faces get a sticker
          if (n.x * x + n.y * y + n.z * z !== 1) return;
          const sticker = new THREE.Mesh(stickerGeo, stickerMats[i]);
          sticker.position.copy(n).multiplyScalar(STICKER_OFFSET);
          sticker.lookAt(sticker.position.clone().multiplyScalar(2));
          cubie.add(sticker);
        });
        root.add(cubie);
        cubies.push(cubie);
      }
    }
  }

  const dispose = (): void => {
    bodyGeo.dispose();
    stickerGeo.dispose();
    bodyMat.dispose();
    stickerMats.forEach((m) => m.dispose());
  };
  return { outer, root, pivot, cubies, dispose };
}

interface Turn {
  move: CubeMove;
  elapsed: number;
  duration: number;
  ease: (t: number) => number;
}

function startTurn(rig: CubeRig, move: CubeMove, duration: number, ease: Turn["ease"]): Turn {
  rig.pivot.rotation.set(0, 0, 0);
  rig.cubies
    .filter((c) => Math.round(c.position[move.axis]) === move.layer)
    .forEach((c) => rig.pivot.attach(c));
  return { move, elapsed: 0, duration, ease };
}

function finishTurn(rig: CubeRig, axis: CubeAxis): void {
  rig.pivot.updateMatrixWorld();
  [...rig.pivot.children].forEach((c) => {
    rig.root.attach(c);
    // Snap away float drift so later layer selection stays exact
    c.position.set(Math.round(c.position.x), Math.round(c.position.y), Math.round(c.position.z));
    c.rotation.set(roundQuarter(c.rotation.x), roundQuarter(c.rotation.y), roundQuarter(c.rotation.z));
  });
  rig.pivot.rotation[axis] = 0;
}

export default function RubiksCube(): JSX.Element {
  const rig = useMemo(buildRig, []);
  const s = useRef({
    plan: { mode: "idle", remaining: 0, history: [] } as CubePlan,
    turn: null as Turn | null,
    engaged: false,
    spin: 0,
    appear: 0,
    target: null as Element | null,
    reduce: false,
  });

  useEffect(() => {
    s.current.reduce = prefersReducedMotion();
    return () => rig.dispose();
  }, [rig]);

  useFrame((state, delta) => {
    const st = s.current;
    const dt = Math.min(delta, 0.064);
    const { engaged, revealed } = useCubeStore.getState();

    // Hover in → scramble burst; hover out → solve back through history
    if (engaged !== st.engaged) {
      st.engaged = engaged;
      st.plan = engaged
        ? { ...st.plan, mode: "scramble", remaining: SCRAMBLE_MOVES }
        : { ...st.plan, mode: "solve" };
    }

    if (!st.turn) {
      const step = nextMove(st.plan);
      if (step) {
        st.plan = step.plan;
        const scrambling = st.plan.mode === "scramble";
        const duration = st.reduce ? 0 : scrambling ? SCRAMBLE_TURN_S : SOLVE_TURN_S;
        st.turn = startTurn(rig, step.move, duration, scrambling ? easeOut : easeInOut);
      }
    }

    if (st.turn) {
      const turn = st.turn;
      turn.elapsed += dt;
      const t = turn.duration > 0 ? Math.min(turn.elapsed / turn.duration, 1) : 1;
      rig.pivot.rotation[turn.move.axis] = -turn.move.dir * QUARTER * turn.ease(t);
      if (t >= 1) {
        finishTurn(rig, turn.move.axis);
        st.turn = null;
      }
    }

    // Place over the DOM slot
    if (!st.target || !st.target.isConnected) st.target = document.querySelector(TARGET_SELECTOR);
    const el = st.target;
    const vw = state.size.width;
    const vh = state.size.height;
    const rect = el?.getBoundingClientRect();
    const onScreen =
      !!rect && rect.width > 0 && rect.right > 0 && rect.left < vw && rect.bottom > 0 && rect.top < vh;

    st.appear = revealed ? Math.min(st.appear + dt / APPEAR_S, 1) : 0;
    rig.outer.visible = onScreen && st.appear > 0;
    if (!rect || !rig.outer.visible) return;

    const { width: viewW, height: viewH } = state.viewport.getCurrentViewport(state.camera, ORIGIN);
    const edgeWorld = SCREEN_FILL * Math.min(rect.width, rect.height) * (viewW / vw);
    rig.outer.scale.setScalar((edgeWorld / (CUBE_EXTENT * SILHOUETTE_PER_EDGE)) * easeOut(st.appear));
    rig.outer.position.set(
      viewW * ((rect.left + rect.width / 2) / vw - 0.5),
      -viewH * ((rect.top + rect.height / 2) / vh - 0.5),
      0
    );

    if (!st.reduce) st.spin += IDLE_SPIN * dt;
    rig.outer.rotation.set(IDLE_TILT_X, st.spin + 0.6, 0);
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 4]} intensity={1.8} />
      <primitive object={rig.outer} />
    </>
  );
}
