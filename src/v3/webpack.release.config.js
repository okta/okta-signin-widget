/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const { resolve, join } = require('path');
const { readFileSync } = require('fs');

const webpack = require('webpack');
const { mergeWithCustomize } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const terserOptions = require('../../scripts/buildtools/terser/config');
const makeConfig = require('./webpack.common.config');

const ASSETS = resolve(__dirname, '../..', 'assets');

// TODO: remove customize if not used
// TODO handle analyzer file
const prodConfig = mergeWithCustomize({
})(
  makeConfig(),
  {
    mode: 'production',
    devtool: 'source-map',
    entry: {
      default: {
        import: [
          // polyfill must appear first in entry point array
          resolve(__dirname, '../..', './polyfill/index.js'),
          resolve(__dirname, 'src/index.ts'),
        ],
        filename: 'js/okta-sign-in.min.js',
        library: {
          name: 'OktaSignIn',
          type: 'umd',
          export: 'default',
        },
      },
      noPolyfill: {
        import: [
          resolve(__dirname, 'src/index.ts'),
        ],
        filename: 'js/okta-sign-in.no-polyfill.min.js',
        library: {
          name: 'OktaSignIn',
          type: 'umd',
          export: 'default',
        },
      },
      // a11y: {
      //   import: resolve(__dirname, '../'),
      //   library: {
      //     name: 'OktaSignIn',
      //     type: 'umd',
      //     export: 'default',
      //   },
      // },
      css: {
        import: `${ASSETS}/sass/okta-sign-in.scss`,
        filename: 'css/okta-sign-in.css',
      },
    },
    resolve: {
      alias: {
        duo_web_sdk: 'duo_web_sdk',
      }
    },
    plugins: [
      // OKTA-429162: webpack-bundle-analyzer does not report bundled modules stats after upgrade to webpack@5
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        reportFilename: 'okta-sign-in.analyzer.next.html',
        analyzerMode: 'static',
        defaultSizes: 'stat',
      }),
      new webpack.DefinePlugin({
        DEBUG: false,
      }),
    ],
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions,
          extractComments: {
            // `banner` config option is intended for a message pointing to file containing license info
            // we use it to place single Okta license banner
            banner: readFileSync(join(__dirname, '../widget/copyright.txt'), 'utf8'),
          },
        }),
      ],
    },
  },
);

console.warn('prodConfig', prodConfig);

module.exports = prodConfig;