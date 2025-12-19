export default {
  // TypeScript/JavaScript 文件：ESLint 检查和修复 + Prettier 格式化
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],

  // 样式文件：Stylelint 检查和修复 + Prettier 格式化
  "*.{css,scss,less}": ["stylelint --fix", "prettier --write"],

  // JSON/YAML/Markdown/HTML 文件：仅 Prettier 格式化
  "*.{json,jsonc,yml,yaml,md,html}": ["prettier --write"],

  // 配置文件：仅 Prettier 格式化
  "*.{config.js,config.ts,config.cjs,config.mjs}": ["prettier --write"],
};
