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
// eslint-disable-next-line import/no-extraneous-dependencies
const { loadEnv } = require('vite');

const getEnv = (mode) => loadEnv(mode, process.cwd());

const getResolveAlias = (mode) => {
  const env = getEnv(mode);

  return {
    '@okta/okta-auth-js': resolve(__dirname, 'node_modules/@okta/okta-auth-js/esm/browser/exports/exports/idx.js'),
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

    // @mui -> @mui/legacy
    '@mui/base': '@mui/base/legacy',
    '@mui/lab': '@mui/lab/legacy',
    '@mui/material': '@mui/material/legacy',
    '@mui/styled-engine': '@mui/styled-engine/legacy',
    '@mui/system': '@mui/system/legacy',
    '@mui/utils': '@mui/utils/legacy',
  };
};

const getViteServerProxy = () => {
  const mockServerBaseUrl = 'http://localhost:3030';
  return {
    '/oauth2/': mockServerBaseUrl,
    '/api/v1/': mockServerBaseUrl,
    '/idp/idx/': mockServerBaseUrl,
    '/login/getimage': mockServerBaseUrl,
    '/sso/idps/': mockServerBaseUrl,
    '/app/UserHome': mockServerBaseUrl,
    '/oauth2/v1/authorize': mockServerBaseUrl,
    '/auth/services/': mockServerBaseUrl,
    '/.well-known/webfinger': mockServerBaseUrl,
  };
};

module.exports = {
  getEnv,
  getResolveAlias,
  getViteServerProxy,
};
