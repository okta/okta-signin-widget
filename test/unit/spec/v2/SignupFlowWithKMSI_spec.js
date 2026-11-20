import { _ } from '@okta/courage';
import Util from 'helpers/mocks/Util';
import BaseLoginRouter from 'v2/BaseLoginRouter';
import FormController from 'v2/controllers/FormController';
import $sandbox from 'sandbox';
import getAuthClient from 'helpers/getAuthClient';
import XHRInteract from '../../../../playground/mocks/data/oauth2/interact.json';
import RAW_IDX_RESPONSE from 'helpers/v2/idx/fullFlowResponse';
import EnrollProfileNew from '../../../../playground/mocks/data/idp/idx/enroll-profile-new.json';
import EnrollProfileWithPassword from '../../../../playground/mocks/data/idp/idx/enroll-profile-with-password.json';
import SelectAuthenticatorEnroll from '../../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator.json';
import SelectAuthenticatorEnrollWithSkip from '../../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator-with-skip.json';
import EnrollPassword from '../../../../playground/mocks/data/idp/idx/authenticator-enroll-password.json';
import PostAuthKeepMeSignedIn from '../../../../playground/mocks/data/idp/idx/post-auth-keep-me-signed-in.json';

// OKTA-1272313: embedded widget started with `flow: 'signup'` throws
// "No remediation can match current flow ... Remediations: [keep-me-signed-in]" once
// registration completes, because auth-js validates every remediation against
// RegistrationFlow, which has no keep-me-signed-in remediator.
//
// Drives the real gen2 router + FormController + auth-js; only XHR is mocked. Each test
// starts at interact -> introspect -> select-enroll-profile (auto-remediated by
// RegistrationFlow) -> enroll-profile, then covers one way registration can reach KMSI.

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
async function waitForForm(router, formName) {
  for (let i = 0; i < 100; i++) {
    if (router.appState.get('currentFormName') === formName) {
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

const userProfile = {
  'userProfile.firstName': 'Test',
  'userProfile.lastName': 'User',
  'userProfile.email': 'test.user@okta.com',
};

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
    $sandbox.empty();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // URL-aware XHR mock: /introspect returns the current idx state (like the real server),
  // every other idx endpoint advances to the next state in `steps`.
  function mockIdxServer(steps) {
    let current = RAW_IDX_RESPONSE;
    const requests = [];
    Util.mockAjax([]); // installs jasmine.Ajax + disables fetch
    jasmine.Ajax.stubRequest(/.*/).andCallFunction(request => {
      requests.push(request.url.replace(/^https?:\/\/[^/]+/, ''));
      let body;
      if (request.url.endsWith('/oauth2/v1/interact')) {
        body = XHRInteract;
      } else if (request.url.endsWith('/idp/idx/introspect')) {
        body = current;
      } else {
        current = steps.shift();
        body = current;
      }
      request.respondWith({ status: 200, responseText: JSON.stringify(body) });
    });
    return requests;
  }

  // Without the fix, auth-js throws "No remediation can match current flow" and the
  // widget stays on the previous form with an error callout.
  async function expectKeepMeSignedIn() {
    await waitForForm(router, 'keep-me-signed-in');
    expect($sandbox.find('.o-form-error-container').text()).not.toContain('No remediation can match');
    expect(globalErrorFn).not.toHaveBeenCalled();
  }

  it('renders keep-me-signed-in after enrolling password', async () => {
    const requests = mockIdxServer([
      EnrollProfileNew, // select-enroll-profile
      SelectAuthenticatorEnroll, // enroll-profile submit
      EnrollPassword, // select-authenticator-enroll (password)
      PostAuthKeepMeSignedIn, // enroll-authenticator (password)
    ]);

    await router.render(FormController);
    await waitForForm(router, 'enroll-profile');

    await submitForm(router, userProfile);
    await waitForForm(router, 'select-authenticator-enroll');

    await submitForm(router, { 'authenticator.id': 'autwa6eD9o02iBbtv0g3', 'authenticator.methodType': 'password' });
    await waitForForm(router, 'enroll-authenticator');

    await submitForm(router, {
      'credentials.passcode': 'Abcd1234!@',
      confirmPassword: 'Abcd1234!@',
    });

    await expectKeepMeSignedIn();
    expect(requests.filter(url => url === '/idp/idx/challenge/answer')).toHaveLength(1);
  });

  it('renders keep-me-signed-in after skipping optional authenticators', async () => {
    const requests = mockIdxServer([
      EnrollProfileNew, // select-enroll-profile
      SelectAuthenticatorEnrollWithSkip, // enroll-profile submit
      PostAuthKeepMeSignedIn, // skip
    ]);

    await router.render(FormController);
    await waitForForm(router, 'enroll-profile');

    await submitForm(router, userProfile);
    await waitForForm(router, 'select-authenticator-enroll');

    router.appState.trigger('invokeAction', 'skip');

    await expectKeepMeSignedIn();
    expect(requests.filter(url => url === '/idp/idx/skip')).toHaveLength(1);
  });

  it('renders keep-me-signed-in when the password is collected on the profile form', async () => {
    const requests = mockIdxServer([
      EnrollProfileWithPassword, // select-enroll-profile
      PostAuthKeepMeSignedIn, // enroll-profile submit
    ]);

    await router.render(FormController);
    await waitForForm(router, 'enroll-profile');

    await submitForm(router, {
      ...userProfile,
      'credentials.passcode': 'Abcd1234!@',
    });

    await expectKeepMeSignedIn();
    expect(requests.filter(url => url === '/idp/idx/enroll/new')).toHaveLength(1);
  });
});
