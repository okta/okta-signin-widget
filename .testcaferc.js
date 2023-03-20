const { readFileSync } = require('fs');
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
  .respond(readFileSync('./playground/mocks/app/UserHome.html', 'utf8'), 200, { 'content-type': 'text/html; charset=utf-8' })

  .onRequestTo({ url: regex`/oauth2/default/v1/interact` })
  .respond(require('./playground/mocks/data/oauth2/interact.json'))

  .onRequestTo({ url: regex`/idp/idx/cancel` })
  .respond(require('./playground/mocks/data/idp/idx/identify.json'))

  .onRequestTo({ url: regex`/idp/idx/skip` })
  .respond(require('./playground/mocks/data/idp/idx/success-with-app-user.json'))

  .onRequestTo({ url: regex`/oauth2/default/.well-known/openid-configuration` })
  .respond(require('./playground/mocks/data/oauth2/well-known-openid-configuration.json'))

  .onRequestTo({ url: regex`/idp/idx/authenticators/okta-verify/launch` })
  .respond(require('./playground/mocks/data/idp/idx/identify-with-device-launch-authenticator.json'))

  .onRequestTo({ url: regex`/idp/idx/challenge/poll` })
  .respond(require('./playground/mocks/data/idp/idx/authenticator-verification-email.json'))

  .onRequestTo({ url: regex`/sso/idps/facebook-123` })
  .respond('');

module.exports = {
  browsers: [
    'chrome:headless'
  ],
  clientScripts: [
    {
      module: 'axe-core/axe.min.js'
    },
    {
      module: '@testing-library/dom/dist/@testing-library/dom.umd.js'
    }
  ],
  src: [
    'test/testcafe/spec/*_spec.js'
  ],
  hooks: {
    request: mocks,
  },
  userVariables: {
    v3: false,
  },
}
