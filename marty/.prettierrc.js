module.exports = {
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'all',
  singleQuote: true,
  bracketSpacing: true,
  semi: false,
  useTabs: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  proseWrap: 'preserve',
  bracketSameLine: false,
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
        tabWidth: 2,
      },
    },
    {
      files: ['*.mts', '*.cts', '*.ts', '*.tsx'],
      options: {
        parser: 'typescript',
      },
    },
  ],
}
