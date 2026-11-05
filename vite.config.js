import { defineConfig } from 'vite';
import { resolve } from 'path';

const root = resolve(__dirname, 'src');
const entryPath = resolve(__dirname, 'src/js/PerlinDom.js');

const alias = {
  '@': resolve(__dirname, './src'),
  '@js': resolve(__dirname, './src/js'),
  '@scss': resolve(__dirname, './src/scss'),
  '@assets': resolve(__dirname, './src/assets'),
};

// `vite build` (build:lib) -> library in dist/. `vite build --mode site` (build:site) -> pages in dist-site/.
export default defineConfig(({ mode }) => {
  if (mode === 'site') {
    return {
      root,
      base: './',
      publicDir: 'public',
      build: {
        outDir: resolve(__dirname, 'dist-site'),
        emptyOutDir: true,
        rollupOptions: {
          input: {
            index: resolve(root, 'index.html'),
            api: resolve(root, 'api.html'),
            examples: resolve(root, 'examples.html'),
          },
        },
      },
      resolve: { alias },
    };
  }
  return {
    root,
    publicDir: 'public',
    build: {
      lib: {
        entry: entryPath,
        name: 'PerlinDOM',
        formats: ['es', 'umd'],
        fileName: (format) => `perlindom.${format}.js`,
      },
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
    },
    resolve: { alias },
  };
});
