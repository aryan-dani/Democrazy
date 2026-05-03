import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

/** @typedef {import('eslint').Linter.Config} ESLintFlatConfig */

const nodeVitestGlobals = {
  ...globals.node,
  describe: "readonly",
  expect: "readonly",
  it: "readonly",
  vi: "readonly",
  beforeEach: "readonly",
  afterEach: "readonly",
};

const browserVitestGlobals = {
  ...globals.browser,
  ...nodeVitestGlobals,
};

/** @type {ESLintFlatConfig[]} */
export default [
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  {
    files: ["src/**/*.{test,spec}.{js,jsx}"],
    languageOptions: {
      globals: browserVitestGlobals,
    },
  },
  {
    files: [
      "vite.config.js",
      "eslint.config.js",
      "scripts/**/*.{js,mjs}",
      "api/**/*.js",
      "server/**/*.js",
    ],
    ignores: ["server/__tests__/**"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
  {
    files: ["server/__tests__/**/*.js", "src/**/__tests__/**/*.js"],
    languageOptions: {
      globals: nodeVitestGlobals,
    },
  },
  {
    files: ["vitest.setup.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
