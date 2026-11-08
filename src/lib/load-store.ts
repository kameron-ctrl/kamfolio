/**
 * Load state shared by the intro loader, the moon canvas and the scroll cue.
 *
 *   sceneReady — the moon textures have uploaded (set by MoonSceneClient)
 *   introDone  — the loader has started leaving, so the page is "on"
 */
import { create } from "zustand";

export interface LoadState {
  sceneReady: boolean;
  introDone: boolean;
  markSceneReady: () => void;
  markIntroDone: () => void;
}

export const useLoadStore = create<LoadState>((set) => ({
  sceneReady: false,
  introDone: false,
  markSceneReady: () => set({ sceneReady: true }),
  markIntroDone: () => set({ introDone: true }),
}));
