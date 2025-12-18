import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  {
    ignores: [
      "dist",
      "node_modules",
      "*.min.js",
      "*.d.ts",
      "vite.configPlugins.ts",
      "build",
      "coverage",
    ],
  },
  eslintConfigPrettier,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react,
      import: importPlugin,
      "@typescript-eslint": tseslint,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        alias: {
          map: [
            ["@", "./src"], // 假设你的项目中 '@' 别名指向 'src' 目录
          ],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      // React 相关规则
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-key": "error",
      // 使用 TypeScript 时不再强制要求 propTypes
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",

      // TypeScript 相关规则
      "@typescript-eslint/explicit-function-return-type": "off",
      // 大型业务项目中对 any 保持一定弹性，避免开发体验过差
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^React$",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      ...reactHooks.configs.recommended.rules, // 检查 React Hooks 的使用是否符合最佳实践
      ...reactRefresh.configs.recommended.rules, // 检查 React 组件是否只导出常量
      ...react.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,

      // 通用规则
      "no-console": ["warn", { allow: ["log", "warn"] }],
      "no-debugger": "warn",
      "no-unused-vars": "off", // 使用 TypeScript 的规则替代
      "prefer-const": "error",
      "no-var": "error",

      // 最佳实践
      eqeqeq: ["error", "always"],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      // 'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: true }],
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
      "no-param-reassign": "error",

      // 导入规则
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "{react-dom,react-router-dom}",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "react-dom", "react-router-dom"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // 代码复杂度与长度（不与 Prettier 冲突）
      "max-lines": ["error", { max: 300 }],
      "max-len": [
        "error",
        {
          code: 100,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],

      // 命名规范
      camelcase: [
        "error",
        {
          properties: "never",
          ignoreDestructuring: true,
        },
      ],

      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"],
        },
        {
          selector: "class",
          format: ["PascalCase"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
        {
          selector: "enum",
          format: ["PascalCase"],
        },
      ],

      // 交给 Prettier 管的风格类规则全部关闭，避免重复 / 冲突
      indent: "off",
      quotes: "off",
      semi: "off",
      "comma-dangle": "off",
    },
  },
];
