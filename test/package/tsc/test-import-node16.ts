/* eslint-disable @typescript-eslint/no-unused-vars */
import '@okta/okta-signin-widget/polyfill';
import OktaSignInModule from '@okta/okta-signin-widget'; // default export
import { OktaSignIn } from '@okta/okta-signin-widget'; // named export
import type { OktaSignInAPI } from '@okta/okta-signin-widget'; // type export
import packageJSON from '@okta/okta-signin-widget/package.json';

console.log('Verifying widget version: ', packageJSON.version);

const signinWidget: OktaSignInAPI = new OktaSignInModule.default({
  issuer: 'http://fake',
  clientId: 'fake',
  redirectUri: 'http://fake'
});
signinWidget.showSignIn({});

const signinWidget2: OktaSignInAPI = new OktaSignIn({
  issuer: 'http://fake',
  clientId: 'fake',
  redirectUri: 'http://fake'
});
signinWidget2.showSignIn({});