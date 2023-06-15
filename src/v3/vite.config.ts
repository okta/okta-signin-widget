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
import { getResolveAlias, getViteServerProxy } from './buildUtils.js';

const outDir = resolve(__dirname, '../../dist/dist');

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
      OKTA_SIW_VERSION: '"0.0.0"',
      OKTA_SIW_COMMIT_HASH: '"local"',
      DEBUG: env.VITE_DEBUG,
    },
    resolve: {
      alias: getResolveAlias(mode),
    },

    // TODO: remove build section
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
      };

      if (mode === 'testcafe') {
        return base;
      }

      // default mode for build is "production"
      return {
        ...base,

        // hide sourcemaps
        sourcemap: false, // boolean | 'inline' | 'hidden'

        rollupOptions: {
          output: {
            assetFileNames: ({ name }) => (
              name?.endsWith('.css')
                ? 'css/okta-sign-in.next.css'
                : 'assets/[name][hash][extname]'
            ),
            entryFileNames: ({ name }) => {
              if (name === 'polyfills') {
                return 'js/okta-sign-in.next.polyfills.js';
              }
              return 'js/okta-sign-in.next.js';
            },
          },
        },
      };
    })(),

    server: {
      host: 'localhost',
      proxy: getViteServerProxy(),
      port: 3000,
    },
  };
});
