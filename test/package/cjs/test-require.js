/* eslint-disable no-unused-vars */
const OktaSignIn = require('@okta/okta-signin-widget'); // default export
const packageJSON = require('@okta/okta-signin-widget/package.json');
const polyfill = require('@okta/okta-signin-widget/polyfill');

const signinWidget = new OktaSignIn({
  issuer: 'http://fake',
  clientId: 'fake',
  redirectUri: 'http://fake'
});

module.exports = signinWidget;
