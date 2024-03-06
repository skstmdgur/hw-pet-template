const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/*
 * This is a custom ESLint configuration for use with
 * typescript packages.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: ['@vercel/style-guide/eslint/node', '@vercel/style-guide/eslint/typescript'].map(
    require.resolve,
  ),
  parserOptions: {
    project,
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
  rules: {
    'unicorn/prefer-node-protocol': 'off',
    'import/no-default-export': 'off',
    'no-console': 'off',
    'import/newline-after-import': 'off',
    'no-empty': 'off',
    'no-await-in-loop': 'off',
    'tsdoc/syntax': 'off',
    'no-param-reassign': 'warn',
    'no-bitwise': 'off',
    'func-names': 'off',
    'import/no-named-as-default': 'off',
    'no-nested-ternary': 'off',
    'import/no-named-as-default-member': 'off',
    'unicorn/filename-case': 'off',
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/consistent-type-definitions': 'warn',
    'eslint-comments/require-description': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
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
    '@typescript-eslint/require-await': 'off',
    'no-param-reassign': 'off',
    'no-lonely-if': 'off',
    '@typescript-eslint/array-type': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/'],
}
