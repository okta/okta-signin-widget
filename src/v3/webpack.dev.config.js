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

const fs = require('fs');
const { resolve } = require('path');

const nodemon = require('nodemon');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const baseConfig = require('./webpack.common.config');

const DEV_SERVER_PORT = 3000;
const MOCK_SERVER_PORT = 3030;

const WIDGET_RC_JS = resolve(__dirname, '../..', '.widgetrc.js');
const PLAYGROUND = resolve(__dirname, '../..', 'playground');
const TARGET = resolve(__dirname, '../..', 'target');
const ASSETS = resolve(__dirname, '../..', 'assets');

// run `OKTA_SIW_HOST=0.0.0.0 yarn start --watch` to override the host
const HOST = process.env.OKTA_SIW_HOST || 'localhost';
const STATIC_DIRS = [PLAYGROUND, TARGET, ASSETS];

const headers = (() => {
  if (!process.env.DISABLE_CSP) {
    // Allow google domains for testing recaptcha
    const scriptSrc = `script-src http://${HOST}:${DEV_SERVER_PORT} https://www.google.com https://www.gstatic.com`;
    const styleSrc = `style-src http://${HOST}:${DEV_SERVER_PORT} 'nonce-playground'`;

    return {
      'Content-Security-Policy': `${scriptSrc}; ${styleSrc};`,
    };
  }
  return {};
})();

if (!fs.existsSync(WIDGET_RC_JS)) {
  // create default WIDGET_RC if it doesn't exist to simplifed the build process
  fs.copyFileSync(path.resolve(__dirname, '../..', '.widgetrc.sample.js'), WIDGET_RC_JS);
}

const devConfig = merge(
  baseConfig,
  {
    mode: 'development',
    devtool: 'source-map',
    entry: {
      playground: {
        import: [
          `${PLAYGROUND}/main.ts`,
        ],
        filename: 'playground.bundle.js',
      },
      widget: {
        import: [
          // polyfill must appear first in entry point array
          resolve(__dirname, '../..', './polyfill/modern.js'),
          resolve(__dirname, 'src/index.ts'),
        ],
        filename: 'js/okta-sign-in.js',
        library: {
          name: 'OktaSignIn',
          type: 'umd',
          export: 'default',
        },
      },
    },
    output: {
      path: `${PLAYGROUND}/target`,
    },
    resolve: {
      alias: {
        '@okta/duo': `${PLAYGROUND}/mocks/spec-duo/duo-mock.js`,
        duo_web_sdk: resolve(__dirname, 'src/__mocks__/duo_web_sdk'),
      }
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'css/okta-sign-in.css',
      }),
      new webpack.DefinePlugin({
        DEBUG: true,
      }),
    ],
    devServer: {
      host: HOST,
      watchFiles: [...STATIC_DIRS],
      static: [...STATIC_DIRS],
      historyApiFallback: true,
      headers,
      compress: true,
      port: DEV_SERVER_PORT,
      proxy: [{
        context: [
          '/oauth2/',
          '/api/v1/',
          '/idp/idx/',
          '/login/getimage',
          '/sso/idps/',
          '/app/UserHome',
          '/oauth2/v1/authorize',
          '/auth/services/',
          '/.well-known/webfinger'
        ],
        target: `http://${HOST}:${MOCK_SERVER_PORT}`
      }],
      // https://webpack.js.org/configuration/dev-server/#devserversetupmiddlewares
      setupMiddlewares(middlewares) {
        const script = resolve(PLAYGROUND, 'mocks/server.js');
        const watch = [resolve(PLAYGROUND, 'mocks')];
        const env = { MOCK_SERVER_PORT, DEV_SERVER_PORT };
        nodemon({ script, watch, env, delay: 50 })
          .on('crash', console.error);
        return middlewares;
      },
    },
  },
);

module.exports = devConfig;