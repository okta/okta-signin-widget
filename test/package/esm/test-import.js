/* eslint-disable no-unused-vars */
import '@okta/okta-signin-widget/polyfill';
import OktaSignIn from '@okta/okta-signin-widget'; // default export
import { OktaSignIn as NamedExport } from '@okta/okta-signin-widget'; // named export
import packageJSON from '@okta/okta-signin-widget/package.json';

console.log('Verifying widget version: ', packageJSON.version);

const signinWidget = new OktaSignIn({
  issuer: 'http://fake',
  clientId: 'fake',
  redirectUri: 'http://fake'
});
signinWidget.showSignIn({});

const signinWidget2 = new NamedExport({
  issuer: 'http://fake',
  clientId: 'fake',
  redirectUri: 'http://fake'
});
signinWidget2.showSignIn({});
