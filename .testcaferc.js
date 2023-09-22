const { readFileSync } = require('fs');
const path = require('path');
const { RequestMock } = require('testcafe');

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
  .respond(readFileSync(path.join(__dirname, 'playground/mocks/app/UserHome.html'), 'utf8'), 200, { 'content-type': 'text/html; charset=utf-8' })

  .onRequestTo({ url: regex`/oauth2/default/.well-known/openid-configuration` })
  .respond(require('./playground/mocks/data/oauth2/well-known-openid-configuration.json'))

  .onRequestTo({ url: regex`/oauth2/default/v1/interact` })
  .respond(require('./playground/mocks/data/oauth2/interact.json'))

  .onRequestTo({ url: regex`/sso/idps/facebook-123` })
  .respond('');

const {
  OKTA_SIW_ONLY_FLAKY,
  OKTA_SIW_SKIP_FLAKY,
  OKTA_SIW_V3,
} = process.env;

const env = {
  OKTA_SIW_ONLY_FLAKY,
  OKTA_SIW_SKIP_FLAKY,
  OKTA_SIW_V3,
};

const config = {
  browsers: [ 'chrome:headless' ],
  clientScripts: [
    { module: 'axe-core/axe.min.js' },
    { module: '@testing-library/dom/dist/@testing-library/dom.umd.js' }
  ],
  src: [ 'test/testcafe/spec/*_spec.js' ],
  hooks: {
    request: mocks,
    test: {
      before: async t => {
        const reqHooks = [...t.testRun.test.requestHooks];
        await t.removeRequestHooks(reqHooks);
        await t.addRequestHooks(reqHooks.reverse());
      }
    }
  },
  userVariables: {
    v3: !!env.OKTA_SIW_V3,
  },

  /*
   * NOTE: add a testcafe fixture to the list of specs to run for parity testing
   * by adding fixture metadata {"v3": true}. See example in
   * test/testcafe/spec/Smoke_spec.js
   */
  ...(env.OKTA_SIW_V3 && {
      userVariables: { v3: true },
      // OKTA-575629 Remove this when v3 parity test flakiness is resolved
      assertionTimeout: 20000,
  }),

  // limit concurrency when running flaky tests
  // concurrency: OKTA_SIW_ONLY_FLAKY ? 1 : undefined,
  concurrency: 1,

  filter: (_testName, _fixtureName, _fixturePath, testMeta, fixtureMeta) => {
    if (env.OKTA_SIW_V3) {
      // run fixture on gen3
      // fixture('my tests').meta('v3', true)
      if (fixtureMeta.v3 !== true || testMeta.v3 === false) {
        return false;
      }

      // skip test on gen3
      // test.meta('v3', false)('my test', (t) => {})
      if (testMeta.v3 === false) {
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
      return !!env.OKTA_SIW_ONLY_FLAKY || !env.OKTA_SIW_SKIP_FLAKY;
    }

    return true;
  },
}

module.exports = config;
