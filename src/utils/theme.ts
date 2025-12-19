/**
 * 主题工具类
 * 提供主题切换的核心功能，零侵入式实现
 */

export type ThemeMode = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "app-theme";
const THEME_ATTRIBUTE = "data-theme";

/**
 * 获取系统主题偏好
 */
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * 应用主题到 DOM
 */
export function applyTheme(theme: ThemeMode): void {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  let actualTheme: "light" | "dark";

  if (theme === "auto") {
    actualTheme = getSystemTheme();
  } else {
    actualTheme = theme;
  }

  root.setAttribute(THEME_ATTRIBUTE, actualTheme);
}

/**
 * 获取当前应用的主题
 */
export function getCurrentTheme(): "light" | "dark" {
  if (typeof document === "undefined") {
    return "light";
  }

  const root = document.documentElement;
  const theme = root.getAttribute(THEME_ATTRIBUTE);
  return (theme === "dark" ? "dark" : "light") as "light" | "dark";
}

/**
 * 从 localStorage 获取保存的主题模式
 */
export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "auto") {
      return stored;
    }
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
  }

  return "light";
}

/**
 * 保存主题模式到 localStorage
 */
export function setStoredThemeMode(theme: ThemeMode): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Failed to save theme to localStorage:", error);
  }
}

/**
 * 初始化主题系统
 * 应该在应用启动时调用
 */
export function initTheme(): void {
  const themeMode = getStoredThemeMode();
  applyTheme(themeMode);

  // 监听系统主题变化（仅在 auto 模式下有效）
  if (typeof window !== "undefined" && window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (): void => {
      const currentMode = getStoredThemeMode();
      if (currentMode === "auto") {
        applyTheme("auto");
      }
    };

    // 使用 addEventListener 替代已废弃的 addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // 兼容旧浏览器
      mediaQuery.addListener(handleChange);
    }
  }
}

/**
 * 切换主题
 */
export function setTheme(theme: ThemeMode): void {
  setStoredThemeMode(theme);
  applyTheme(theme);
}
