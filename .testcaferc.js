const { readFileSync } = require('fs');
const { RequestMock } = require('testcafe');
const mockWellKnownOpenIdConfiguration = require('./playground/mocks/data/oauth2/well-known-openid-configuration.json');

const mockUserHome = readFileSync('./playground/mocks/app/UserHome.html', 'utf8');

// global mocks
const mocks = RequestMock()
  .onRequestTo(/\/app\/UserHome/)
  .respond(mockUserHome, 200, { 'content-type': 'text/html; charset=utf-8' })

  .onRequestTo(/\/oauth2\/default\/\.well-known\/openid-configuration/)
  .respond(mockWellKnownOpenIdConfiguration)
  
  .onRequestTo(/\/sso\/idps\/facebook-123/)
  .respond('');

module.exports = {
  browsers: [
    'chrome:headless'
  ],
  src: [
    'test/testcafe/spec/*_spec.js'
  ],
  hooks: {
    request: mocks,
  }
}
