import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { security },
    rules: {
      ...security.configs.recommended.rules,
      // Downgrade to warn — many flags in Next.js are false positives
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-fs-filename": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated files
    "src/generated/**",
    // Coverage reports
    "coverage/**",
  ]),
]);

export default eslintConfig;
