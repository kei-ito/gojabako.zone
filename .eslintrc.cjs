/* eslint-disable import/unambiguous, import/no-commonjs */
const { builtinModules } = require('node:module');

module.exports = {
  extends: ['next/core-web-vitals', '@nlib/eslint-config'],
  ignorePatterns: ['next-env.d.ts', 'cli/**', 'old-src/**'],
  rules: {
    'no-restricted-globals': ['error', 'location'],
    'import/no-relative-parent-imports': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: builtinModules.map((name) => ({
          name,
          message: `Please use 'node:${name}' instead.`,
        })),
        patterns: ['**/*.mjs'],
      },
    ],
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks:
          '(useRecoilCallback|useRecoilTransaction_UNSTABLE|useKeyboardEventHandler)',
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.*'],
      rules: {
        'max-lines-per-function': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
    {
      files: [
        'next.config.mjs',
        'src/app/**/page.tsx',
        'src/app/**/layout.tsx',
        'src/app/**/template.tsx',
        'src/app/**/opengraph-image.tsx',
        'src/app/**/icon.tsx',
        'src/app/**/apple-icon.tsx',
      ],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['src/cli/*', 'src/components/DistributedReversi/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
