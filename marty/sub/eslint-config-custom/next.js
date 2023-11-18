const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/*
 * This is a custom ESLint configuration for use with
 * Next.js apps.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/browser',
    '@vercel/style-guide/eslint/typescript',
    '@vercel/style-guide/eslint/react',
    '@vercel/style-guide/eslint/next',
    'eslint-config-turbo',
  ].map(require.resolve),
  parserOptions: {
    project: '@typescript-eslint/parser',
  },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    'node_modules/',
    '**/node_modules/',
    '/**/node_modules/*',
    'out/',
    'dist/',
    'build/',
  ],
  // add rules configurations here
  rules: {
    '@typescript-eslint/no-unnecessary-type-arguments': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-new': 'off',
    'no-alert': 'off',
    camelcase: 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-nested-ternary': 'off',
    '@typescript-eslint/consistent-type-definitions': 'warn',
    'import/order': 'off',
    'react/jsx-no-leaked-render': 'off',
    'eslint-comments/require-description': 'off',
    'react/no-danger': 'off',
    'react/jsx-sort-props': 'off',
    'tsdoc/syntax': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-shadow': 'warn',
    'no-console': 'off',
    'unicorn/filename-case': 'off',
    'import/no-default-export': 'off',

    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-await-in-loop': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    // '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/require-await': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    'no-await-in-loop': 'off',
    'no-new-func': 'off',
    '@typescript-eslint/no-loop-func': 'off',
    'func-names': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    // added rules
    '@typescript-eslint/prefer-includes': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/array-type': 'off',
    'no-promise-executor-return': 'off',
    'no-implicit-coercion': 'off',
    'no-else-return': 'off',
    '@typescript-eslint/consistent-indexed-object-style': 'off',
    'no-case-declarations': 'off',
  },
}
