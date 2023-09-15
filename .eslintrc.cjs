/* eslint-disable import/unambiguous, import/no-commonjs */
module.exports = {
  extends: ['next/core-web-vitals', '@nlib/eslint-config'],
  ignorePatterns: ['next-env.d.ts', 'cli/**', 'old-src/**'],
  rules: {
    'no-unused-private-class-members': 'off',
    'import/dynamic-import-chunkname': 'off',
    'import/no-default-export': 'off',
    'import/no-relative-parent-imports': 'off',
    'import/no-unassigned-import': ['error', { allow: ['**/*.scss'] }],
    '@typescript-eslint/no-restricted-imports': [
      'error',
      { patterns: ['**/*.mts'] },
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
      files: ['src/pages/**/*.tsx'],
      rules: { 'import/no-unassigned-import': 'off' },
    },
    {
      files: ['src/build/**/*.mts'],
      rules: { 'no-console': 'off' },
    },
  ],
};
