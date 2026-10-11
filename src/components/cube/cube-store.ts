import { create } from "zustand";

/**
 * Bridge between the CubeCoach card's DOM slot (hover / tap / reveal) and the
 * cube drawn in the global canvas. The canvas reads it with getState() in
 * useFrame, so writes never re-render React.
 */
interface CubeState {
  /** Pointer over the slot, or toggled on by tap/keyboard. Drives scramble (true) / solve (false). */
  engaged: boolean;
  /** The card's wipe has finished — the cube may be drawn. */
  revealed: boolean;
  setEngaged: (engaged: boolean) => void;
  setRevealed: (revealed: boolean) => void;
}

export const useCubeStore = create<CubeState>((set) => ({
  engaged: false,
  revealed: false,
  setEngaged: (engaged) => set({ engaged }),
  setRevealed: (revealed) => set({ revealed }),
}));
