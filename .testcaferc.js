const { readFileSync } = require('fs');
const { RequestMock } = require('testcafe');

const escapeRegExp = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

const _regex = (flags, strings, ...values) => {
	const pattern = strings[0] + values.map((v, i) => escapeRegExp(v) + strings[i + 1]).join('');
	return RegExp(pattern, flags);
};
const regex = new Proxy(_regex.bind(undefined, ""), {
	get: (t, property) => _regex.bind(undefined, property)
});

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
