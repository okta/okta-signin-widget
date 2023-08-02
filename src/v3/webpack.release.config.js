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

const { resolve } = require('path');
const { readFileSync } = require('fs');

const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const terserOptions = require('../../scripts/buildtools/terser/config');
const baseConfig = require('./webpack.common.config');

const prodConfig = merge(
  baseConfig,
  {
    mode: 'production',
    devtool: 'source-map',
    entry: {
      default: {
        import: [
          // polyfill must appear first in entry point array
          resolve(__dirname, '../..', './polyfill/modern.js'),
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
    },
    resolve: {
      alias: {
        duo_web_sdk: 'duo_web_sdk',
      }
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/okta-sign-in.min.css',
      }),
      // OKTA-429162: webpack-bundle-analyzer does not report bundled modules stats after
      // upgrade to webpack@5
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
            // `banner` config option is intended for a message pointing to file containing
            // license info. We use it to place a single Okta license banner.
            banner: readFileSync(resolve(__dirname, '..', 'widget/copyright.txt'), 'utf8'),
          },
        }),
      ],
    },
  },
);

module.exports = prodConfig;