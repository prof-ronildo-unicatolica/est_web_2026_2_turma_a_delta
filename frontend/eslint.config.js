
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import reactX from "eslint-plugin-react-x";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      reactX.configs.recommended,
      reactRefresh.configs.vite(),
    ],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      "react-hooks": reactHooks,
    },

    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);
