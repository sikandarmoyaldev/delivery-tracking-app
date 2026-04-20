import { create } from "zustand";

interface AppState {
    isDriverMode: boolean;
    setIsDriverMode: (mode: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isDriverMode: false,
    setIsDriverMode: (mode) => set({ isDriverMode: mode }),
}));
