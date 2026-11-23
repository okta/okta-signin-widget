import { _ } from '@okta/courage';
import Util from 'helpers/mocks/Util';
import BaseLoginRouter from 'v2/BaseLoginRouter';
import FormController from 'v2/controllers/FormController';
import $sandbox from 'sandbox';
import getAuthClient from 'helpers/getAuthClient';
import XHRInteract from '../../../../playground/mocks/data/oauth2/interact.json';
import RAW_IDX_RESPONSE from 'helpers/v2/idx/fullFlowResponse';
import EnrollProfileNew from '../../../../playground/mocks/data/idp/idx/enroll-profile-new.json';
import EnrollEmail from '../../../../playground/mocks/data/idp/idx/authenticator-enroll-email.json';
import EnrollPassword from '../../../../playground/mocks/data/idp/idx/authenticator-enroll-password.json';
import SelectAuthenticatorEnrollWithSkip from '../../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-with-skip.json';
import PostAuthKeepMeSignedIn from '../../../../playground/mocks/data/idp/idx/post-auth-keep-me-signed-in.json';

// OKTA-1272313: embedded widget started with `flow: 'signup'` throws
// "No remediation can match current flow ... Remediations: [keep-me-signed-in]" once
// registration completes, because auth-js validates every remediation against
// RegistrationFlow, which has no keep-me-signed-in remediator.
//
// Drives the real gen2 router + FormController + auth-js; only XHR is mocked. Follows the
// customer HAR: enroll-profile -> enroll email -> enroll password -> skip optional
// authenticators -> keep-me-signed-in.

const TestRouter = BaseLoginRouter.extend({
  routes: {
    '': 'defaultAuth',
    '*wildcard': 'defaultAuth',
  },
  defaultAuth() {
    this.render(FormController);
  },
});

// wait for the async save chain (proceed -> remediate -> render) to settle
async function waitForForm(router, formName, authenticatorKey) {
  for (let i = 0; i < 100; i++) {
    if (router.appState.get('currentFormName') === formName
      && (!authenticatorKey || router.appState.get('authenticatorKey') === authenticatorKey)) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error(
    `timed out waiting for form "${formName}", current: "${router.appState.get('currentFormName')}"`
  );
}

async function submitForm(router, values) {
  const { formView } = router.controller;
  formView.model.set(values);
  router.appState.trigger('saveForm', formView.model);
}

describe('v2 signup flow with post-auth KMSI (OKTA-1272313)', () => {
  let router;
  let globalErrorFn;

  beforeEach(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    globalErrorFn = jest.fn();
    const baseUrl = 'http://localhost:3000';
    const authClient = getAuthClient({
      authParams: {
        issuer: baseUrl,
        clientId: 'someClientId',
        pkce: false,
        codeChallenge: 'someCodeChallenge', // skip PKCE / well-known
        flow: 'signup',
        transactionManager: { saveLastResponse: false },
      },
    });
    router = new TestRouter(_.extend({
      el: $sandbox,
      baseUrl,
      authClient,
      clientId: 'someClientId',
      codeChallenge: 'someCodeChallenge',
      flow: 'signup',
      globalErrorFn,
    }));
  });

  afterEach(() => {
    router.controller?.formView?.form?.stopPolling?.();
    $sandbox.empty();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // URL-aware XHR mock: /introspect and /challenge/poll return the current idx state (like
  // the real server while waiting on the user), every other idx endpoint advances to the
  // next state in `steps`.
  function mockIdxServer(steps) {
    let current = RAW_IDX_RESPONSE;
    const requests = [];
    Util.mockAjax([]); // installs jasmine.Ajax + disables fetch
    jasmine.Ajax.stubRequest(/.*/).andCallFunction(request => {
      requests.push(request.url.replace(/^https?:\/\/[^/]+/, ''));
      let body;
      if (request.url.endsWith('/oauth2/v1/interact')) {
        body = XHRInteract;
      } else if (/\/idp\/idx\/(introspect|challenge\/poll)$/.test(request.url)) {
        body = current;
      } else {
        current = steps.shift();
        body = current;
      }
      request.respondWith({ status: 200, responseText: JSON.stringify(body) });
    });
    return requests;
  }

  it('renders keep-me-signed-in after enrolling email and password and skipping the rest', async () => {
    const requests = mockIdxServer([
      EnrollProfileNew, // select-enroll-profile (auto-remediated by RegistrationFlow)
      EnrollEmail, // enroll-profile submit
      EnrollPassword, // enroll-authenticator (email code)
      SelectAuthenticatorEnrollWithSkip, // enroll-authenticator (password)
      PostAuthKeepMeSignedIn, // skip
    ]);

    await router.render(FormController);
    await waitForForm(router, 'enroll-profile');

    await submitForm(router, {
      'userProfile.firstName': 'Test',
      'userProfile.lastName': 'User',
      'userProfile.email': 'test.user@okta.com',
    });
    await waitForForm(router, 'enroll-authenticator', 'okta_email');

    await submitForm(router, { 'credentials.passcode': '123456' });
    await waitForForm(router, 'enroll-authenticator', 'okta_password');

    await submitForm(router, {
      'credentials.passcode': 'Abcd1234!@',
      confirmPassword: 'Abcd1234!@',
    });
    await waitForForm(router, 'select-authenticator-enroll');

    router.appState.trigger('invokeAction', 'skip');

    // Without the fix, auth-js throws "No remediation can match current flow" and the
    // widget stays on select-authenticator-enroll with an error callout.
    await waitForForm(router, 'keep-me-signed-in');
    expect($sandbox.find('.o-form-error-container').text()).not.toContain('No remediation can match');
    expect(globalErrorFn).not.toHaveBeenCalled();
    expect(requests.filter(url => url === '/idp/idx/skip')).toHaveLength(1);
  });
});
