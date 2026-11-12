import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // el build de Unity viene minificado y no es nuestro para arreglarlo
    "public/**",
    // el compilado de las Cloud Functions, que tiene sus propias reglas
    "functions/lib/**",
  ]),
]);

export default eslintConfig;
