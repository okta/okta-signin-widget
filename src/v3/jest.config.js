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

const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const PACKAGES = path.resolve(PROJECT_ROOT, 'packages');
const REPORT_DIR = '<rootDir>/build2/reports/unit';
const esModules = [
  '@okta/odyssey-design-tokens',
  '@okta/odyssey-react-mui',
].join('|');

const devMode = process.env.NODE_ENV === 'development';

module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/src/tsconfig.json',
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
  },
  verbose: true,
  testURL: 'http://localhost:8080',
  testEnvironment: './config/jsdom-env-with-polyfills.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: [
    'node_modules',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)(test).[jt]s?(x)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
    '^.+\\.svg$': '<rootDir>/svgMockTransformer.js',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    'preact/hooks': '<rootDir>/node_modules/preact/hooks',
    '^@okta/courage$': `${PACKAGES}/@okta/courage-dist/esm/src/index.js`,
    '^@okta/duo': `${PROJECT_ROOT}/playground/mocks/spec-duo/duo-mock.js`,
    '^@okta/okta-i18n-bundles$': `${PROJECT_ROOT}/src/util/Bundles`,
    '^@okta/qtip$': `${PACKAGES}/@okta/qtip2/dist/jquery.qtip.js`,
    '^@okta/mocks/(.*)': `${PROJECT_ROOT}/playground/mocks/$1`,
    'util/Logger': `${PROJECT_ROOT}/src/util/Logger`,
    'util/Bundles': `${PROJECT_ROOT}/src/util/Bundles`,
    'util/Enums': `${PROJECT_ROOT}/src/util/Enums`,
    'util/FactorUtil': `${PROJECT_ROOT}/src/util/FactorUtil`,
    'util/TimeUtil': `${PROJECT_ROOT}/src/util/TimeUtil`,
    'util/BrowserFeatures': `${PROJECT_ROOT}/src/util/BrowserFeatures`,
    '^config/config.json': `${PROJECT_ROOT}/src/config/config.json`,
    '^nls$': `${PACKAGES}/@okta/i18n/src/json`,
    '^nls/(.*)': `${PACKAGES}/@okta/i18n/src/json/$1`,
    '^util/(.*)': `${PROJECT_ROOT}/src/util/$1`,
    '^react$': '<rootDir>/node_modules/preact/compat',
    '^react-dom$': '<rootDir>/node_modules/preact/compat',
    '^react-dom/server$': '<rootDir>/node_modules/preact/compat',
    '^react/jsx-runtime$': '<rootDir>/node_modules/preact/jsx-runtime',
    '^create-react-class$': '<rootDir>/node_modules/preact/compat/lib/create-react-class',
    '^react-addons-css-transition-group$': 'preact-css-transition-group',
  },

  modulePaths: [
    '<rootDir>',
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: REPORT_DIR,
      outputName: 'okta-sign-in-widget-jest-junit-result.xml',
    }],
  ],
  transformIgnorePatterns: [
    `/node_modules/(?!${esModules})`,
    // TODO: remove when re-enable transformers tests - OKTA-516578
    // eslint-disable-next-line no-useless-escape
    '<rootDir>/src/transformer/^.*\.test\.*',
  ],
  setupFilesAfterEnv: [
    './jest.setup.js',
  ],
  restoreMocks: true,
  testTimeout: devMode ? 1000 * 60 * 1000 : 10 * 1000,
};
