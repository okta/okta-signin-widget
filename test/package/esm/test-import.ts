/* eslint-disable @typescript-eslint/no-unused-vars */
import OktaSignIn from '@okta/okta-signin-widget'; // default export
import { OktaSignInAPI } from '@okta/okta-signin-widget'; // type export
import { OktaSignIn as NamedExport } from '@okta/okta-signin-widget'; // named export
import packageJSON from '@okta/okta-signin-widget/package.json';


const signinWidget: OktaSignInAPI = new OktaSignIn({
    issuer: 'http://fake',
    clientId: 'fake',
    redirectUri: 'http://fake'
});
