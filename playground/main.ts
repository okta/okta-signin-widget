/* eslint no-console: 0 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const signinWidgetOptions = require('../.widgetrc.js'); // commonJS module

// import OktaSignIn from '../src/widget/OktaSignIn';
import {
  OktaSignInConstructor,
  OktaSignInAPI,
  WidgetOptions,
  RenderResult,
  RenderResultSuccessNonOIDCSession,
} from '../src/types';
import { assertNoEnglishLeaks } from '../playground/LocaleUtils';
declare global {
  interface Window {
    // added by widget CDN bundle
    OktaSignIn: OktaSignInConstructor;

    // added in this file
    getWidgetInstance: () => OktaSignInAPI;
    createWidgetInstance: (options: WidgetOptions) => OktaSignInAPI;
    renderPlaygroundWidget: (options: WidgetOptions) => void;
  }
}

function isSuccessNonOIDC(res: RenderResult): res is RenderResultSuccessNonOIDCSession {
  return (res as RenderResultSuccessNonOIDCSession).session !== undefined;
}

let signIn: OktaSignInAPI;

function getWidgetInstance() {
  return signIn;
}

function createWidgetInstance(options: WidgetOptions = {}) {
  if (signIn) {
    signIn.remove();
  }
  signIn = new window.OktaSignIn(Object.assign({}, signinWidgetOptions, options));
  return signIn;
}

if (typeof window.OktaSignIn === 'undefined') {
  // Make sure OktaSignIn is available
  setTimeout(() => window.location.reload(), 2 * 1000);
}
const renderPlaygroundWidget = (options = {}) => {
  createWidgetInstance(options);

  signIn.renderEl(
    { el: '#okta-login-container' },

    function success(res) {
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
      if (isSuccessNonOIDC(res)) {
        console.log(res.user);
        res.session.setCookieAndRedirect(signinWidgetOptions.baseUrl + '/app/UserHome');
        return;
      }

      // 2. Widget is configured for OIDC, and returns tokens. This can be
      //    an array of tokens or a single token, depending on the
      //    initial configuration.
      else if (Array.isArray(res)) {
        console.log(JSON.stringify(res));
        alert('SUCCESS: OIDC with multiple responseTypes. Check console.');
      }
      else {
        console.log(JSON.stringify(res));
        alert('SUCCESS: OIDC with single responseType. Check Console');
      }
    },

    function error(err) {
      console.error('global error handler: ', err);
    }
  ).catch(() => { /* we are using global error handler */});

  signIn.on('ready', () => {
    // handle `ready` event.
    // use `console.log` in particular so that those logs can be retrieved
    // in testcafe for assertion
    console.log('===== playground widget ready event received =====');
  });

  signIn.on('afterRender', (context) => {
    // handle `afterRender` event.
    // use `console.log` in particular so that those logs can be retrieved
    // in testcafe for assertion
    console.log('===== playground widget afterRender event received =====');
    console.log(JSON.stringify(context));

    // assert english leaks if locale set to ok-PL
    if (signinWidgetOptions.language === 'ok-PL') {
      //Use innerText to avoid including hidden elements
      let viewText = document.getElementById('okta-sign-in').innerText;
      viewText = viewText.split('\n').join(' ');

      const noTranslationContentExists = document.getElementsByClassName('no-translate').length;

      const noTranslationContent = [];
      /* eslint max-depth: [2, 3] */
      if (noTranslationContentExists) {
        const noTranslateElems = document.getElementsByClassName('no-translate');
        for (let i = 0; i < noTranslateElems.length; i++) {
          //build array of noTranslationContent
          noTranslationContent.push(noTranslateElems[i].textContent);
        }
      }
      assertNoEnglishLeaks(null, viewText, noTranslationContent);
    }
  });

  signIn.on('afterError', (context, error) => {
    // handle `afterError` event.
    // use `console.log` in particular so that those logs can be retrieved
    // in testcafe for assertion
    console.log('===== playground widget afterError event received =====');
    console.log(JSON.stringify(context));
    console.log(JSON.stringify(error));
  });

};

window.getWidgetInstance = getWidgetInstance;
window.createWidgetInstance = createWidgetInstance;
window.renderPlaygroundWidget = renderPlaygroundWidget;

let render = true;
if (typeof URL !== 'undefined') {
  const searchParams = new URL(window.location.href).searchParams;
  if (searchParams.get('render') === '0' || searchParams.get('render') === 'false') {
    render = false;
  }
}
render && renderPlaygroundWidget();
