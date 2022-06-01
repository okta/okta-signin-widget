/* eslint max-params: [2, 16] */
import { _, internal } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import RecoveryChallengeForm from 'helpers/dom/RecoveryChallengeForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import res200 from 'helpers/xhr/200';
import resResendError from 'helpers/xhr/MFA_RESEND_error';
import resVerifyError from 'helpers/xhr/MFA_VERIFY_error';
import resChallenge from 'helpers/xhr/RECOVERY_CHALLENGE';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;

async function setup(settings, mockDelay = false) {
  if (mockDelay) {
    const originalDelay = _.delay;
    spyOn(_, 'delay').and.callFake(function(func, wait, args) {
      return originalDelay(func, 0, args); // delay will call function wrapped in setTimeout()
    });
  }

  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl }
  });
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        features: { securityImage: true },
        authClient: authClient,
      },
      settings
    )
  );

  router.on('afterError', afterErrorHandler);
  const form = new RecoveryChallengeForm($sandbox);
  const beacon = new Beacon($sandbox);

  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  Util.mockJqueryCss();
  setNextResponse(resChallenge);
  const testData = {
    router: router,
    form: form,
    beacon: beacon,
    ac: authClient,
    setNextResponse: setNextResponse,
    afterErrorHandler: afterErrorHandler,
  };

  router.refreshAuthState('dummy-token');

  const test = await Expect.waitForRecoveryChallenge(testData);

  // mocking delay to use 0 time will still wrap functions in `setTimeout`
  if (mockDelay) {
    Util.callAllTimeouts();
  }
  return test;
}

