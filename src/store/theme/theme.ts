import { create } from "zustand";

import { getStoredThemeMode, setTheme as applyTheme, type ThemeMode } from "@/utils/theme";

interface IThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

/**
 * 主题 Store
 * 提供主题状态管理和切换功能
 */
export const useThemeStore = create<IThemeState>((set) => ({
  theme: getStoredThemeMode(),
  setTheme: (theme: ThemeMode) => {
    applyTheme(theme);
    set({ theme });
  },
}));
