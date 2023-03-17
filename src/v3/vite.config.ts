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
import { BuildOptions, defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';

const outDir = resolve(__dirname, '../../dist/dist');

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  root: command === 'serve' && mode === 'testcafe'
    ? outDir
    : process.cwd(),

  plugins: [
    preact(),
  ],
  define: {
    OKTA_SIW_VERSION: '"10.0.0"',
    OKTA_SIW_COMMIT_HASH: '"local"',
    DEBUG: true,
  },
  resolve: {
    alias: {
      '@okta/courage': resolve(__dirname, '../../packages/@okta/courage-dist'),
      '@okta/mocks': resolve(__dirname, '../../playground/mocks'),
      '@okta/okta-i18n-bundles': resolve(__dirname, '../util/Bundles.ts'),
      '@okta/qtip': resolve(__dirname, '../../packages/@okta/qtip2/dist/jquery.qtip.js'),
      'config': resolve(__dirname, '../config'),
      'nls': resolve(__dirname, '../../packages/@okta/i18n/src/json'),
      'okta': resolve(__dirname, '../../packages/@okta/courage-dist'),
      'src': resolve(__dirname, './src'),
      'util/BrowserFeatures': resolve(__dirname, `../util/BrowserFeatures`),
      'util/Bundles': resolve(__dirname, `../util/Bundles`),
      'util/Enums': resolve(__dirname, `../util/Enums`),
      'util/FactorUtil': resolve(__dirname, `../util/FactorUtil`),
      'util/Logger': resolve(__dirname, `../util/Logger`),
      'util/TimeUtil': resolve(__dirname, `../util/TimeUtil`),
      'v1': resolve(__dirname, '../v1'),
      'v2': resolve(__dirname, '../v2'),

      // react -> preact alias
      'react': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },

  build: ((): BuildOptions => {
    if (mode === 'production') {
      return {
        outDir,
        emptyOutDir: false,
        copyPublicDir: false,
        sourcemap: 'hidden',
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'OktaSignIn',
          formats: ['umd'],
          fileName: () => 'js/okta-sign-in.next.js',
        },
        rollupOptions: {
          output: {
            assetFileNames: ({ name }) => (
              name === 'style.css'
                ? 'css/okta-sign-in.next.css'
                : '[name][hash][extname]'
            )
          }
        }
      };
    }
    if (mode === 'testcafe') {
      return {
        outDir,
        sourcemap: 'inline',
        emptyOutDir: false,
        copyPublicDir: true,
      };
    }
    return {}
  })(),

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
}));
