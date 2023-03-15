const {readFileSync} = require('fs');
const { RequestMock } = require("testcafe");
const mockWellKnownOpenIdConfiguration = require('../../playground/mocks/data/oauth2/well-known-openid-configuration.json');

const mockUserHome = readFileSync('../../playground/mocks/app/UserHome.html', 'utf8');

module.exports = {
  browsers: [
    'chrome:headless'
  ],

  pageRequestTimeout: 20 * 1000,

  compilerOptions: {
    typescript: {
      configPath: 'tsconfig.json',
    }
  },
  clientScripts: [
    {
      module: 'axe-core/axe.min.js'
    },
    {
      module: '@testing-library/dom/dist/@testing-library/dom.umd.js'
    }
  ],
  src: [
    '../../test/testcafe/spec/*_spec.js'
  ],
  hooks: {
    request: RequestMock()
      .onRequestTo({ url: new RegExp('http://localhost:3000/app/UserHome') })
      .respond(mockUserHome, 200, { 'content-type': 'text/html; charset=utf-8' })

      .onRequestTo({ url: new RegExp('http://localhost:3000/oauth2/default/\.well-known/openid-configuration') })
      .respond(mockWellKnownOpenIdConfiguration)

      .onRequestTo({ url: new RegExp('http://localhost:3000/sso/idps/facebook-123') })
      .respond(''),
  },

  /*
  * NOTE: add a testcafe fixture to the list of specs to run for parity testing
  * by adding fixture metadata {"v3": true}. See example in
  * test/testcafe/spec/Smoke_spec.js
  */
  filter: (testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
    return fixtureMeta.v3 === true && testMeta.v3 !== false;
  },

  userVariables: {
    v3: true,
  },

  // OKTA-575629 Remove this when v3 parity test flakiness is resolved
  assertionTimeout: 20 * 1000,
};
