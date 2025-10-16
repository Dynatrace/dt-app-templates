import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import noSecrets from "eslint-plugin-no-secrets";
import react from "eslint-plugin-react";
import security from "eslint-plugin-security";
import n from "eslint-plugin-n";
import nounsanitized from "eslint-plugin-no-unsanitized";
import pluginMicrosoftSdl from "@microsoft/eslint-plugin-sdl";

const noRestrictedImportsDynatraceStratoRule = [
  "error",
  {
    paths: [
      {
        name: "@dynatrace/strato-components-preview",
        message:
          "Please import from one of the sub packages, e.g. '@dynatrace/strato-components-preview/buttons' instead.",
      },
      {
        name: "@dynatrace/strato-components",
        message:
          "Please import from one of the sub packages, e.g. '@dynatrace/strato-components/buttons' instead.",
      },
      {
        name: "@dynatrace/strato-design-tokens",
        message:
          "Please import from one of the sub packages, e.g. '@dynatrace/strato-design-tokens/colors' instead.",
      },
    ],
    patterns: [
      {
        group: [
          "@dynatrace/strato-components-preview",
          "@dynatrace/strato-components-preview/*",
        ],
        importNames: [
          "Button",
          "Flex",
          "ProgressCircle",
          "Grid",
          "Divider",
          "Text",
          "Heading",
          "ExternalLink",
          "Link",
          "Container",
          "Strong",
          "Skeleton",
        ],
        message:
          "Please use the component from @dynatrace/strato-components instead.",
      },
    ],
  },
];

export default defineConfig([
  globalIgnores([
    "**/node_modules",
    "**/dist",
    "**/.dt-app",
    "**/app.config.*",
    "**/jest.*config.js",
    "**/eslint.config.mjs",
  ]),
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: [
      "**/*.action.*",
      "**/*.widget.*",
      "**/*.test.ts",
      "**/test-utils.ts",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
    },
    plugins: {
      eslint,
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      noSecrets,
      security,
      n,
      nounsanitized,
      "@microsoft/sdl": pluginMicrosoftSdl,
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      react.configs.flat.recommended,
      nounsanitized.configs.recommended,
    ],
    rules: {
      "no-eval": "error",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-deprecated": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/no-danger": "warn",
      "react/jsx-no-script-url": "warn",
      "nounsanitized/method": "warn",
      "nounsanitized/property": "warn",
      "@microsoft/sdl/no-inner-html": "warn",
      "@microsoft/sdl/no-document-write": "warn",
      "noSecrets/no-secrets": [
        "error",
        {
          additionalRegexes: {
            "Dynatrace Token":
              "dt0[a-zA-Z]{1}[0-9]{2}\\.[A-Z0-9]{8,24}\\.[A-Z0-9]{64}",
          },
        },
      ],
      "no-restricted-imports": noRestrictedImportsDynatraceStratoRule,
    },
  },
  {
    files: ["**/*.action.ts", "**/*.widget.tsx"],
    ignores: ["**/*.test.ts", "**/test-utils.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
      },
    },
    plugins: {
      eslint,
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      noSecrets,
      security,
      n,
      nounsanitized,
      "@microsoft/sdl": pluginMicrosoftSdl,
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      react.configs.flat.recommended,
      nounsanitized.configs.recommended,
    ],
    rules: {
      "no-eval": "error",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "react/no-danger": "warn",
      "react/jsx-no-script-url": "warn",
      "nounsanitized/method": "warn",
      "nounsanitized/property": "warn",
      "@microsoft/sdl/no-inner-html": "warn",
      "@microsoft/sdl/no-document-write": "warn",
      "noSecrets/no-secrets": [
        "error",
        {
          additionalRegexes: {
            "Dynatrace Token":
              "dt0[a-zA-Z]{1}[0-9]{2}\\.[A-Z0-9]{8,24}\\.[A-Z0-9]{64}",
          },
        },
      ],
      "no-restricted-imports": noRestrictedImportsDynatraceStratoRule,
    },
  },
]);
