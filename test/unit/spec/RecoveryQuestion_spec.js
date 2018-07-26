/* eslint max-params: [2, 16] */
define([
  'vendor/lib/q',
  'okta/underscore',
  'okta/jquery',
  '@okta/okta-auth-js/jquery',
  'shared/util/Util',
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
function (Q, _, $, OktaAuth, SharedUtil, Util, RecoveryQuestionForm, Beacon, Expect, Router,
          $sandbox, resRecovery, resError, res200, resSuccess, resSuccessUnlock) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup(settings, res) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      features: { securityImage: true },
      authClient: authClient
    }, settings));
    var form = new RecoveryQuestionForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();

    resRecovery.response = _.extend(resRecovery.response, res);
    setNextResponse(resRecovery);
    router.refreshAuthState('dummy-token');

    return Expect.waitForRecoveryQuestion({
      router: router,
      form: form,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse
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
        Expect.isPrimaryAuth(test.router.controller);
      });
    });
    itp('has a signout link which cancels the current stateToken and redirects to the provided signout url',
    function () {
      return setup({ signOutLink: 'http://www.goodbye.com' })
      .then(function (test) {
        spyOn(SharedUtil, 'redirect');
        $.ajax.calls.reset();
        test.setNextResponse(res200);
        var $link = test.form.signoutLink();
        expect($link.length).toBe(1);
        $link.click();
        return tick();
      })
      .then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/cancel',
          data: {
            stateToken: 'testStateToken'
          }
        });
        expect(SharedUtil.redirect).toHaveBeenCalledWith('http://www.goodbye.com');
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
        return tick();
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
        return tick(test);
      })
      .then(function (test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('The recovery question answer did not match our records.');
      });
    });
  });

});
