import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default [
  {
    ignores: [
      "dist",
      "node_modules",
      "*.min.js",
      "*.d.ts",
      "build",
      "coverage",
      "public/**",
      "config/**",
    ],
  },
  // 关闭与 Prettier 冲突的规则，格式完全交给 Prettier
  eslintConfigPrettier,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["eslint.config.js"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
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
      "unused-imports": unusedImports,
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
          map: [["@", "./src"]],
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".less", ".scss"],
        },
      },
    },
    rules: {
      // ========= React 相关 =========
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-key": "error",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "react/jsx-boolean-value": ["error", "never"],
      "react/self-closing-comp": "error",
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          shorthandFirst: true,
          ignoreCase: true,
          reservedFirst: true,
        },
      ],

      // ========= TypeScript 严格规则 =========
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            constructors: "no-public",
            accessors: "explicit",
            methods: "explicit",
            properties: "explicit",
            parameterProperties: "explicit",
          },
        },
      ],

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off", // 交给 unused-imports 管
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^React$|^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      // 强制类型导入单独一行，禁止混合导入
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports", // 强制使用单独的 type import
        },
      ],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        {
          assertionStyle: "as",
          objectLiteralTypeAssertions: "never",
        },
      ],
      // "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "no-return-await": "off",
      "@typescript-eslint/return-await": ["error", "always"],

      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          minimumDescriptionLength: 10,
        },
      ],

      // ========= 命名 & 成员顺序 =========
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"],
        },
        // {
        //   selector: "class",
        //   format: ["PascalCase"],
        // },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
        },
        {
          selector: "enum",
          format: ["PascalCase"],
          prefix: ["E"],
        },
        // {
        //   selector: "variable",
        //   format: ["camelCase", "UPPER_CASE"],
        // },
        // {
        //   selector: "function",
        //   format: ["camelCase"],
        // },
      ],
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: {
            memberTypes: [
              "signature",
              "public-static-field",
              "protected-static-field",
              "private-static-field",
              "public-instance-field",
              "protected-instance-field",
              "private-instance-field",
              "constructor",
              "public-static-method",
              "protected-static-method",
              "private-static-method",
              "public-instance-method",
              "protected-instance-method",
              "private-instance-method",
            ],
          },
        },
      ],

      // ========= 通用 & 最佳实践 =========
      "no-console": ["warn", { allow: ["warn", "error", "info", "log"] }],
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-var": "error",
      // 禁用 no-duplicate-imports，使用 import/no-duplicates 代替（支持类型导入分离）
      "no-duplicate-imports": "off",
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
      "no-param-reassign": "error",

      // ========= 导入规则 =========
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/order": [
        "error",
        {
          // 导入顺序：
          // 1. react 库（第一行，单独分组）
          // 2. 其他第三方依赖（external）
          // 3. 项目内部别名（internal，如 @/**）
          // 4. 当前项目内的相对路径（parent/sibling）
          // 5. 样式文件（css/scss/less）始终在最后
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
              // react 单独分组，始终在第一行
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              // react 相关的其他库紧随其后
              pattern: "{react-dom,react-router-dom}",
              group: "external",
              position: "before",
            },
            {
              // 项目内部别名（@/**）在第三方库之后
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
            {
              // 相对路径文件在项目别名之后
              pattern: "./**",
              group: "sibling",
              position: "after",
            },
            {
              // 样式文件始终放在最后
              pattern: "**/*.{css,scss,less}",
              group: "index",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "react-dom", "react-router-dom"],
          "newlines-between": "always",
          // 字母排序，但 pathGroups 的优先级更高
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          // 确保 pathGroups 的优先级高于 alphabetize
          warnOnUnassignedImports: false,
        },
      ],
      // 禁止混合导入（值导入和类型导入不能在同一行），强制类型导入单独一行
      "import/no-duplicates": ["error", { "prefer-inline": false }],

      // ========= 复杂度 & 风格（不和 Prettier 冲突）=========
      "max-lines": ["error", { max: 500 }],
      // "max-lines-per-function": ["error", { max: 200 }],
      "max-params": ["error", { max: 4 }],
      "max-len": [
        "error",
        {
          code: 120,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],

      // 这些细节交给 Prettier，所以这里关掉
      indent: "off",
      quotes: "off",
      semi: "off",
      "comma-dangle": "off",
    },
  },
  // 为配置文件单独配置，不使用类型检查
  {
    files: ["eslint.config.js", "vite.config.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        // 不启用 project，避免类型检查
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
    },
    rules: {
      // 配置文件可以适当放宽规则
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
];
