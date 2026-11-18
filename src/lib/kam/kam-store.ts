/** Whether the kam.md side page is open. The teaser opens it; the panel owns closing + URL sync. */
import { create } from "zustand";

/** Shareable link to the side page: kameron-ctrl.com/#kam.md */
export const KAM_HASH = "#kam.md";

interface KamState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useKamStore = create<KamState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
