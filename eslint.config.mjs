import { defineConfig, globalIgnores } from 'eslint/config';
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...coreWebVitals,
  ...nextTypescript,
  prettier,
  globalIgnores(['.next/**', 'coverage/**', 'next-env.d.ts']),
]);
