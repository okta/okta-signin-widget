const path = require('path');
const ROOT = path.resolve(__dirname);
const SRC = path.resolve(ROOT, 'src');
const LOCAL_PACKAGES = path.resolve(ROOT, 'packages');
const COVERAGE_DIR = '<rootDir>/build2/reports/coverage/jest';
const REPORT_DIR = '<rootDir>/build2/reports/unit';
/* eslint-disable-next-line @okta/okta/no-unlocalized-text-in-templates */
const OktaSignin = '<rootDir>/src/widget/OktaSignIn';
const LEGACY_TESTS = require('./test/unit/legacy-tests');

module.exports = {
  coverageDirectory: COVERAGE_DIR,
  collectCoverage: false,
  collectCoverageFrom: ['./src/**', '!./test/**'],
  transform: {
    '^.+\\.[jt]s$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/', '/packages/', '/dist/', '/okta-auth-js/build/'],
  restoreMocks: true,
  moduleDirectories: [SRC, 'packages', 'node_modules'],
  moduleNameMapper: {
    '^sandbox$': `${ROOT}/test/unit/helpers/sandbox`,
    '^helpers/(.*)': `${ROOT}/test/unit/helpers/$1`,
    '^@okta/okta-signin-widget$': OktaSignin,

    // Handlebars and Handlebars runtime must point to the same instance for helpers to work
    '^handlebars$': 'handlebars/runtime',

    // auth-js has a browser and server version. we want the browser version
    '^@okta/okta-auth-js$': '<rootDir>/node_modules/@okta/okta-auth-js/dist/okta-auth-js.umd.js',

    // idx-js uses cross-fetch. Force it to use the browser version so our spies work
    '^cross-fetch$': '<rootDir>/node_modules/cross-fetch/dist/browser-ponyfill.js',

    // General remapping
    '^nls/(.*)': '@okta/i18n/src/json/$1',
    '^okta$': `${LOCAL_PACKAGES}/@okta/courage-dist/okta.js`,
    '^okta-i18n-bundles$': 'util/Bundles',
    '^jquery$': `${LOCAL_PACKAGES}/@okta/courage-dist/jquery.js`, // jQuery from courage
    '^qtip$': '@okta/qtip2/dist/jquery.qtip.min.js',
    '^duo$': `${LOCAL_PACKAGES}/vendor/duo_web_sdk/index.js`,
    '^typingdna$': `${LOCAL_PACKAGES}/vendor/TypingDnaRecorder-JavaScript/typingdna`,
  },
  setupFiles: [
    '<rootDir>/test/unit/jest/jest-setup-global.js'
  ],
  testMatch: [
    '**/test/unit/spec/**/*.{js,ts}'
  ],
  testPathIgnorePatterns: LEGACY_TESTS,
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
  ]
};
