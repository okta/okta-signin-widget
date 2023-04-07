/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable no-alert,no-console */

import { assertNoEnglishLeaks } from '../../../playground/LocaleUtils';
import {
  OktaSignInAPI,
  OktaSignInConstructor,
  RenderResult,
  RenderResultSuccessNonOIDCSession,
  WidgetOptions,
} from '../../types';
import { config } from '../widgetrc';
import OktaSignIn from './OktaSignIn'; // FIXME should be set by cdn bundle
import { getWorker } from './mocks/browser';

declare global {
  interface Window {
    // added by widget CDN bundle
    OktaSignIn: OktaSignInConstructor;

    // from <script src="/js/okta-plugin-a11y.js">
    OktaPluginA11y: { init: (widget: OktaSignInAPI) => void };

    // added in this file
    getWidgetInstance: () => OktaSignInAPI;
    createWidgetInstance: (options: WidgetOptions) => OktaSignInAPI;
    renderPlaygroundWidget: (options: WidgetOptions) => void;
    additionalOptions?: Partial<WidgetOptions>;
  }
}

function isSuccessNonOIDC(res: RenderResult): res is RenderResultSuccessNonOIDCSession {
  return (res as RenderResultSuccessNonOIDCSession).session !== undefined;
}

let siw: OktaSignInAPI;

function getWidgetInstance() {
  return siw;
}

function createWidgetInstance(options: WidgetOptions = {}) {
  if (siw) {
    siw.remove();
  }
  // @ts-expect-error mismatch between OktaSignIn and OktaSignInAPI
  siw = new OktaSignIn({ ...config, ...options });
  return siw;
}

const renderPlaygroundWidget = (options = {}) => {
  createWidgetInstance(options);

  siw.renderEl(
    { el: '#okta-login-container' },

    (res) => {
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

      if (isSuccessNonOIDC(res)) {
        // 1. Widget is not configured for OIDC, and returns a sessionToken that
        //    needs to be exchanged for an okta session
        console.log(res.user);
        res.session
          ?.setCookieAndRedirect(`${config.baseUrl}/app/UserHome`);
      } else if (Array.isArray(res)) {
        // 2. Widget is configured for OIDC, and returns tokens. This can be an
        //    array of tokens or a single token, depending on the initial
        //    configuration.
        console.log(JSON.stringify(res));
        alert('SUCCESS: OIDC with multiple responseTypes. Check console.');
      } else {
        console.log(JSON.stringify(res));
        alert('SUCCESS: OIDC with single responseType. Check Console');
      }
    },

    (err) => {
      console.error('global error handler: ', err);
    },
  ).catch(() => { /* we are using global error handler */ });

  siw.on('ready', () => {
    // handle `ready` event.
    // use `console.log` in particular so that those logs can be retrieved
    // in testcafe for assertion
    console.log('===== playground widget ready event received =====');
  });

  siw.on('afterRender', (context) => {
    // handle `afterRender` event.
    // use `console.log` in particular so that those logs can be retrieved
    // in testcafe for assertion
    console.log('===== playground widget afterRender event received =====');
    console.log(JSON.stringify(context));

    // assert english leaks if locale set to ok-PL
    if (config.language === 'ok-PL') {
      // Use innerText to avoid including hidden elements
      const viewText = document.getElementById('okta-sign-in')
        ?.innerText
        ?.split('\n').join(' ');

      const noTranslateElems = document.getElementsByClassName('no-translate');
      const noTranslationContent = [];
      if (noTranslateElems.length) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < noTranslateElems.length; i++) {
          // build array of noTranslationContent
          noTranslationContent.push(noTranslateElems[i].textContent);
        }
      }
      assertNoEnglishLeaks(null, viewText, noTranslationContent);
    }
  });

  siw.on('afterError', (context, error) => {
    // handle `afterError` event. use `console.log` in particular so that those
    // logs can be retrieved in testcafe for assertion
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
  const { searchParams } = new URL(window.location.href);
  if (searchParams.get('render') === '0' || searchParams.get('render') === 'false') {
    render = false;
  }
} else {
  throw new Error('window.URL undefined');
}

// set up msw
getWorker()
  .then((worker) => worker?.start())
  .then(() => {
    if (render) {
      renderPlaygroundWidget(window.additionalOptions ?? {});
    }
  })
