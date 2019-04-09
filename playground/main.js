/* global OktaSignIn */
/* eslint no-console: 0 */

import { widgetOptions as signinWidgetOptions} from '../.widgetrc';

const signIn = new OktaSignIn(signinWidgetOptions);

signIn.renderEl(
  { el: '#okta-login-container' },

  function success (res) {
    // Password recovery flow
    if (res.status === 'FORGOT_PASSWORD_EMAIL_SENT') {
      alert('SUCCESS: Forgot password email sent');
      return;
    }

    // Unlock account flow
    if (res.status === 'UNLOCK_ACCOUNT_EMAIL_SENT') {
      alert('SUCCESS: Unlock account email sent');
      return;
    }

    // User has completed authentication (res.status === 'SUCCESS')

    // 1. Widget is not configured for OIDC, and returns a sessionToken
    //    that needs to be exchanged for an okta session
    if (res.session) {
      console.log(res.user);
      res.session.setCookieAndRedirect(signinWidgetOptions.baseUrl + '/app/UserHome');
      return;
    }

    // 2. Widget is configured for OIDC, and returns tokens. This can be
    //    an array of tokens or a single token, depending on the
    //    initial configuration.
    else if (Array.isArray(res)) {
      console.log(res);
      alert('SUCCESS: OIDC with multiple responseTypes. Check console.');
    }
    else {
      console.log(res);
      alert('SUCCESS: OIDC with single responseType. Check Console');
    }
  },

  function error (err) {
    alert('ERROR: ' + err);
  }
);
