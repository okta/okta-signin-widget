/* eslint max-params: [2, 16] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/RecoveryChallengeForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/RECOVERY_CHALLENGE',
  'helpers/xhr/SMS_RESEND_error',
  'helpers/xhr/SMS_VERIFY_error',
  'helpers/xhr/200',
  'helpers/xhr/SUCCESS'
],
function (Okta, OktaAuth, Util, RecoveryChallengeForm, Beacon, Expect, Router,
  $sandbox, resChallenge, resResendError, resVerifyError, res200, resSuccess) {

  var { _, $ } = Okta;
  var SharedUtil = Okta.internal.util.Util;
  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup (settings) {
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
    var form = new RecoveryChallengeForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(resChallenge);
    return Util.mockIntrospectResponse(router, resChallenge).then(function () {
      router.refreshAuthState('dummy-token');
      // Two ticks because of the extra defer that happens when we disable
      // the sent button.
      return Expect.waitForRecoveryChallenge({
        router: router,
        form: form,
        beacon: beacon,
        ac: authClient,
        setNextResponse: setNextResponse,
        afterErrorHandler: afterErrorHandler
      })
        .then(tick);
    });
  }

  Expect.describe('RecoveryChallenge', function () {
    beforeEach(function () {
      var  throttle = _.throttle;
      spyOn(_, 'throttle').and.callFake(function (fn) {
        return throttle(fn, 0);
      });
      this.originalDelay = _.delay;
      spyOn(_, 'delay');
    });
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

    itp('does not show back link if hideBackToSignInForReset is true', function () {
      return setup({ 'features.hideBackToSignInForReset': true })
        .then(function (test) {
          var $link = test.form.signoutLink();
          expect($link.length).toBe(0);
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
            return tick(test);
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
    itp('has a text field to enter the recovery sms code', function () {
      return setup().then(function (test) {
        Expect.isTextField(test.form.codeField());
      });
    });
    itp('does not allow autocomplete', function () {
      return setup().then(function (test) {
        expect(test.form.getAutocompleteCodeField()).toBe('off');
      });
    });
    itp('has a disabled "Sent" button on initialize', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        var button = test.form.resendButton();
        expect(button.text()).toBe('Sent');
        button.click();
        return tick();
      }).then(function () {
        expect($.ajax.calls.count()).toBe(0);
      });
    });
    itp('has a "Re-send" button after a short delay', function () {
      var delay = this.originalDelay;
      _.delay.and.callFake(function (func, wait, args) {
        return delay(func, 0, args);
      });
      return setup().then(function (test) {
        expect(test.form.resendButton().text()).toBe('Re-send code');
      });
    });
    itp('"Re-send" button will resend the code and then be disabled', function () {
      var delay = this.originalDelay;
      _.delay.and.callFake(function (func, wait, args) {
        return delay(func, 0, args);
      });
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.setNextResponse(resChallenge);
        test.button = test.form.resendButton();
        test.button.click();
        expect(test.button.text()).toBe('Sent');
        expect(test.button.attr('class')).toMatch('link-button-disabled');
        return tick();
      }).then(function () {
        expect($.ajax.calls.count()).toBe(1);
        Expect.isJsonPost($.ajax.calls.argsFor(0), {
          url: 'https://foo.com/api/v1/authn/recovery/factors/SMS/resend',
          data: {
            stateToken: 'testStateToken'
          }
        });
      });
    });
    itp('displays only one error block when a resend button clicked several time and got error resp', function () {
      var delay = this.originalDelay;
      _.delay.and.callFake(function (func, wait, args) {
        return delay(func, 0, args);
      });
      return setup().then(function (test) {
        test.setNextResponse(resResendError);
        test.form.resendButton().click();
        return tick(test);
      })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toBe(1);
          test.setNextResponse(resResendError);
          test.form.resendButton().click();
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toBe(1);
        });
    });
    itp('makes the right auth request when form is submitted', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.setCode('1234');
        test.setNextResponse(resSuccess);
        test.form.submit();
        return tick();
      })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/factors/SMS/verify',
            data: {
              passCode: '1234',
              stateToken: 'testStateToken'
            }
          });
        });
    });
    itp('validates that the code is not empty before submitting', function () {
      return setup().then(function (test) {
        $.ajax.calls.reset();
        test.form.submit();
        expect($.ajax).not.toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
      });
    });
    itp('shows an error msg if there is an error re-sending the code', function () {
      var delay = this.originalDelay;
      _.delay.and.callFake(function (func, wait, args) {
        return delay(func, 0, args);
      });
      return setup()
        .then(function (test) {
          test.setNextResponse(resResendError);
          test.form.resendButton().click();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'recovery-challenge',
              settings: jasmine.any(Object)
            },
            {
              name: 'AuthApiError',
              message: 'You do not have permission to perform the requested action',
              statusCode: 403,
              xhr: {
                status: 403,
                responseType: 'json',
                responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oae-vceygQ0R2KIGrs9IRcVfw","errorCauses":[]}',
                responseJSON: {
                  errorCode: 'E0000006',
                  errorSummary: 'You do not have permission to perform the requested action',
                  errorLink: 'E0000006',
                  errorId: 'oae-vceygQ0R2KIGrs9IRcVfw',
                  errorCauses: []
                }
              }
            }
          ]);
        });
    });
    itp('shows an error msg if there is an error submitting the code', function () {
      return setup()
        .then(function (test) {
          test.setNextResponse(resVerifyError);
          test.form.setCode('1234');
          test.form.submit();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'recovery-challenge',
              settings: jasmine.any(Object)
            },
            {
              name: 'AuthApiError',
              message: 'You do not have permission to perform the requested action',
              statusCode: 403,
              xhr: {
                status: 403,
                responseType: 'json',
                responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oae3CaVvE33SqKyymZRyUWE7Q","errorCauses":[]}',
                responseJSON: {
                  errorCode: 'E0000006',
                  errorSummary: 'You do not have permission to perform the requested action',
                  errorLink: 'E0000006',
                  errorId: 'oae3CaVvE33SqKyymZRyUWE7Q',
                  errorCauses: []
                }
              }
            }
          ]);
        });
    });
  });

});
