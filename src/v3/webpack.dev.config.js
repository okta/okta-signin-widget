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

const makeConfig = require('./webpack.config');

const HOST = 'localhost';
const MOCK_SERVER_PORT = 3030;
const TARGET = resolve(__dirname, '../..', 'target');
const ASSETS = resolve(__dirname, '../..', 'assets');
const PLAYGROUND = resolve(__dirname, '../..', 'playground');

const devConfig = makeConfig();

devConfig.mode = 'development';
devConfig.devtool = 'source-map';
devConfig.entry = {
  playground: {
    import: `${PLAYGROUND}/main.ts`,
    filename: 'playground.bundle.js',
  },
  widget: {
    import: resolve(__dirname, 'src/index.ts'),
    filename: 'js/okta-sign-in.js',
    library: {
      name: 'OktaSignIn',
      type: 'umd',
      export: 'default',
    },
  },
  css: {
    import: `${ASSETS}/sass/okta-sign-in.scss`,
    filename: 'css/okta-sign-in.css',
  },
};
devConfig.output = {
  path: `${PLAYGROUND}/target`,
  filename: 'js/[name].js',
};
devConfig.devServer = {
  host: HOST,
  watchFiles: [TARGET, ASSETS, PLAYGROUND],
  static: [TARGET, ASSETS, PLAYGROUND],
  port: 3000,
  compress: true,
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
};

module.exports = devConfig;