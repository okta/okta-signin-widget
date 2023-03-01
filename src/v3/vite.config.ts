/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { defineConfig, splitVendorChunkPlugin } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { readFileSync } from 'fs';
// import legacy from '@vitejs/plugin-legacy';
import { ModuleFormat } from 'rollup';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    splitVendorChunkPlugin(),
    // legacy({
    //   targets: [
    //     'defaults',
    //     'not dead',
    //     '>= 0.025%',
    //     'ie 11',
    //     'safari >= 8',
    //     'android >= 4.4.4'
    //   ],
    // }),
  ],
  define: {
    OKTA_SIW_VERSION: '"0.0.0"',
    OKTA_SIW_COMMIT_HASH: '"67f7d01358bee1853391565b300f196dc5291ce2"',
    DEBUG: true,
  },
  resolve: {
    alias: {
      '@okta/courage': resolve(__dirname, '../../packages/@okta/courage-dist'),
      '@okta/mocks': resolve(__dirname, '../../playground/mocks'),
      'config': resolve(__dirname, '../config'),
      'nls': resolve(__dirname, '../../packages/@okta/i18n/src/json'),
      'okta-i18n-bundles': resolve(__dirname, '../util/Bundles.ts'),
      'okta': resolve(__dirname, '../../packages/@okta/courage-dist'),
      'qtip': resolve(__dirname, '../../packages/@okta/qtip2/dist/jquery.qtip.js'),
      'src': resolve(__dirname, './src'),
      'util': resolve(__dirname, '../util'),
      'v1': resolve(__dirname, '../v1'),
      'v2': resolve(__dirname, '../v2'),

      // react -> preact alias
      'react': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OktaSignIn',
      formats: ['umd', 'es'],
      fileName: (fmt, entry) => {
        const ext: Record<ModuleFormat, string> = {
          es: 'mjs',
          cjs: 'js',
          umd: 'min.js',
          iife: 'min.js',
        }[fmt];
        return `js/okta-sign-in.${ext}`;
      },
    },
    sourcemap: true,
    // https://rollupjs.org/guide/en/#big-list-of-options
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       lodash: [
    //         'lodash',
    //       ],
    //       mui: [
    //         '@mui/material',
    //       ],
    //       chroma: [
    //         'chroma-js',
    //       ],
    //       authjs: [
    //         '@okta/okta-auth-js',
    //       ],
    //       odyssey: [
    //         '@okta/odyssey-design-tokens',
    //         '@okta/odyssey-react',
    //         '@okta/odyssey-react-mui',
    //         '@okta/odyssey-react-theme',
    //       ],
    //     },
    //   },
    // },
  },
  server: {
    host: 'localhost',
    port: 8080,
    // https: (() => {
    //   try {
    //     return {
    //       key: readFileSync(resolve(__dirname, '.https/localhost-key.pem')),
    //       cert: readFileSync(resolve(__dirname, '.https/localhost-cert.pem')),
    //     };
    //   } catch (err) {
    //     throw new Error('run scripts/generate-certs');
    //   }
    // })(),
  },
});