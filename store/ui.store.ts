import { create } from "zustand";

type UiStore = {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (value: boolean) => void;
};

export const useUiStore = create<UiStore>((set) => ({
  isSidebarCollapsed: false,
  setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
}));
