/* global OktaSignIn */
/* eslint no-console: 0 */

import widgetRc from '../../.widgetrc';

const defaultOptions = {
  baseUrl: 'http://rain.okta1.com:1802',
  logo: '/img/logo_widgico.png',
  logoText: 'Windico',
  features: {
    router: true,
    rememberMe: true,
    multiOptionalFactorEnroll: true
  },
  // Host the assets (i.e. jsonp files) locally
  assets: {
    baseUrl: '/'
  }
};

const options = Object.assign({}, defaultOptions, widgetRc.widgetOptions);
const signIn = new OktaSignIn(options);

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

    //IDP Discovery
    if (res.status == 'IDP_DISCOVERY') {
      console.log('idp discovery');
      res.idpDiscovery.redirectToIdp(options.baseUrl + '/app/UserHome');
      return;
    }

    // User has completed authentication (res.status === 'SUCCESS')

    // 1. Widget is not configured for OIDC, and returns a sessionToken
    //    that needs to be exchanged for an okta session
    if (res.session) {
      console.log(res.user);
      res.session.setCookieAndRedirect(options.baseUrl + '/app/UserHome');
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
