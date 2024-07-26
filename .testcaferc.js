const { readFileSync } = require('fs');
const { RequestMock } = require('testcafe');
const waitOn = require('wait-on');

/**
 * Escapes special regex chars in string so it can be used as the pattern for
 * RegExp constructor. Useful when trying to match strings that frequently
 * contain special chars, e.g., (parts of) a URL,
 * currency, dates.
 *
 * NOTE: all special chars including "^" and "$" are escaped
 *
 * Examples:
 *
 * escapeRegex("http://example.com/path") // "http:\\/\\/example\\.com\\/path"
 *
 * escapeRegex('$12.34') // "\\$12\\.34"
 *
 * escapeRegex('7/12/2021') // "7\\/12\\/2021"
 *
 * @param s {string} the string to escape
 * @returns {string} the escaped string
 */
const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

/**
 * Creates an escaped regex from a string template literal.
 *
 * Example: regex`$12.34` // new RegExp("\\$12\\.34")
 */
const regex = (strings, ...values) => {
	const pattern = strings[0] + values.map(
    (v, i) => escapeRegex(v) + strings[i + 1]
  ).join('');
	return RegExp(pattern);
};

// common/shared mocks
const mocks = RequestMock()
  .onRequestTo({ url: regex`/app/UserHome` })
  .respond(readFileSync('./playground/mocks/app/UserHome.html', 'utf8'), 200, { 'content-type': 'text/html; charset=utf-8' })

  .onRequestTo({ url: regex`/oauth2/default/.well-known/openid-configuration` })
  .respond(require('./playground/mocks/data/oauth2/well-known-openid-configuration.json'))

  .onRequestTo({ url: regex`/sso/idps/facebook-123` })
  .respond('');

// NOTE: process.env always returns type 'string'
const {
  OKTA_SIW_ONLY_FLAKY,
  OKTA_SIW_SKIP_FLAKY,
  OKTA_SIW_GEN3,
  OKTA_SIW_EN_LEAKS,
  UPDATE_SCREENSHOTS,
  OKTA_SIW_MOBILE,
  CI,
  CHROME_HEADLESS,
} = process.env;

// Normalize process.env to type 'boolean'
const env = {
  OKTA_SIW_ONLY_FLAKY: OKTA_SIW_ONLY_FLAKY === 'true',
  OKTA_SIW_SKIP_FLAKY: OKTA_SIW_SKIP_FLAKY === 'true',
  OKTA_SIW_GEN3: OKTA_SIW_GEN3 === 'true',
  OKTA_SIW_EN_LEAKS: OKTA_SIW_EN_LEAKS === 'true',
  OKTA_SIW_MOBILE: OKTA_SIW_MOBILE === 'true',
  CHROME_HEADLESS: (CHROME_HEADLESS === 'true' || CI === 'true'),
  CI: CI === 'true',
  UPDATE_SCREENSHOTS: UPDATE_SCREENSHOTS === 'true',
};

const chromeName = env.CHROME_HEADLESS ? 'chrome:headless' : 'chrome';
const chromeOptions = env.OKTA_SIW_MOBILE ? ':emulation:device=iphone X' : '';
const chromeFlags = env.CHROME_HEADLESS ? '' : ' --disable-search-engine-choice-screen';
const chromeFullName = `${chromeName}${chromeOptions}${chromeFlags}`;

const config = {
  browsers: [chromeFullName],
  hostname: env.CHROME_HEADLESS ? undefined : 'localhost',
  clientScripts: env.OKTA_SIW_EN_LEAKS ? [
  ] : [
    { module: 'axe-core/axe.min.js' },
    { module: '@testing-library/dom/dist/@testing-library/dom.umd.js' }
  ],
  src: env.OKTA_SIW_MOBILE ? [
    'test/testcafe/spec/EnrollAuthenticatorOktaVerify_spec.js',
  ] : env.OKTA_SIW_EN_LEAKS ? [
    'test/testcafe/spec-en-leaks/*_spec.js',
  ] : [
    'test/testcafe/spec/*_spec.js',
    'test/testcafe/spec/v1/*_spec.js'
  ],
  hooks: {
    fixture: {
      before: async () => {
        await waitOn({ resources: ['http-get://localhost:3000'] });
      }
    },
    request: mocks,
  },
  userVariables: {
    gen3: env.OKTA_SIW_GEN3,
    mobile: env.OKTA_SIW_MOBILE,
    updateScreenshots: env.UPDATE_SCREENSHOTS,
  },
  // OKTA-575629 Remove this when gen3 parity test flakiness is resolved
  ...(env.OKTA_SIW_GEN3 && {
      assertionTimeout: 20000,
  }),

  // limit concurrency when running flaky tests
  // OKTA_SIW_ONLY_FLAKY: 1 ← flaky
  // !CHROME_HEADLESS: 1 ← for debugging tests
  // OKTA_SIW_EN_LEAKS: 2 ← somewhat flaky
  // !OKTA_SIW_EN_LEAKS: 4 ← most tests
  concurrency: (OKTA_SIW_ONLY_FLAKY || !env.CHROME_HEADLESS) 
    ? 1 
    : (env.OKTA_SIW_EN_LEAKS ? 2 : 4),

  // retry failed tests
  quarantineMode: env.OKTA_SIW_EN_LEAKS ? false : {
    successThreshold: 1,
    attemptLimit: 3,
  },

  filter: (_testName, _fixtureName, fixturePath, testMeta, fixtureMeta) => {
    // only check one of {gen3 | gen2} conditionals. without this guard, a
    // fixture or test will always get skipped in both testcafe runs
    if (env.OKTA_SIW_GEN3) {
      // Do not execute Gen 1 tests in parity suite
      if (fixturePath.includes('spec/v1')) {
        return false;
      }
      // skip fixture on gen3
      // fixture('my tests').meta('gen3', false)
      if (fixtureMeta.gen3 === false) {
        return false;
      }

      // skip test on gen3
      // test.meta('gen3', false)('my test', (t) => {})
      if (testMeta.gen3 === false) {
        return false;
      }
    } else {
      // skip fixture on gen2
      // fixture('my tests').meta('gen2', false)
      if (fixtureMeta.gen2 === false) {
        return false;
      }

      // skip test on gen2
      // test.meta('gen2', false)('my test', (t) => {})
      if (testMeta.gen2 === false) {
        return false;
      }
    }

    // flaky tests
    // flaky tests should be run with low or no concurrency:
    // yarn testcafe -c1
    // fixture('my fixture').meta('flaky', true)
    // test.meta('flaky', true)('my test', (t) => {})
    if (fixtureMeta.flaky || testMeta.flaky) {
      // OKTA_SIW_ONLY_FLAKY supercedes OKTA_SIW_SKIP_FLAKY
      return env.OKTA_SIW_ONLY_FLAKY || !env.OKTA_SIW_SKIP_FLAKY;
    }

    // skip tests that are not intended to work on mobile devices
    if (testMeta.mobile === false) {
      return !env.OKTA_SIW_MOBILE;
    }

    return true;
  },
  screenshots: {
    thumbnails: false,
  },
}

module.exports = config;
