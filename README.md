## 项目说明

本项目为基于 Vite + React + TypeScript 的 PC 端前端应用，代码规范参考了以下项目中沉淀下来的实践，并在此基础上做了统一与取舍：

- `ManageMinds-front-vite`（Vite + React 前台项目）
- `my-project/admin`（Webpack + React 后台前端项目）
- `my-project/integrated-front-web`（Vite + React 集成前端项目）
- `my-project/asp-admin-service`、`my-project/asp-ScreenFlow-service`、`allinone-backend-serve`（NestJS/Node 后端项目，主要参考其 TypeScript 规则）

当前仓库的 ESLint / Prettier 版本与这些项目保持同一大版本区间，适合在同一台机器上协同开发。

---

## 代码规范总览

本项目采用「**Prettier 负责格式、ESLint 负责质量与部分风格**」的思路，结合上述项目的经验，抽取出一套统一规范。

### Prettier 配置（`.prettierrc` 最终规范）

来源对比：

- `integrated-front-web`：偏向 **单引号、arrowParens: "avoid"**，并对 `md/json/yaml/scss` 做了 overrides。
- 多个后端项目：统一 **行宽 100、tabWidth 2、endOfLine 为 lf**，与 CI 和 EditorConfig 强一致。
- 本项目：保持 **行宽 100、双引号、endOfLine 为 lf**，与现有代码风格最兼容。

综合取舍后，本项目采用如下 Prettier 规范（与当前 `.prettierrc` 一致，只建议后续可补充 overrides）：

```json
{
  "singleQuote": false,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "arrowParens": "always",
  "proseWrap": "never",
  "htmlWhitespaceSensitivity": "strict",
  "jsxSingleQuote": false,
  "quoteProps": "as-needed",
  "bracketSameLine": false
}
```

> 可选增强（来自 `integrated-front-web`）：
>
> - 为 `*.md` 设置 `proseWrap: "preserve"`，为 `*.json` 调整 `printWidth` 与 `trailingComma`，按需加在 `overrides` 中。

### ESLint 配置（`eslint.config.js` 最终规范）

来源对比：

- `ManageMinds-front-vite` / `my-project/admin`：
  - 使用 Flat Config，整合 `react` / `react-hooks` / `react-refresh` / `import` / `@typescript-eslint` / `prettier` 等插件；
  - 通过 `eslint-config-prettier` 或 `eslint-plugin-prettier` 解决与 Prettier 的冲突；
  - 前端项目统一使用 `@` 作为 `src` 目录别名。
- `asp-*` / `allinone-backend-serve`：
  - 更偏重 **TypeScript 严格度**（`no-explicit-any`、命名规范、member-ordering、Promise 相关规则等）。

本项目在这些规则基础上做了以下关键取舍：

- **React + TS 场景**
  - 关闭 `react/prop-types`，以 TypeScript 类型为唯一来源：

    ```js
    "react/prop-types": "off",
    ```

  - 保留 React Hooks 与 Refresh 相关推荐规则：

    ```js
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
    ```

- **TypeScript 严格度**
  - 对 `any` 保持「有提示但不过分阻塞」的策略：

    ```js
    "@typescript-eslint/no-explicit-any": "warn",
    ```

  - 使用 `@typescript-eslint/no-unused-vars` 统一管理未使用变量，并忽略 `_` 前缀参数：

    ```js
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "^React$",
        argsIgnorePattern: "^_",
        ignoreRestSiblings: true
      }
    ]
    ```

  - 保留接口、类型、枚举等命名规范，与 `asp-*` 项目保持一致：

    ```js
    "@typescript-eslint/naming-convention": [
      "error",
      { selector: "interface", format: ["PascalCase"], prefix: ["I"] },
      { selector: "class", format: ["PascalCase"] },
      { selector: "typeAlias", format: ["PascalCase"] },
      { selector: "enum", format: ["PascalCase"] }
    ]
    ```

- **导入顺序与别名**

  参考 `ManageMinds-front-vite` 与 `integrated-front-web` 的配置，本项目统一使用以下导入顺序规则：

  ```js
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
        "type"
      ],
      pathGroups: [
        { pattern: "react", group: "external", position: "before" },
        { pattern: "{react-dom,react-router-dom}", group: "external", position: "before" },
        { pattern: "@/**", group: "internal", position: "after" }
      ],
      pathGroupsExcludedImportTypes: ["react", "react-dom", "react-router-dom"],
      "newlines-between": "always",
      alphabetize: { order: "asc", caseInsensitive: true }
    }
  ]
  ```

- **通用与风格规则（与历史项目收敛后保留的部分）**

  ```js
  // 通用
  "no-console": ["warn", { allow: ["log", "warn"] }],
  "no-debugger": "warn",
  "prefer-const": "error",
  "no-var": "error",
  "eqeqeq": ["error", "always"],
  "no-multiple-empty-lines": ["error", { max: 1 }],
  "no-param-reassign": "error",

  // 代码长度与复杂度（取中等强度）
  "max-lines": ["error", { max: 300 }],
  "max-len": [
    "error",
    {
      code: 100,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true
    }
  ]
  ```

> 说明：在 `my-project/admin`、`asp-*` 等项目中，`no-explicit-any`、成员顺序、函数参数个数等规则更为严格。当前仓库选择了**稍弱一档**的强度，以保证业务开发体验，在核心模块上如有需要可以单独加严。

---

## 如何在本项目中使用这些规范

- 安装依赖（已在 `package.json` 中声明）：

  ```bash
  pnpm install
  ```

- 格式化与校验命令（建议在 CI 中统一使用）：

  ```bash
  # 仅检查
  pnpm lint

  # 仅格式化
  pnpm format

  # 检查并尝试修复
  pnpm lint:fix
  ```

- VSCode 中建议：
  - 启用 `editor.formatOnSave`，默认 formatter 选择 Prettier；
  - 开启 `source.fixAll.eslint`（可根据团队习惯决定是保存自动执行还是手动触发）。

如后续你希望把「Prettier 只管格式、ESLint 不再管缩进/引号/分号」彻底落地，我可以再基于当前 `eslint.config.js` 和这些历史项目的配置，给出一份进一步拆分后的最终版 ESLint 配置。
