const path = require('path');
const ROOT = path.resolve(__dirname);
// const SRC = path.resolve(ROOT, 'src');
const LOCAL_PACKAGES = path.resolve(ROOT, 'packages');
const COVERAGE_DIR = '<rootDir>/build2/reports/coverage/jest';
const REPORT_DIR = '<rootDir>/build2/reports/unit';
/* eslint-disable-next-line @okta/okta/no-unlocalized-text-in-templates */
const OktaSignin = '<rootDir>/src/exports/default';

const TEST_TIMEOUT = 20 * 1000;

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  coverageDirectory: COVERAGE_DIR,
  collectCoverage: false,
  collectCoverageFrom: ['./src/**', '!./test/**'],
  transform: {
    '^.+\\.m?[jt]s$': 'babel-jest',
  },
  transformIgnorePatterns: [], //'/node_modules/', '/dist/', '/okta-auth-js/build/'],
  restoreMocks: true,
  // moduleDirectories: [SRC, 'packages', 'node_modules'],
  moduleNameMapper: {
    '^sandbox$': `${ROOT}/test/unit/helpers/sandbox`,
    '^helpers/(.*)': `${ROOT}/test/unit/helpers/$1`,
    '^@okta/okta-signin-widget$': OktaSignin,

    // Handlebars and Handlebars runtime must point to the same instance for helpers to work
    '^handlebars$': 'handlebars/runtime',

    // auth-js has a browser and server version. we want the browser version
    '^@okta/okta-auth-js$': [
      // When using yarn link
      '<rootDir>/node_modules/@okta/okta-auth-js/build/umd/default.js',
      // When using installed module
      '<rootDir>/node_modules/@okta/okta-auth-js/umd/default.js',
    ],

    // idx-js uses cross-fetch. Force it to use the browser version so our spies work
    '^cross-fetch$': '<rootDir>/node_modules/cross-fetch/dist/browser-ponyfill.js',

    // General remapping
    '^nls/(.*)': '@okta/i18n/src/json/$1',
    '^@okta/i18n/src/json/(.*)': `${LOCAL_PACKAGES}/@okta/i18n/src/json/$1`,
    '^@okta/courage$': `${LOCAL_PACKAGES}/@okta/courage-dist/esm/src/index.js`,
    '^@okta/okta-i18n-bundles$': `${ROOT}/src/util/Bundles`,
    '^@okta/qtip$': '@okta/qtip2/dist/jquery.qtip.js',
    '^@okta/duo$': `${LOCAL_PACKAGES}/vendor/duo_web_sdk/index.js`,
    '^@okta/typingdna$': `${LOCAL_PACKAGES}/vendor/TypingDnaRecorder-JavaScript/typingdna`,
    '^LoginRouter$': `${ROOT}/src/LoginRouter`,
  },
  setupFiles: [
    '<rootDir>/test/unit/jest/jest-setup.js'
  ],
  globalSetup: '<rootDir>/test/unit/jest/jest-global-setup.js',
  testMatch: [
    '**/test/unit/spec/**/*.{js,ts}'
  ],
  roots: [
    'src',
    'test/unit/spec'
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: REPORT_DIR,
      outputName: 'okta-sign-in-widget-jest-junit-result.xml',
    }]
  ],
  testTimeout: process.env.MODE === 'DEBUG' ? TEST_TIMEOUT * 10000 : TEST_TIMEOUT,
};
