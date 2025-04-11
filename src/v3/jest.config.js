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
const coverageConfig = require('./coverage.config');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const PACKAGES = path.resolve(PROJECT_ROOT, 'packages');
const REPORT_DIR = '<rootDir>/build2/reports/unit';
// If adding new module, check if also needs to be added to npmRequiresTransform
// array in src/v3/webpack.common.config.ts
const esModules = [
  '@okta/odyssey-design-tokens',
  '@okta/odyssey-react-mui',
  '@adobe/leonardo-contrast-colors',
  'apca-w3',
  'colorparsley',
].join('|');

const devMode = process.env.NODE_ENV === 'development';

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const sharedConfig = {
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/src/tsconfig.jest.json',
      // https://kulshekhar.github.io/ts-jest/docs/26.5/getting-started/options/isolatedModules
      isolatedModules: true,
    },
  },
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
  },
  verbose: true,
  collectCoverage: false, // Coverage only collected when run with coverage Jest CLI flag --coverage
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.[jt]s?(x)',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/.*\\.snap',
    '<rootDir>/.*/__mocks__/.*',
    '<rootDir>/src/bin/.*',
    '<rootDir>/src/img/.*',
    '<rootDir>/src/mocks/.*',
    '<rootDir>/src/types/.*',
  ],
  coverageThreshold: coverageConfig,
  coverageReporters: [
    'lcov',
    'text',
    'text-summary',
  ],
  coverageDirectory: REPORT_DIR,
  testURL: 'http://localhost:8080',
  testEnvironment: './config/jsdom-env-with-polyfills.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleDirectories: [
    'node_modules',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/tests/__mocks__/fileMock.js',
    '^.+\\.svg$': '<rootDir>/svgMockTransformer.js',
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '^@okta/okta-i18n-bundles$': `${PROJECT_ROOT}/src/util/Bundles`,
    '^@okta/mocks/(.*)': `${PROJECT_ROOT}/playground/mocks/$1`,
    '^util/Logger': `${PROJECT_ROOT}/src/util/Logger`,
    '^util/Bundles': `${PROJECT_ROOT}/src/util/Bundles`,
    '^util/Enums': `${PROJECT_ROOT}/src/util/Enums`,
    '^util/FactorUtil': `${PROJECT_ROOT}/src/util/FactorUtil`,
    '^util/TimeUtil': `${PROJECT_ROOT}/src/util/TimeUtil`,
    '^util/BrowserFeatures': `${PROJECT_ROOT}/src/util/BrowserFeatures`,
    '^config/config.json': `${PROJECT_ROOT}/src/config/config.json`,
    '^nls$': `${PACKAGES}/@okta/i18n/src/json`,
    '^nls/(.*)': `${PACKAGES}/@okta/i18n/src/json/$1`,
    '^util/(.*)': `${PROJECT_ROOT}/src/util/$1`,
    '^react$': 'preact/compat',
    '^react-dom$': 'preact/compat',
    '^react-dom/server$': 'preact/compat',
    '^react/jsx-runtime$': 'preact/jsx-runtime',
    '^create-react-class$': 'preact/compat/lib/create-react-class',
    '^react-addons-css-transition-group$': 'preact-css-transition-group',
    '^@okta/odyssey-react-mui/icons$': '<rootDir>/../../node_modules/@okta/odyssey-react-mui/dist/icons.generated/index.js',
    '^@hcaptcha/loader$': '<rootDir>/../../node_modules/@hcaptcha/loader/dist/index.cjs',
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

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  projects: [
    {
      displayName: 'UNIT',
      runner: 'jest-runner',
      testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)(test).[jt]s?(x)',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/test/integration/.*',
      ],
      ...sharedConfig,
    },
    {
      displayName: 'INTEGRATION',
      runner: '<rootDir>/test/jest-serial-runner.js',
      testMatch: [
        '**/test/integration/**/*.test.[jt]s?(x)',
      ],
      testPathIgnorePatterns: [
        '<rootDir>/src/.*',
      ],
      ...sharedConfig,
    },
  ],
};