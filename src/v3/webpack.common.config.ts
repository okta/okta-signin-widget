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

import { execSync } from 'child_process';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { resolve } from 'path';
import type { Configuration } from 'webpack';
import webpack from 'webpack';

import { version } from '../../package.json';
import FailOnBuildFailPlugin from '../../scripts/buildtools/webpack/FailOnBuildFailPlugin';

const getShortGitHash = () => {
  const hash = execSync('git rev-parse HEAD')?.toString()?.trim() ?? '';

  return hash.slice(0, 7);
};

const babelOptions = {
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
      'babel-plugin-import',
      {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
    ],
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
        importSource: 'preact',
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        // core-js polyfill handled by @babel/preset-env
        corejs: false,
        helpers: true,
        regenerator: true,
      },
    ],
  ],
};

const baseConfig: Partial<Configuration> = {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: resolve(__dirname, '../..', 'target'),
    environment: {
      arrowFunction: false,
      destructuring: false,
      forOf: false,
      optionalChaining: false,
      templateLiteral: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.m?[jt]sx?$/,
        exclude(filePath) {
          const filePathContains = (f) => filePath.indexOf(f) >= 0;
          // If adding new module, check if also needs to be added to esModules array
          // in src/v3/jest.config.js
          const npmRequiresTransform = [
            '/node_modules/parse-ms',
            '/node_modules/@sindresorhus/to-milliseconds',
            '/node_modules/@okta/odyssey-react-mui',
            '/node_modules/@mui',
            '/node_modules/@okta/okta-auth-js',
            '/node_modules/p-cancelable',
            '/node_modules/i18next',
            '/node_modules/@adobe/leonardo-contrast-colors',
            '/node_modules/apca-w3',
            '/node_modules/colorparsley',
            '/node_modules/@hcaptcha/loader',
            '/node_modules/@hcaptcha/react-hcaptcha',
          ].some(filePathContains);
          const shallBeExcluded = [
            // /src/ will be handled in next rule
            resolve(__dirname, '..'),
            '/node_modules/',
          ].some(filePathContains);

          return shallBeExcluded && !npmRequiresTransform;
        },
        loader: 'babel-loader',
        options: babelOptions,
      },
      // Need to separate rule for files in /src/
      // Rule will be modified in dev config
      {
        test: /\.[jt]sx?$/,
        include: [
          resolve(__dirname, '..'), // /src/
        ],
        loader: 'babel-loader',
        options: babelOptions,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [
                  './node_modules',
                  '../../node_modules',
                ],
              },
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    alias: {
      // TODO: remove when confirmed the below works
      // '@okta/okta-auth-js': resolve(__dirname, 'node_modules/@okta/okta-auth-js/esm/browser/exports/exports/idx.js'),
      '@okta/okta-auth-js': '@okta/okta-auth-js/idx',
      '@okta/mocks': resolve(__dirname, '../../playground/mocks'),
      '@okta/okta-i18n-bundles': resolve(__dirname, '../util/Bundles.ts'),

      config: resolve(__dirname, '../config'),
      nls: resolve(__dirname, '../../packages/@okta/i18n/src/json'),
      src: resolve(__dirname, './src'), // FIXME OKTA-637372 use relative imports
      'util/loc': resolve(__dirname, '../util/loc'),
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
      // use the legacy @mui/* bundles for ie11 support
      // https://mui.com/material-ui/guides/minimizing-bundle-size/#legacy-bundle
      // https://mui.com/material-ui/getting-started/supported-platforms/#ie-11
      '@mui/base': '@mui/base/legacy',
      '@mui/lab': '@mui/lab/legacy',
      '@mui/material': '@mui/material/legacy',
      '@mui/styled-engine': '@mui/styled-engine/legacy',
      '@mui/system': '@mui/system/legacy',
      '@mui/utils': '@mui/utils/legacy',
    },
  },
  plugins: [
    FailOnBuildFailPlugin,
    new webpack.DefinePlugin({
      OKTA_SIW_VERSION: `"${version}"`,
      OKTA_SIW_COMMIT_HASH: `"${getShortGitHash()}"`,
    }),
    // https://webpack.js.org/plugins/ignore-plugin/#example-of-ignoring-moment-locales
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
  // Webpack attempts to add a polyfill for process
  // and setImmediate, because q uses process to see
  // if it's in a Node.js environment
  node: false,
};

export default baseConfig;
