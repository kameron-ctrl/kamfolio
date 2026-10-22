/**
 * Pure move logic for the CubeCoach card's Rubik's cube.
 *
 * The cube only ever remembers the moves applied since it was last solved.
 * Scrambling appends random moves to that history; solving pops it and plays
 * each move inverted, so "solved" is always exactly an empty history.
 */
export type CubeAxis = "x" | "y" | "z";
export type CubeLayer = -1 | 0 | 1;

export interface CubeMove {
  axis: CubeAxis;
  layer: CubeLayer;
  dir: 1 | -1;
}

export type CubeMode = "idle" | "scramble" | "solve";

export interface CubePlan {
  mode: CubeMode;
  /** Scramble moves still to play in this burst. */
  remaining: number;
  history: readonly CubeMove[];
}

const AXES: readonly CubeAxis[] = ["x", "y", "z"];
const LAYERS: readonly CubeLayer[] = [-1, 0, 1];

export function invertMove(move: CubeMove): CubeMove {
  return { ...move, dir: move.dir === 1 ? -1 : 1 };
}

/** A random quarter turn that never re-turns the previous move's layer (no wasted or cancelling moves). */
export function randomMove(prev: CubeMove | null, rand: () => number = Math.random): CubeMove {
  for (;;) {
    const move: CubeMove = {
      axis: AXES[Math.floor(rand() * AXES.length)],
      layer: LAYERS[Math.floor(rand() * LAYERS.length)],
      dir: rand() < 0.5 ? 1 : -1,
    };
    if (!prev || move.axis !== prev.axis || move.layer !== prev.layer) return move;
  }
}

/** The next move to animate and the plan after it, or null when there's nothing to do. */
export function nextMove(plan: CubePlan): { move: CubeMove; plan: CubePlan } | null {
  if (plan.mode === "scramble" && plan.remaining > 0) {
    const prev = plan.history.length > 0 ? plan.history[plan.history.length - 1] : null;
    const move = randomMove(prev);
    return {
      move,
      plan: { ...plan, remaining: plan.remaining - 1, history: [...plan.history, move] },
    };
  }
  if (plan.mode === "solve" && plan.history.length > 0) {
    const last = plan.history[plan.history.length - 1];
    return {
      move: invertMove(last),
      plan: { ...plan, history: plan.history.slice(0, -1) },
    };
  }
  return null;
}
