/* eslint max-params: [2, 16] */
import { _, internal } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import RecoveryQuestionForm from 'helpers/dom/RecoveryQuestionForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import res200 from 'helpers/xhr/200';
import resRecovery from 'helpers/xhr/RECOVERY';
import resError from 'helpers/xhr/RECOVERY_ANSWER_error';
import resSuccess from 'helpers/xhr/SUCCESS';
import resSuccessUnlock from 'helpers/xhr/SUCCESS_unlock';
import $sandbox from 'sandbox';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;

function setup(settings, res) {
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
  const form = new RecoveryQuestionForm($sandbox);
  const beacon = new Beacon($sandbox);

  const test = {
    router: router,
    form: form,
    beacon: beacon,
    ac: authClient,
    setNextResponse: setNextResponse,
    afterErrorHandler: afterErrorHandler,
  };
  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  Util.mockJqueryCss();

  resRecovery.response = _.extend(resRecovery.response, res);
  setNextResponse(resRecovery);
  router.refreshAuthState('dummy-token');
  return Expect.waitForRecoveryQuestion(test);
}

const setupOIDC = _.partial(setup, { clientId: 'someClientId' });

Expect.describe('RecoveryQuestion', function() {
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
        return Expect.waitForSpyCall(SharedUtil.redirect, test);
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
  itp('does not show back link if hideBackToSignInForReset is true', function() {
    return setup({ 'features.hideBackToSignInForReset': true }).then(function(test) {
      const $link = test.form.signoutLink();

      expect($link.length).toBe(0);
    });
  });
  itp('sets the correct title for a forgotten password flow', function() {
    return setup().then(function(test) {
      expect(test.form.titleText()).toBe('Answer Forgotten Password Challenge');
    });
  });
  itp('sets the correct submit button value for a forgotten password flow', function() {
    return setup().then(function(test) {
      expect(test.form.submitButton().val()).toBe('Reset Password');
    });
  });
  itp('sets the correct title for an unlock account flow', function() {
    return setup({}, { recoveryType: 'UNLOCK' }).then(function(test) {
      expect(test.form.titleText()).toBe('Answer Unlock Account Challenge');
    });
  });
  itp('sets the correct submit button value for an unlock account flow', function() {
    return setup({}, { recoveryType: 'UNLOCK' }).then(function(test) {
      expect(test.form.submitButton().val()).toBe('Unlock Account');
    });
  });
  itp('sets the correct label based on the auth response', function() {
    return setup().then(function(test) {
      expect(test.form.labelText('answer')).toBe('Last 4 digits of your social security number?');
    });
  });
  itp('has a text field to enter the security question answer', function() {
    return setup().then(function(test) {
      Expect.isPasswordField(test.form.answerField());
    });
  });
  itp('has a show answer checkbox', function() {
    return setup().then(function(test) {
      const showAnswer = test.form.showAnswerCheckbox();

      expect(showAnswer.length).toBe(1);
      expect(showAnswer.attr('type')).toEqual('checkbox');
      expect(test.form.showAnswerLabelText()).toEqual('Show');
    });
  });
  itp(
    'the answer field type is "password" initially and is changed to text \
          when a "show answer" checkbox is checked',
    function() {
      return setup().then(function(test) {
        const answer = test.form.answerField();

        expect(test.form.showAnswerCheckboxStatus()).toEqual('unchecked');
        expect(answer.attr('type')).toEqual('password');
        test.form.setShowAnswer(true);
        expect(test.form.answerField().attr('type')).toEqual('text');
        test.form.setShowAnswer(false);
        expect(test.form.answerField().attr('type')).toEqual('password');
      });
    }
  );
  itp('makes the right auth request when form is submitted', function() {
    return setup()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.form.setAnswer('4444');
        test.setNextResponse(resSuccess);
        test.form.submit();
        return Expect.waitForAjaxRequest();
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/recovery/answer',
          data: {
            answer: '4444',
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('shows unlock page when response is success with unlock recoveryType', function() {
    return setup()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.form.setAnswer('4444');
        test.setNextResponse(resSuccessUnlock);
        test.form.submit();
        return Expect.waitForAccountUnlocked(test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/recovery/answer',
          data: {
            answer: '4444',
            stateToken: 'testStateToken',
          },
        });
        expect(test.form.titleText()).toBe('Account successfully unlocked!');
        expect(test.form.backToLoginButton().length).toBe(1);
        test.form.goBackToLogin();
        expect(test.router.navigate).toHaveBeenCalledWith('', { trigger: true });
      });
  });
  itp('with OIDC configured, it shows unlock page when response is success with unlock recoveryType', function() {
    return setupOIDC()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.form.setAnswer('4444');
        test.setNextResponse(resSuccessUnlock);
        test.form.submit();
        return Expect.waitForAccountUnlocked(test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/recovery/answer',
          data: {
            answer: '4444',
            stateToken: 'testStateToken',
          },
        });
        expect(test.form.titleText()).toBe('Account successfully unlocked!');
        expect(test.form.backToLoginButton().length).toBe(1);
        test.form.goBackToLogin();
        expect(test.router.navigate).toHaveBeenCalledWith('', { trigger: true });
      });
  });
  itp('validates that the answer is not empty before submitting', function() {
    return setup().then(function(test) {
      Util.resetAjaxRequests();
      test.form.submit();
      expect(Util.numAjaxRequests()).toBe(0);
      expect(test.form.hasErrors()).toBe(true);
    });
  });
  itp('shows an error msg if there is an error submitting the answer', function() {
    return setup()
      .then(function(test) {
        test.setNextResponse(resError);
        test.form.setAnswer('4444');
        test.form.submit();
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('The recovery question answer did not match our records.');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'recovery-question',
          },
          {
            name: 'AuthApiError',
            message: 'The recovery question answer did not match our records.',
            statusCode: 400,
            xhr: {
              status: 400,
              headers: { 'content-type': 'application/json' },
              responseType: 'json',
              responseText: '{"errorCode":"E0000087","errorSummary":"The recovery question answer did not match our records.","errorLink":"E0000087","errorId":"oaelYrw2A4AThiuqrb4UhGdUg","errorCauses":[]}',
              responseJSON: {
                errorCode: 'E0000087',
                errorSummary: 'The recovery question answer did not match our records.',
                errorLink: 'E0000087',
                errorId: 'oaelYrw2A4AThiuqrb4UhGdUg',
                errorCauses: [],
              },
            },
          },
        ]);
      });
  });
});
