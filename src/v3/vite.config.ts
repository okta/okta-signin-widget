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
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import {
  BuildOptions,
  defineConfig,
  loadEnv,
  splitVendorChunkPlugin,
} from 'vite';

const outDir = resolve(__dirname, '../../dist/dist');
const mockServerBaseUrl = 'http://localhost:3030';

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    root: command === 'serve' && mode === 'testcafe'
      ? outDir
      : process.cwd(),
    plugins: [
      preact(),
      splitVendorChunkPlugin(),
    ],
    define: {
      OKTA_SIW_VERSION: '"7.8.0"',
      OKTA_SIW_COMMIT_HASH: '"local"',
      DEBUG: env.VITE_DEBUG,
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
    },
    resolve: {
      alias: {
        '@okta/courage': resolve(__dirname, '../../packages/@okta/courage-dist'),
        '@okta/mocks': resolve(__dirname, '../../playground/mocks'),
        '@okta/okta-i18n-bundles': resolve(__dirname, '../util/Bundles.ts'),
        '@okta/qtip': resolve(__dirname, '../../packages/@okta/qtip2/dist/jquery.qtip.js'),
        config: resolve(__dirname, '../config'),
        nls: resolve(__dirname, '../../packages/@okta/i18n/src/json'),
        okta: resolve(__dirname, '../../packages/@okta/courage-dist'),
        src: resolve(__dirname, './src'), // FIXME use relative imports
        'util/BrowserFeatures': resolve(__dirname, '../util/BrowserFeatures'),
        'util/Bundles': resolve(__dirname, '../util/Bundles'),
        'util/Enums': resolve(__dirname, '../util/Enums'),
        'util/FactorUtil': resolve(__dirname, '../util/FactorUtil'),
        'util/Logger': resolve(__dirname, '../util/Logger'),
        'util/TimeUtil': resolve(__dirname, '../util/TimeUtil'),
        v1: resolve(__dirname, '../v1'),
        v2: resolve(__dirname, '../v2'),

        duo_web_sdk: env.VITE_MOCK_DUO
          ? resolve(__dirname, 'src/__mocks__/duo_web_sdk') // mock
          : 'duo_web_sdk', // real

        // react -> preact alias
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },

    // not used in "dev" mode, i.e., when `command === 'serve'`
    build: ((): BuildOptions => {
      const base: BuildOptions = {
        // send output to ../../dist/dist
        outDir,

        // for debugging
        sourcemap: 'inline',

        // chained with g1,g2 in `yarn build:release`
        emptyOutDir: false,

        // playground assets, e.g., logo, favicon
        copyPublicDir: true,

        // TODO: remove or return to `true` before merging, this is just
        // to make it easier to inspect the bundle while editing configs
        minify: false,

        commonjsOptions: {
          include: [
            // Part of the default `include` rules, so we need to list it again here
            // since this array will overwrite the default
            /node_modules/,
            // Polyfill entry point uses `require`, so read it as CommonJS instead
            // of duplicating it as ESM for maintainability
            resolve(__dirname, '../..', 'polyfill/index.js'),
          ]
        }
      };

      if (mode === 'testcafe') {
        return base;
      }

      // default mode for build is "production"
      return {
        ...base,

        // generate sourcemaps
        sourcemap: true, // boolean | 'inline' | 'hidden'

        // set to library mode with "umd" format to expose `OktaSignIn` on the
        // `window`
        // https://vitejs.dev/guide/build.html#library-mode
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
            ),
          },
        },
      };
    })(),

    server: {
      host: 'localhost',
      proxy: {
        '/oauth2/': mockServerBaseUrl,
        '/api/v1/': mockServerBaseUrl,
        '/idp/idx/': mockServerBaseUrl,
        '/login/getimage': mockServerBaseUrl,
        '/sso/idps/': mockServerBaseUrl,
        '/app/UserHome': mockServerBaseUrl,
        '/oauth2/v1/authorize': mockServerBaseUrl,
        '/auth/services/': mockServerBaseUrl,
        '/.well-known/webfinger': mockServerBaseUrl,
      },
      port: 3000,
    },
  };
});
