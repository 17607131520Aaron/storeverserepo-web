/**
 * 主题修复工具
 * 完全零侵入：自动修复内联样式中的硬编码颜色，无需修改任何组件代码
 */

/**
 * 修复元素的内联样式，将硬编码的颜色替换为 CSS 变量
 */
function fixElementStyles(element: HTMLElement): void {
  if (!element || !element.style) {
    return;
  }

  const style = element.style;
  const currentTheme = document.documentElement.getAttribute("data-theme");

  // 只在暗色主题下修复
  if (currentTheme !== "dark") {
    return;
  }

  // 修复背景色 - 白色背景
  const bgColor = style.backgroundColor || style.background || "";
  const whiteBgPatterns = ["#fff", "white", "rgb(255", "rgba(255"];
  if (whiteBgPatterns.some((pattern) => bgColor.toLowerCase().includes(pattern))) {
    // 添加 data-theme-fixed 标记，避免重复处理
    if (!element.hasAttribute("data-theme-fixed-bg")) {
      element.setAttribute("data-theme-fixed-bg", "true");
      style.setProperty("background-color", "var(--color-bg)", "important");
    }
  }

  // 修复文字颜色 - 常见的深色文字在暗色主题下需要变亮
  const textColor = style.color || "";
  const darkTextPatterns = ["#1f2937", "#4b5563", "#6b7280", "#595959", "#8c8c8c", "#000"];
  if (darkTextPatterns.some((pattern) => textColor.includes(pattern))) {
    if (!element.hasAttribute("data-theme-fixed-color")) {
      element.setAttribute("data-theme-fixed-color", "true");
      style.setProperty("color", "var(--color-text-primary)", "important");
    }
  }
}

/**
 * 批量修复页面中的所有元素
 */
function fixPageStyles(): void {
  // 查找所有包含内联样式的元素
  const elements = document.querySelectorAll<HTMLElement>(
    "[style]:not([data-theme-fixed-bg]):not([data-theme-fixed-color])",
  );

  elements.forEach((element) => {
    const style = element.getAttribute("style");
    if (!style) {
      return;
    }

    // 检查是否包含需要修复的颜色
    const needsFix =
      style.includes("#fff") ||
      style.includes("white") ||
      style.includes("#1f2937") ||
      style.includes("#4b5563") ||
      style.includes("#6b7280") ||
      style.includes("#595959") ||
      style.includes("#8c8c8c");

    if (needsFix) {
      fixElementStyles(element);
    }
  });
}

/**
 * 监听主题变化，自动修复样式
 * 完全零侵入，无需修改任何组件代码
 */
export function initThemeFix(): void {
  // 初始修复
  const fix = (): void => {
    requestAnimationFrame(() => {
      fixPageStyles();
    });
  };

  // 延迟执行，确保 DOM 已渲染
  setTimeout(fix, 100);

  // 监听主题变化
  const themeObserver = new MutationObserver(() => {
    // 清除之前的标记，重新处理
    document.querySelectorAll("[data-theme-fixed-bg]").forEach((el) => {
      el.removeAttribute("data-theme-fixed-bg");
    });
    document.querySelectorAll("[data-theme-fixed-color]").forEach((el) => {
      el.removeAttribute("data-theme-fixed-color");
    });
    fix();
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // 监听 DOM 变化（新元素添加时）
  const domObserver = new MutationObserver(() => {
    fix();
  });

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
