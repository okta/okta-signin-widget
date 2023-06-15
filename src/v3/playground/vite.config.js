import { resolve } from 'path';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { getViteServerProxy } from '../buildUtils.js';

export default defineConfig({
  publicDir: resolve(__dirname),
  plugins: [
    createHtmlPlugin({
      minify: false,
      template: 'index.html',
    }),
  ],
  server: {
    host: 'localhost',
    proxy: getViteServerProxy(),
    port: 3010,
  },
});