/* eslint-disable no-unused-vars */
import OktaSignIn from '@okta/okta-signin-widget'; // default export
import { OktaSignIn as NamedExport } from '@okta/okta-signin-widget'; // named export
import packageJSON from '@okta/okta-signin-widget/package.json';
import polyfill from '@okta/okta-signin-widget/polyfill';

const signinWidget = new OktaSignIn({
  issuer: 'http://fake',
  clientId: 'fake',
  redirectUri: 'http://fake'
});

const signinWidget2 = new NamedExport({
  issuer: 'http://fake',
  clientId: 'fake',
  redirectUri: 'http://fake'
});