Expect.describe('RecoveryChallenge', function() {
  beforeEach(function() {
    const throttle = _.throttle;

    spyOn(_, 'throttle').and.callFake(function(fn) {
      return throttle(fn, 0);
    });
  });
  itp('displays the security beacon', function() {
    return setup().then(function(test) {
      expect(test.beacon.isSecurityBeacon()).toBe(true);
    });
  });
  itp('has a signout link which cancels the current stateToken and navigates to primaryAuth', function() {
    return setup()
      .then(function(test) {
        spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
        Util.resetAjaxRequests();
        test.setNextResponse(res200);
        const $link = test.form.signoutLink();

        expect($link.length).toBe(1);
        expect($link.text()).toBe('Back to sign in');
        $link.click();
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/cancel',
          data: {
            stateToken: 'testStateToken',
          },
        });
        expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
        Expect.isPrimaryAuth(test.router.controller);
      });
  });

  itp('does not show back link if hideBackToSignInForReset is true', function() {
    return setup({ 'features.hideBackToSignInForReset': true }).then(function(test) {
      const $link = test.form.signoutLink();

      expect($link.length).toBe(0);
    });
  });

  itp('has a signout link which cancels the current stateToken and redirects to the provided signout url', function() {
    return setup({ signOutLink: 'http://www.goodbye.com' })
      .then(function(test) {
        spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
        spyOn(SharedUtil, 'redirect');
        Util.resetAjaxRequests();
        test.setNextResponse(res200);
        const $signOut = test.form.signoutLink($sandbox);
        expect($signOut.text()).toBe('Back to sign in');
        $signOut.click();
        return Expect.waitForSpyCall(test.router.controller.options.appState.clearLastAuthResponse, test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/cancel',
          data: {
            stateToken: 'testStateToken',
          },
        });
        expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
        expect(SharedUtil.redirect).toHaveBeenCalledWith('http://www.goodbye.com');
      });
  });
  itp('has a text field to enter the recovery sms code', function() {
    return setup().then(function(test) {
      Expect.isTextField(test.form.codeField());
    });
  });
  itp('does not allow autocomplete', function() {
    return setup().then(function(test) {
      expect(test.form.getAutocompleteCodeField()).toBe('off');
    });
  });
  itp('has a disabled "Sent" button on initialize', function() {
    return setup().then(function(test) {
      Util.resetAjaxRequests();
      spyOn(test.router.controller.model, 'resendCode').and.callThrough();
      const button = test.form.resendButton();

      expect(button.text()).toBe('Sent');
      button.click();
      expect(test.router.controller.model.resendCode.calls.count()).toBe(0);
      expect(Util.numAjaxRequests()).toBe(0);
    });
  });
  itp('has a "Re-send" button after a short delay', function() {
    return setup(undefined, true).then(function(test) {
      Util.callAllTimeouts();
      expect(test.form.resendButton().text()).toBe('Re-send code');
    });
  });
  itp('"Re-send" button will resend the code and then be disabled', function() {
    return setup(undefined, true)
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resChallenge);
        test.button = test.form.resendButton();
        test.button.click();
        expect(test.button.text()).toBe('Sent');
        expect(test.button.attr('class')).toMatch('link-button-disabled');
        return Expect.waitForAjaxRequest();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/recovery/factors/SMS/resend',
          data: {
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('displays only one error block when a resend button clicked several time and got error resp', function() {
    return setup(undefined, true)
      .then(function(test) {
        Util.callAllTimeouts();
        spyOn(test.router.controller.model, 'resendCode').and.callThrough();
        Util.resetAjaxRequests();
        test.setNextResponse(resResendError);
        test.form.resendButton().click();
        expect(test.router.controller.model.resendCode.calls.count()).toBe(1);
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox().length).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/recovery/factors/SMS/resend',
          data: {
            stateToken: 'testStateToken',
          },
        });

        Util.resetAjaxRequests();
        expect(Util.numAjaxRequests()).toBe(0);

        test.setNextResponse(resResendError);
        test.form.resendButton().click();
        return Expect.waitForAjaxRequest(test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox().length).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/recovery/factors/SMS/resend',
          data: {
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('makes the right auth request when form is submitted', function() {
    return setup()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.form.setCode('1234');
        test.setNextResponse(resSuccess);
        test.form.submit();
        return Expect.waitForAjaxRequest(test);
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/recovery/factors/SMS/verify',
          data: {
            passCode: '1234',
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('validates that the code is not empty before submitting', function() {
    return setup().then(function(test) {
      Util.resetAjaxRequests();
      test.form.submit();
      expect(Util.numAjaxRequests()).toBe(0);
      expect(test.form.hasErrors()).toBe(true);
    });
  });
  itp('shows an error msg if there is an error re-sending the code', function() {
    return setup(undefined, true)
      .then(function(test) {
        test.setNextResponse(resResendError);
        test.form.resendButton().click();
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'recovery-challenge',
          },
          {
            name: 'AuthApiError',
            message: 'You do not have permission to perform the requested action',
            statusCode: 403,
            xhr: {
              status: 403,
              headers: { 'content-type': 'application/json' },
              responseType: 'json',
              responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oae-vceygQ0R2KIGrs9IRcVfw","errorCauses":[]}',
              responseJSON: {
                errorCode: 'E0000006',
                errorSummary: 'You do not have permission to perform the requested action',
                errorLink: 'E0000006',
                errorId: 'oae-vceygQ0R2KIGrs9IRcVfw',
                errorCauses: [],
              },
            },
          },
        ]);
      });
  });
  itp('shows an error msg if there is an error submitting the code', function() {
    return setup()
      .then(function(test) {
        test.setNextResponse(resVerifyError);
        test.form.setCode('1234');
        test.form.submit();
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'recovery-challenge',
          },
          {
            name: 'AuthApiError',
            message: 'You do not have permission to perform the requested action',
            statusCode: 403,
            xhr: {
              status: 403,
              headers: { 'content-type': 'application/json' },
              responseType: 'json',
              responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oae3CaVvE33SqKyymZRyUWE7Q","errorCauses":[]}',
              responseJSON: {
                errorCode: 'E0000006',
                errorSummary: 'You do not have permission to perform the requested action',
                errorLink: 'E0000006',
                errorId: 'oae3CaVvE33SqKyymZRyUWE7Q',
                errorCauses: [],
              },
            },
          },
        ]);
      });
  });
});
