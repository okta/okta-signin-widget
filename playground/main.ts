/* eslint no-console: 0 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const signinWidgetOptions = require('../.widgetrc.js'); // commonJS module

import {
  OktaSignInConstructor,
  OktaSignInAPI,
  WidgetOptions,
  RenderResult,
  RenderResultSuccessNonOIDCSession,
} from '../src/types';
import {
  OktaSignInAPI as OktaSignInAPIV3,
  WidgetOptions as WidgetOptionsV3,
} from '../src/v3/src/types';
import { assertNoEnglishLeaks } from '../playground/LocaleUtils';
import Util from '../src/util/Util';
import { addAfterTransformHooks, addHookOptions } from './hooks';

declare global {
  const IE11_COMPAT_MODE: boolean;

  interface Window {
    // added by widget CDN bundle
    OktaSignIn: OktaSignInConstructor;
    // added by login page in Okta-hosted
    cspNonce: string;
    
    // from <script src="/js/okta-plugin-a11y.js">
    OktaPluginA11y: { init: (widget: OktaSignInAPI) => void };

    // added in this file
    getWidgetInstance: () => OktaSignInAPI;
    createWidgetInstance: (options: WidgetOptions) => OktaSignInAPI;
    renderPlaygroundWidget: (options: WidgetOptions) => void;
    additionalOptions?: Partial<WidgetOptions>;
  }
}

const NO_TRANSLATE_SELECTOR = '.no-translate, .notranslate, [translate="no"]';

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
const renderPlaygroundWidget = (options: WidgetOptions & { assertNoEnglishLeaks?: boolean, customize?: boolean } = {}) => {
  // Okta-hosted widget page has this value set for CSP
  window.cspNonce = 'playground';

  if (customize) {
    document.querySelector('#okta-login-container').classList.add('siw-customized');
    addHookOptions(options as any as WidgetOptionsV3);
  }

  createWidgetInstance(options);

  if (window.OktaPluginA11y) {
    window.OktaPluginA11y.init(signIn);
  }

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
    if (options?.assertNoEnglishLeaks !== false && signinWidgetOptions.language === 'ok-PL') {
      //Use innerText to avoid including hidden elements
      let viewText = document.getElementById('okta-sign-in').innerText;
      viewText = viewText.split('\n').join(' ');

      const noTranslationContentExists = document.querySelectorAll(NO_TRANSLATE_SELECTOR).length;

      const noTranslationContent = [];
      /* eslint max-depth: [2, 3] */
      if (noTranslationContentExists) {
        const noTranslateElems = document.querySelectorAll(NO_TRANSLATE_SELECTOR);
        for (let i = 0; i < noTranslateElems.length; i++) {
          //build array of noTranslationContent
          noTranslationContent.push((noTranslateElems[i] as HTMLElement).innerText);
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

  if (customize) {
    addAfterTransformHooks(signIn as OktaSignInAPIV3);
  }
};

window.getWidgetInstance = getWidgetInstance;
window.createWidgetInstance = createWidgetInstance;
window.renderPlaygroundWidget = renderPlaygroundWidget;

let render = true;
let preventRedirect = false;
let customize = false;
if (typeof URL !== 'undefined') {
  const searchParams = new URL(window.location.href).searchParams;
  if (searchParams.get('render') === '0' || searchParams.get('render') === 'false') {
    render = false;
  }
  if (searchParams.get('preventRedirect') === '1' || searchParams.get('preventRedirect') === 'true') {
    preventRedirect = true;
  }
  if (searchParams.get('customize') === '1' || searchParams.get('customize') === 'true') {
    customize = true;
  }
}

if (preventRedirect) {
  // Mocks that causes redirects:
  // - error-with-failure-redirect
  // - failure-redirect-remediation
  // - identify-with-only-one-third-party-idp-app-user
  // - identify-with-only-one-third-party-idp
  // - success-redirect-remediation
  // - success-with-app-user
  // - success
  Util.changeLocation = () => {};
  Util.redirectWithFormGet = () => {};
}

let preRenderTasks = Promise.resolve();

// code pulled in by msw and its dependencies don't play well with ie11, so conditionally
// exclude this from the bundle entirely using an env variable. you must restart the server
// after setting this for it to take effect.
if (!IE11_COMPAT_MODE) {
  // set up msw
  preRenderTasks = import('../src/v3/src/mocks/browser')
    .then(({ getWorker }) => getWorker())
    .then((worker) => {
      worker?.start();
    });
}

preRenderTasks.then(() => {
  if (render) {
    const options = {
      ...(window.additionalOptions ?? {}),
      customize,
    };
    renderPlaygroundWidget(options);
  }
});
