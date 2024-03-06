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

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'prettier',
    require.resolve('@vercel/style-guide/eslint/react'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
    'eslint-config-turbo',
  ],
  plugins: ['only-warn', '@typescript-eslint'],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    browser: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'dist/',
  ],
  overrides: [
    // Force ESLint to detect .tsx files
    { files: ['*.js?(x)', '*.ts?(x)'] },
  ],
  rules: {
    'no-unused-vars': 'off',
    'no-new-func': 'off',
    'func-names': 'off',
    'no-console': 'off',
    'no-undef': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'turbo/no-undeclared-env-vars': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'react/jsx-sort-props': 'off',
  },
}
