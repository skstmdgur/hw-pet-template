import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    dts: true,
    format: ['esm', 'cjs', 'iife'],
    minify: !options.watch,
    entry: ['src/index.ts'],
    target: 'es5',
    splitting: false,
    sourcemap: true,
    clean: true,
  };
});
