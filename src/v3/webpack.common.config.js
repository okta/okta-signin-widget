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

const webpack = require('webpack');

const PLAYGROUND = resolve(__dirname, '../..', 'playground');

module.exports = () => {
  return {
    mode: 'production',
    devtool: 'source-map',
    output: {
      path: resolve(__dirname, '../..', 'dist/dist'),
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude(filePath) {
            const filePathContains = (f) => filePath.indexOf(f) > 0;
            const npmRequiresTransform = [
              '/node_modules/parse-ms',
              '/node_modules/@sindresorhus/to-milliseconds',
              '/node_modules/@okta/odyssey-react-mui',
              '/node_modules/@mui',
              '/node_modules/@okta/okta-auth-js',
              '/node_modules/p-cancelable',
            ].some(filePathContains);
            const shallBeExcluded = [
              '/node_modules/',
              'packages/@okta/qtip2',
            ].some(filePathContains);

            return shallBeExcluded && !npmRequiresTransform;
          },
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            presets: [
              [
                '@babel/preset-env',
                {
                  // TODO: resolve issue with authjs esm bundle, then switch to "usage" to reduce polyfill size
                  useBuiltIns: 'entry',
                  corejs: '3.9',
                },
              ],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              [
                '@babel/plugin-transform-react-jsx',
                {
                  runtime: 'automatic',
                  importSource: 'preact',
                },
              ],
            ],
          },
        },
        {
          test: /\.s?css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true,
              },
            },
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  includePaths: ['target/sass'],
                  outputStyle: 'expanded',
                },
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          loader: 'svg-inline-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx'],
      alias: {
        '@okta/okta-auth-js': resolve(__dirname, 'node_modules/@okta/okta-auth-js/esm/browser/exports/exports/idx.js'),
        '@okta/courage': resolve(__dirname, '../../packages/@okta/courage-dist'),
        '@okta/mocks': resolve(__dirname, '../../playground/mocks'),
        '@okta/okta-i18n-bundles': resolve(__dirname, '../util/Bundles.ts'),
        '@okta/qtip': resolve(__dirname, '../../packages/@okta/qtip2/dist/jquery.qtip.js'),
        'widgets/jquery.qtip': resolve(__dirname, '../../packages/@okta/qtip2/dist/jquery.qtip.css'),
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

        // react -> preact alias
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',

        // @mui -> @mui/legacy
        '@mui/base': '@mui/base/legacy',
        '@mui/lab': '@mui/lab/legacy',
        '@mui/material': '@mui/material/legacy',
        '@mui/styled-engine': '@mui/styled-engine/legacy',
        '@mui/system': '@mui/system/legacy',
        '@mui/utils': '@mui/utils/legacy',
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        OKTA_SIW_VERSION: '"0.0.0"',
        OKTA_SIW_COMMIT_HASH: '"local"',
      }),
      // https://webpack.js.org/plugins/ignore-plugin/#example-of-ignoring-moment-locales
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ],
  };
};
