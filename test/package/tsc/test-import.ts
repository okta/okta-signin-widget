/* eslint-disable @typescript-eslint/no-unused-vars */
import  '@okta/okta-signin-widget/polyfill';
import OktaSignIn from '@okta/okta-signin-widget'; // default export
import type { OktaSignInAPI } from '@okta/okta-signin-widget'; // type export
import packageJSON from '@okta/okta-signin-widget/package.json';

console.log('Verifying widget version: ', packageJSON.version);

const signinWidget: OktaSignInAPI = new OktaSignIn({
    issuer: 'http://fake',
    clientId: 'fake',
    redirectUri: 'http://fake'
});

signinWidget.showSignIn({});