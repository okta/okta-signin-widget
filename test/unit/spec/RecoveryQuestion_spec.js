/* eslint max-params: [2, 16] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/RecoveryQuestionForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/RECOVERY',
  'helpers/xhr/RECOVERY_ANSWER_error',
  'helpers/xhr/200',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/SUCCESS_unlock'
],
function (Okta, OktaAuth, Util, RecoveryQuestionForm, Beacon, Expect, Router,
  $sandbox, resRecovery, resError, res200, resSuccess, resSuccessUnlock) {

  var { _, $ } = Okta;
  var SharedUtil = Okta.internal.util.Util;
  var itp = Expect.itp;

  function setup (settings, res) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      features: { securityImage: true },
      authClient: authClient
    }, settings));
    router.on('afterError', afterErrorHandler);
    var form = new RecoveryQuestionForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();

    resRecovery.response = _.extend(resRecovery.response, res);
    setNextResponse(resRecovery);
    return Util.mockIntrospectResponse(router, resRecovery).then(function () {
      router.refreshAuthState('dummy-token');

      return Expect.waitForRecoveryQuestion({
        router: router,
        form: form,
        beacon: beacon,
        ac: authClient,
        setNextResponse: setNextResponse,
        afterErrorHandler: afterErrorHandler
      });
    });

  }

  var setupOIDC = _.partial(setup, { clientId: 'someClientId' });

  Expect.describe('RecoveryQuestion', function () {
    itp('displays the security beacon', function () {
      return setup().then(function (test) {
        expect(test.beacon.isSecurityBeacon()).toBe(true);
      });
    });
    itp('has a signout link which cancels the current stateToken and navigates to primaryAuth', function () {
      return setup()
        .then(function (test) {
          spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
          $.ajax.calls.reset();
          test.setNextResponse(res200);
          var $link = test.form.signoutLink();
          expect($link.length).toBe(1);
          $link.click();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/cancel',
            data: {
              stateToken: 'testStateToken'
            }
          });
          expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
          Expect.isPrimaryAuth(test.router.controller);
        });
    });
    itp('has a signout link which cancels the current stateToken and redirects to the provided signout url',
      function () {
        return setup({ signOutLink: 'http://www.goodbye.com' })
          .then(function (test) {
            spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
            spyOn(SharedUtil, 'redirect');
            $.ajax.calls.reset();
            test.setNextResponse(res200);
            var $link = test.form.signoutLink();
            expect($link.length).toBe(1);
            $link.click();
            return Expect.waitForSpyCall(SharedUtil.redirect, test);
          })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/cancel',
              data: {
                stateToken: 'testStateToken'
              }
            });
            expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
            expect(SharedUtil.redirect).toHaveBeenCalledWith('http://www.goodbye.com');
          });
      });
    itp('does not show back link if hideBackToSignInForReset is true', function () {
      return setup({ 'features.hideBackToSignInForReset': true })
        .then(function (test) {
          var $link = test.form.signoutLink();
          expect($link.length).toBe(0);
        });
    });
    itp('sets the correct title for a forgotten password flow', function () {
      return setup().then(function (test) {
        expect(test.form.titleText()).toBe('Answer Forgotten Password Challenge');
      });
    });
    itp('sets the correct submit button value for a forgotten password flow', function () {
      return setup().then(function (test) {
        expect(test.form.submitButton().val()).toBe('Reset Password');
      });
    });
    itp('sets the correct title for an unlock account flow', function () {
      return setup({}, {recoveryType: 'UNLOCK'}).then(function (test) {
        expect(test.form.titleText()).toBe('Answer Unlock Account Challenge');
      });
    });
    itp('sets the correct submit button value for an unlock account flow', function () {
      return setup({}, {recoveryType: 'UNLOCK'}).then(function (test) {
        expect(test.form.submitButton().val()).toBe('Unlock Account');
      });
    });
    itp('sets the correct label based on the auth response', function () {
      return setup().then(function (test) {
        expect(test.form.labelText('answer')).toBe('Last 4 digits of your social security number?');
      });
    });
    itp('has a text field to enter the security question answer', function () {
      return setup().then(function (test) {
        Expect.isPasswordField(test.form.answerField());
      });
    });
    itp('has a show answer checkbox', function () {
      return setup().then(function (test) {
        var showAnswer = test.form.showAnswerCheckbox();
        expect(showAnswer.length).toBe(1);
        expect(showAnswer.attr('type')).toEqual('checkbox');
        expect(test.form.showAnswerLabelText()).toEqual('Show');
      });
    });
    itp('the answer field type is "password" initially and is changed to text \
          when a "show answer" checkbox is checked', function () {
      return setup().then(function (test) {
        var answer = test.form.answerField();
        expect(test.form.showAnswerCheckboxStatus()).toEqual('unchecked');
        expect(answer.attr('type')).toEqual('password');
        test.form.setShowAnswer(true);
        expect(test.form.answerField().attr('type')).toEqual('text');
        test.form.setShowAnswer(false);
        expect(test.form.answerField().attr('type')).toEqual('password');
      });
    });
    itp('makes the right auth request when form is submitted', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.setAnswer('4444');
        test.setNextResponse(resSuccess);
        test.form.submit();
        return Expect.waitForSpyCall($.ajax);
      })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/answer',
            data: {
              answer: '4444',
              stateToken: 'testStateToken'
            }
          });
        });
    });
    itp('shows unlock page when response is success with unlock recoveryType', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.setAnswer('4444');
        test.setNextResponse(resSuccessUnlock);
        test.form.submit();
        return Expect.waitForAccountUnlocked(test);
      })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/answer',
            data: {
              answer: '4444',
              stateToken: 'testStateToken'
            }
          });
          expect(test.form.titleText()).toBe('Account successfully unlocked!');
          expect(test.form.backToLoginButton().length).toBe(1);
          test.form.goBackToLogin();
          expect(test.router.navigate).toHaveBeenCalledWith('', {trigger: true});
        });
    });
    itp('with OIDC configured, it shows unlock page when response is success with unlock recoveryType', function () {
      return setupOIDC().then(function (test) {
        $.ajax.calls.reset();
        test.form.setAnswer('4444');
        test.setNextResponse(resSuccessUnlock);
        test.form.submit();
        return Expect.waitForAccountUnlocked(test);
      })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/answer',
            data: {
              answer: '4444',
              stateToken: 'testStateToken'
            }
          });
          expect(test.form.titleText()).toBe('Account successfully unlocked!');
          expect(test.form.backToLoginButton().length).toBe(1);
          test.form.goBackToLogin();
          expect(test.router.navigate).toHaveBeenCalledWith('', {trigger: true});
        });
    });
    itp('validates that the answer is not empty before submitting', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.submit();
        expect($.ajax).not.toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
      });
    });
    itp('shows an error msg if there is an error submitting the answer', function () {
      return setup()
        .then(function (test) {
          test.setNextResponse(resError);
          test.form.setAnswer('4444');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('The recovery question answer did not match our records.');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'recovery-question'
            },
            {
              name: 'AuthApiError',
              message: 'The recovery question answer did not match our records.',
              statusCode: 400,
              xhr: {
                status: 400,
                responseType: 'json',
                responseText: '{"errorCode":"E0000087","errorSummary":"The recovery question answer did not match our records.","errorLink":"E0000087","errorId":"oaelYrw2A4AThiuqrb4UhGdUg","errorCauses":[]}',
                responseJSON: {
                  errorCode: 'E0000087',
                  errorSummary: 'The recovery question answer did not match our records.',
                  errorLink: 'E0000087',
                  errorId: 'oaelYrw2A4AThiuqrb4UhGdUg',
                  errorCauses: []
                }
              }
            }
          ]);
        });
    });
  });

});
