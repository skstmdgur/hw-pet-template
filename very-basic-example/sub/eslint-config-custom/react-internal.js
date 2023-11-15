const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/*
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    '@vercel/style-guide/eslint/browser',
    '@vercel/style-guide/eslint/typescript',
    '@vercel/style-guide/eslint/react',
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  globals: {
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/', '.eslintrc.js'],

  rules: {
    // add specific rules configurations here
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    'no-await-in-loop': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    camelcase: 'off',
    'no-lonely-if': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'import/no-default-export': 'off',
    'func-names': 'off',
    'no-empty': 'off',
    'no-alert': 'off',
    '@typescript-eslint/prefer-reduce-type-parameter': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    'no-return-await': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/ban-types': 'off',
    'tsdoc/syntax': 'off',
    '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    '@typescript-eslint/no-loop-func': 'off',
    '@typescript-eslint/no-dynamic-delete': 'off',
    'no-implicit-coercion': 'warn',
    'unicorn/filename-case': 'off',
    'no-param-reassign': 'off',
    'prefer-named-capture-group': 'off',
    'import/no-named-as-default-member': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/prefer-for-of': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'import/no-named-as-default': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'eslint-comments/require-description': 'off',
    'react/no-array-index-key': 'warn',
    'object-shorthand': 'warn',
    'no-nested-ternary': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/consistent-type-definitions': 'warn',
    'react/function-component-definition': 'off',
  },
}
