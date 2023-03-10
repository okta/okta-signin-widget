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

/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { ModuleFormat } from 'rollup';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const cjs = ([name]: TemplateStringsArray) => ({
  find: name,
  replacement: require.resolve(name),
})
/*
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: [
      { find: 'react', replacement: 'preact/compat' },
      { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
      { find: 'react-dom', replacement: 'preact/compat' },
      { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' }
    ]
  },
  test: {
    globals: true, // for jest-dom
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: false,
    alias: [
      // cjs libs: https://github.com/vitest-dev/vitest/issues/1652
      cjs`preact/hooks`,
      cjs`@testing-library/preact`
    ],
  }
});
 */

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    // splitVendorChunkPlugin(),
  ],
  define: {
    OKTA_SIW_VERSION: '"0.0.0"',
    VERSION: '"0.0.0"',
    OKTA_SIW_COMMIT_HASH: '"67f7d01358bee1853391565b300f196dc5291ce2"',
    COMMITHASH: '"67f7d01358bee1853391565b300f196dc5291ce2"',
    DEBUG: true,
  },
  resolve: {
    alias: {
      '@okta/courage': resolve(__dirname, '../../packages/@okta/courage-dist'),
      '@okta/mocks': resolve(__dirname, '../../playground/mocks'),
      'config': resolve(__dirname, '../config'),
      'nls': resolve(__dirname, '../../packages/@okta/i18n/src/json'),
      '@okta/okta-i18n-bundles': resolve(__dirname, '../util/Bundles.ts'),
      'okta': resolve(__dirname, '../../packages/@okta/courage-dist'),
      '@okta/qtip': resolve(__dirname, '../../packages/@okta/qtip2/dist/jquery.qtip.js'),
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
  },
  server: {
    host: 'localhost',
    proxy: {
      '/oauth2/': 'http://localhost:3030',
      '/api/v1/': 'http://localhost:3030',
      '/idp/idx/': 'http://localhost:3030',
      '/login/getimage': 'http://localhost:3030',
      '/sso/idps/': 'http://localhost:3030',
      '/app/UserHome': 'http://localhost:3030',
      '/oauth2/v1/authorize': 'http://localhost:3030',
      '/auth/services/': 'http://localhost:3030',
      '/.well-known/webfinger': 'http://localhost:3030',
    },
    port: 3000,
  },
});
