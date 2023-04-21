const {readFileSync} = require('fs');
const { RequestMock } = require("testcafe");
const mockWellKnownOpenIdConfiguration = require('./playground/mocks/data/oauth2/well-known-openid-configuration.json');

const mockUserHome = readFileSync('./playground/mocks/app/UserHome.html', 'utf8');

// global mocks
const mocks = RequestMock()
  .onRequestTo({ url: new RegExp('http://localhost:3000/app/UserHome') })
  .respond(mockUserHome, 200, { 'content-type': 'text/html; charset=utf-8' })

  .onRequestTo({ url: new RegExp('http://localhost:3000/oauth2/default/\.well-known/openid-configuration') })
  .respond(mockWellKnownOpenIdConfiguration)
  
  .onRequestTo({ url: new RegExp('http://localhost:3000/sso/idps/facebook-123') })
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
    'test/testcafe/spec/Session*_spec.js',
  ],
  hooks: {
    request: mocks,
  },
  userVariables: {
    v3: false,
  },
}
