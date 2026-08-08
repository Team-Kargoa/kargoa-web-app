import { defineConfig, globalIgnores } from 'eslint/config';
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...coreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      // Server actions bound to useActionState must keep the
      // (prevState, formData) signature even when a given action (e.g.
      // approveDriverAction) doesn't read one of them — the leading
      // underscore is the intentional "deliberately unused" marker, not a
      // stray parameter to delete.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  globalIgnores(['.next/**', 'coverage/**', 'next-env.d.ts']),
]);
