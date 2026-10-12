/**
 * Journey timeline (PERS-06): the node nearest `target` (viewport center) within
 * `radius` px is active. Ties go to the earlier node. Returns -1 when none qualify.
 */
export function pickActiveNode(centers: readonly number[], target: number, radius: number): number {
  let best = -1;
  let bestDistance = Infinity;
  centers.forEach((c, i) => {
    const d = Math.abs(c - target);
    if (d <= radius && d < bestDistance) {
      best = i;
      bestDistance = d;
    }
  });
  return best;
}
