const path = require('path');
const ROOT = path.resolve(__dirname);
const SRC = path.resolve(ROOT, 'src');
const LOCAL_PACKAGES = path.resolve(ROOT, 'packages');
const REPORT_DIR = '<rootDir>/build2/reports/unit/jest';
const OktaSignin = '<rootDir>/src/widget/OktaSignIn';

module.exports = {
  coverageDirectory: REPORT_DIR,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**','!./test/**'],
  transform: {
    '^.+\\.(js)$': 'babel-jest',
  },
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
  
    // General remapping
    '^nls/(.*)': '@okta/i18n/src/json/$1',
    '^okta$': `${LOCAL_PACKAGES}/@okta/courage-dist/okta.js`,
    '^okta-i18n-bundles$': 'util/Bundles',
    '^jquery$': `${LOCAL_PACKAGES}/@okta/courage-dist/jquery.js`,
    '^qtip$': '@okta/qtip2/dist/jquery.qtip.min.js',
    '^duo$': 'duo_web_sdk/index.js',
    '^typingdna$': 'TypingDnaRecorder-JavaScript/typingdna',
  },
  setupFiles: [
    '<rootDir>/test/unit/jest/jest-setup-global.js'
  ],
  testMatch: [
    '**/test/unit/spec/v2/**/*.{js,ts}',
    '**/test/unit/spec/OktaSignIn_spec.js'
  ],
  roots: [
    'test/unit/spec'
  ],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: REPORT_DIR }]
  ]
};
