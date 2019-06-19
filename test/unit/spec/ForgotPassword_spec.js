/* eslint max-params: [2, 18], max-statements: 0 */
define([
  'q',
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/AccountRecoveryForm',
  'helpers/dom/PrimaryAuthForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/RECOVERY_error',
  'helpers/xhr/RECOVERY_CHALLENGE_EMAIL_PWD',
  'helpers/xhr/RECOVERY_CHALLENGE_SMS_PWD',
  'helpers/xhr/RECOVERY_CHALLENGE_CALL_PWD',
  'helpers/xhr/MFA_REQUIRED_oktaVerify',
  'helpers/xhr/SUCCESS'
],
function (Q, Okta, OktaAuth, Util, AccountRecoveryForm, PrimaryAuthForm, Beacon, Expect,
  Router, $sandbox, resError, resChallengeEmail, resChallengeSms, resChallengeCall,
  resMfaRequired, resSuccess) {

  var { _, $ } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup (settings, startRouter) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var successSpy = jasmine.createSpy('success');
    var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy,
      'features.router': startRouter
    }, settings));
    var form = new AccountRecoveryForm($sandbox);
    var loginForm = new PrimaryAuthForm($sandbox);
    var beacon = new Beacon($sandbox);
    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);
    router.forgotPassword();
    return Expect.waitForForgotPassword({
      router: router,
      form: form,
      loginForm: loginForm,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy,
      afterErrorHandler: afterErrorHandler
    });
  }

  function transformUsername (name) {
    var suffix = '@example.com';
    return (name.indexOf(suffix) !== -1) ? name : (name + suffix);
  }

  var setupWithSms = _.partial(setup, { 'features.smsRecovery': true });
  var setupWithRedirect = _.partial(setup, {
    suppliedRedirectUri: 'https://example.com',
    relayState: '%2Fapp%2FUserHome'
  });
  var setupWithCall = _.partial(setup, { 'features.callRecovery': true });
  var setupWithSmsAndCall = _.partial(setup, { 'features.smsRecovery': true, 'features.callRecovery': true });
  var setupWithTransformUsername = _.partial(setup, { transformUsername: transformUsername });
  var setupWithoutEmail = _.partial(setup, { 'features.emailRecovery': false });
  var setupWithSmsWithoutEmail = _.partial(setup, { 'features.smsRecovery': true, 'features.emailRecovery': false });
  var setupWithCallWithoutEmail = _.partial(setup, { 'features.callRecovery': true, 'features.emailRecovery': false });
  var setupWithHideBackLink = _.partial(setup, { 'features.hideBackToSignInForReset': true });

  Expect.describe('ForgotPassword', function () {

    Expect.describe('settings', function () {
      itp('uses default title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toEqual('Reset Password');
        });
      });
      itp('uses default for username placeholder', function () {
        return setup().then(function (test) {
          var $username = test.form.usernameField();
          expect($username.attr('placeholder')).toEqual('Email or Username');
        });
      });
      itp('does not allow autocomplete', function () {
        return setup().then(function (test) {
          expect(test.form.getUsernameAutocomplete()).toBe('off');
        });
      });
      itp('uses default for username tooltip', function () {
        return setup().then(function (test) {
          var tip = test.form.usernameTooltipText();
          expect(tip).toEqual('Email or Username');
        });
      });
    });

    Expect.describe('elements', function () {
      itp('has a username field', function () {
        return setup().then(function (test) {
          var username = test.form.usernameField();
          expect(username.length).toBe(1);
          expect(username.attr('type')).toEqual('text');
        });
      });
      itp('doesn\'t have an sms reset by default', function () {
        return setup().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(false);
        });
      });
      itp('doesn\'t have a Voice Call reset by default', function () {
        return setup().then(function (test) {
          expect(test.form.hasCallButton()).toBe(false);
        });
      });
      itp('supports sms reset', function () {
        return setupWithSms().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(true);
          expect(test.form.hasCallButton()).toBe(false);
        });
      });
      itp('has sms hint', function () {
        return setupWithSms().then(function (test) {
          expect(test.form.hasMobileRecoveryHint()).toBe(true);
          expect(test.form.mobileRecoveryHintText())
            .toEqual('SMS can only be used if a mobile phone number has been configured.');
        });
      });
      itp('does not have sms hint if sms is not enabled', function () {
        return setup().then(function (test) {
          expect(test.form.hasMobileRecoveryHint()).toBe(false);
        });
      });
      itp('supports Voice Call reset', function () {
        return setupWithCall().then(function (test) {
          expect(test.form.hasCallButton()).toBe(true);
          expect(test.form.hasSmsButton()).toBe(false);
        });
      });
      itp('has Voice Call hint', function () {
        return setupWithCall().then(function (test) {
          expect(test.form.hasMobileRecoveryHint()).toBe(true);
          expect(test.form.mobileRecoveryHintText())
            .toEqual('Voice Call can only be used if a mobile phone number has been configured.');
        });
      });
      itp('supports SMS and Voice Call reset factors together', function () {
        return setupWithSmsAndCall().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(true);
          expect(test.form.hasCallButton()).toBe(true);
        });
      });
      itp('has SMS and Voice Call hint if both features are enabled', function () {
        return setupWithSmsAndCall().then(function (test) {
          expect(test.form.hasMobileRecoveryHint()).toBe(true);
          expect(test.form.mobileRecoveryHintText())
            .toEqual('SMS or Voice Call can only be used if a mobile phone number has been configured.');
        });
      });
      itp('shows a link to contact support when a help number is given', function () {
        return setup({helpSupportNumber: '(999) 123-4567'}).then(function (test) {
          expect(test.form.hasCantAccessEmailLink()).toBe(true);
        });
      });
      itp('shows no link to contact support by default', function () {
        return setup().then(function (test) {
          expect(test.form.hasCantAccessEmailLink()).toBe(false);
        });
      });
      itp('does not show email recovery button if emailRecovery is false', function () {
        return setupWithoutEmail().then(function (test) {
          expect(test.form.hasEmailButton()).toBe(false);
        });
      });
      itp('shows email recovery button if emailRecovery is true', function () {
        return setup().then(function (test) {
          expect(test.form.hasEmailButton()).toBe(true);
        });
      });
      itp('does not show back link if hideBackToSignInForReset is true ',
        function () {
          return setupWithHideBackLink().then(function (test) {
            expect(test.form.backToLoginButton().length).toBe(0);
          });
        });
      itp('shows error if no recovery factors are enabled', function () {
        return setupWithoutEmail().then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage())
            .toBe('No password reset options available. Please contact your administrator.');
        });
      });
      itp('supports SMS without email', function () {
        return setupWithSmsWithoutEmail().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(false);
        });
      });
      itp('supports Voice Call without email', function () {
        return setupWithCallWithoutEmail().then(function (test) {
          expect(test.form.hasCallButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(false);
        });
      });
    });

    Expect.describe('events', function () {
      itp('shows an error if username is empty and request email', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.sendEmail();
          expect($.ajax).not.toHaveBeenCalled();
          expect(test.form.usernameErrorField().length).toBe(1);
        });
      });
      itp('shows an error if username is too long', function () {
        return setup().then(function (test) {
          test.form.setUsername(Util.LoremIpsum);
          test.form.sendEmail();
          expect(test.form.usernameErrorField().length).toBe(1);
          expect(test.form.usernameErrorField().text()).toBe('Please check your username');
        });
      });
      itp('does not send email and show error when username is all whitespace', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.setUsername('  ');
          test.form.sendEmail();
          expect($.ajax.calls.count()).toBe(0);
          expect(test.form.usernameErrorField().length).toBe(1);
          expect(test.form.usernameErrorField().text()).toBe('This field cannot be left blank');
        });
      });
      itp('sends email', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.sendEmail();
          return tick();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'EMAIL',
              }
            });
          });
      });
      itp('sends email with relayState', function () {
        return setupWithRedirect().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.sendEmail();
          return tick();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'EMAIL',
                'relayState': '%2Fapp%2FUserHome'
              }
            });
          });
      });
      itp('sends email when pressing enter if Email is the only factor', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForPwdResetEmailSent();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'EMAIL',
              }
            });
          });
      });
      itp('should hide back button in PwdResetEmailSent page when hideBackToSignInForReset is true', function () {
        return setup({'features.hideBackToSignInForReset': true}).then(function (test) {
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForPwdResetEmailSent(test);
        })
          .then(function (test) {
            expect(test.form.backToLoginButton().length).toBe(0);
          });
      });
      itp('should show back button in PwdResetEmailSent page when hideBackToSignInForReset is false', function () {
        return setup({'features.hideBackToSignInForReset': false}).then(function (test) {
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForPwdResetEmailSent(test);
        })
          .then(function (test) {
            expect(test.form.backToLoginButton().length).toBe(1);
          });
      });
      itp('calls the transformUsername function with the right parameters', function () {
        return setupWithTransformUsername().then(function (test) {
          spyOn(test.router.settings, 'transformUsername');
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.sendEmail();
          expect(test.router.settings.transformUsername.calls.count()).toBe(1);
          expect(test.router.settings.transformUsername.calls.argsFor(0)).toEqual(['foo', 'FORGOT_PASSWORD']);
        });
      });
      itp('appends the suffix returned by the transformUsername function to the username', function () {
        return setupWithTransformUsername().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.sendEmail();
          return tick();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo@example.com',
                'factorType': 'EMAIL',
              }
            });
          });
      });
      itp('updates appState username after sending email', function () {
        return setup()
          .then(function (test) {
            test.setNextResponse(resChallengeEmail);
            test.form.setUsername('foo');
            test.form.sendEmail();
            return tick(test);
          })
          .then(function (test) {
            expect(test.router.appState.get('username')).toBe('foo');
          });
      });
      itp('shows email sent confirmation screen and has button to return to login', function () {
        return setup()
          .then(function (test) {
            test.form.setUsername('baz@bar');
            test.setNextResponse(resChallengeEmail);
            test.form.sendEmail();
            return Expect.waitForPwdResetEmailSent(test);
          })
          .then(function (test) {
            expect(test.form.titleText()).toBe('Email sent!');
            expect(test.form.accessibilityText()).toBe('Email sent!');
            expect(test.form.getEmailSentConfirmationText().indexOf('baz@bar') >= 0).toBe(true);
            expect(test.form.backToLoginButton().length).toBe(1);
            test.form.goBackToLogin();
            return Expect.waitForPrimaryAuth(test);
          })
          .then(function (test) {
            Expect.isPrimaryAuth(test.router.controller);
          });
      });
      // Note: Let's remove this test when OKTA-69083 is resolved
      itp('shows email sent confirmation screen even if API response is bad (OKTA-69083)', function () {
        return setup()
          .then(function (test) {
            test.form.setUsername('baz@bar');
            test.setNextResponse({
              'status': 200,
              'responseType': 'json',
              'response': {
                factorResult: 'WAITING',
                factorType: 'email',
                recoveryType: 'UNLOCK',
                status: 'RECOVERY_CHALLENGE'
              }
            });
            test.form.sendEmail();
            return Expect.waitForUnlockEmailSent(test);
          })
          .then(function (test) {
            expect(test.form.titleText()).toBe('Email sent!');
          });
      });
      itp('calls globalSuccessFn when an email has been sent', function () {
        var successSpy = jasmine.createSpy('successSpy');
        return setup({ globalSuccessFn: successSpy })
          .then(function (test) {
            test.form.setUsername('foo@bar');
            test.setNextResponse(resChallengeEmail);
            test.form.sendEmail();
            return Expect.waitForPwdResetEmailSent(test);
          })
          .then(function () {
            expect(successSpy).toHaveBeenCalledWith({
              status: 'FORGOT_PASSWORD_EMAIL_SENT',
              username: 'foo@bar'
            });
          });
      });
      itp('shows an error if sending email results in an error', function () {
        return setup()
          .then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resError);
            test.form.setUsername('foo');
            test.form.sendEmail();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          });
      });
      itp('shows an error if username is empty and request sms', function () {
        return setupWithSms().then(function (test) {
          $.ajax.calls.reset();
          test.form.sendSms();
          expect($.ajax).not.toHaveBeenCalled();
          expect(test.form.usernameErrorField().length).toBe(1);
        });
      });
      itp('sends sms', function () {
        return setupWithSms().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'SMS'
              }
            });
          });
      });
      itp('sends sms without email enabled', function () {
        return setupWithSmsWithoutEmail().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(false);
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'SMS'
              }
            });
          });
      });
      itp('sends sms when pressing enter if SMS is the only factor', function () {
        return setupWithSmsWithoutEmail().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForRecoveryChallenge();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'SMS'
              }
            });
          });
      });
      itp('sends sms when pressing enter if SMS is the first factor of the list', function () {
        return setupWithSmsAndCall().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(true);
          expect(test.form.hasCallButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(true);
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForRecoveryChallenge();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'SMS'
              }
            });
          });
      });
      itp('updates appState username after sending sms', function () {
        return setupWithSms()
          .then(function (test) {
            test.setNextResponse(resChallengeSms);
            test.form.setUsername('foo');
            test.form.sendSms();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function (test) {
            expect(test.router.appState.get('username')).toBe('foo');
          });
      });
      itp('shows an error if sending sms results in an error', function () {
        return setupWithSms()
          .then(function (test) {
            test.setNextResponse(resError);
            test.form.setUsername('foo');
            test.form.sendSms();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'forgot-password'
              },
              {
                name: 'AuthApiError',
                message: 'You do not have permission to perform the requested action',
                statusCode: 403,
                xhr: {
                  status: 403,
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oaeJFD_L3CcQoC9Am9y7tpfrQ","errorCauses":[]}',
                  responseJSON: {
                    errorCode: 'E0000006',
                    errorSummary: 'You do not have permission to perform the requested action',
                    errorLink: 'E0000006',
                    errorId: 'oaeJFD_L3CcQoC9Am9y7tpfrQ',
                    errorCauses: []
                  }
                }
              }
            ]);
          });
      });
      itp('does not have a problem with sending email after sending sms', function () {
        return setupWithSms()
          .then(function (test) {
            test.setNextResponse(resError);
            test.form.setUsername('foo');
            test.form.sendSms();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.sendEmail();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'EMAIL'
              }
            });
          });
      });
      itp('shows an error if username is empty and request Voice Call', function () {
        return setupWithCall().then(function (test) {
          $.ajax.calls.reset();
          test.form.makeCall();
          expect($.ajax).not.toHaveBeenCalled();
          expect(test.form.usernameErrorField().length).toBe(1);
        });
      });
      itp('makes a Voice Call', function () {
        return setupWithCall().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'CALL'
              }
            });
          });
      });
      itp('makes a Voice Call without email enabled', function () {
        return setupWithCallWithoutEmail().then(function (test) {
          expect(test.form.hasCallButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(false);
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'CALL'
              }
            });
          });
      });
      itp('makes a Voice Call when pressing enter if Voice Call is the only factor', function () {
        return setupWithCallWithoutEmail().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForRecoveryChallenge();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'CALL'
              }
            });
          });
      });
      itp('makes a Voice Call when pressing enter if Voice Call is the first factor of the list', function () {
        return setupWithCall().then(function (test) {
          expect(test.form.hasCallButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(true);
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForRecoveryChallenge();
        })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'CALL'
              }
            });
          });
      });
      itp('updates appState username after making a Voice Call', function () {
        return setupWithCall()
          .then(function (test) {
            test.setNextResponse(resChallengeCall);
            test.form.setUsername('foo');
            test.form.makeCall();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function (test) {
            expect(test.router.appState.get('username')).toBe('foo');
          });
      });
      itp('shows an error if making a Voice Call results in an error', function () {
        return setupWithCall()
          .then(function (test) {
            test.setNextResponse(resError);
            test.form.setUsername('foo');
            test.form.makeCall();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
            expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
            expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
              {
                controller: 'forgot-password'
              },
              {
                name: 'AuthApiError',
                message: 'You do not have permission to perform the requested action',
                statusCode: 403,
                xhr: {
                  status: 403,
                  responseType: 'json',
                  responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oaeJFD_L3CcQoC9Am9y7tpfrQ","errorCauses":[]}',
                  responseJSON: {
                    errorCode: 'E0000006',
                    errorSummary: 'You do not have permission to perform the requested action',
                    errorLink: 'E0000006',
                    errorId: 'oaeJFD_L3CcQoC9Am9y7tpfrQ',
                    errorCauses: []
                  }
                }
              }
            ]);
          });
      });
      itp('does not have a problem with sending email after making a Voice Call', function () {
        return setupWithCall()
          .then(function (test) {
            test.setNextResponse(resError);
            test.form.setUsername('foo');
            test.form.makeCall();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.sendEmail();
            return Expect.waitForSpyCall(test.successSpy);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'EMAIL'
              }
            });
          });
      });
      itp('goes back', function () {
        return setup().then(function (test) {
          test.form.goBack();
          expect(test.router.navigate).toHaveBeenCalledWith('', {trigger: true});
        });
      });
      itp('returns to primary auth when browser\'s back button is clicked', function () {
        return setup({}, true).then(function (test) {
          Util.triggerBrowserBackButton();
          return Expect.waitForPrimaryAuth(test);
        })
          .then(function (test) {
            Expect.isPrimaryAuth(test.router.controller);
            Util.stopRouter();
          });
      });
      itp('resets auth status on initialization', function () {
        return setup()
          .then(function (test) {
            test.form.goBack();
            return Expect.waitForPrimaryAuth(test);
          })
          .then(function (test) {
            test.loginForm.setUsername('testuser');
            test.loginForm.setPassword('pass');
            test.setNextResponse(resMfaRequired);
            test.loginForm.submit();
            return Expect.waitForMfaVerify(test);
          })
          .then(function (test) {
            test.router.navigate('signin/forgot-password');
            return tick(test);
          })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resSuccess);
            test.form.setUsername('foo');
            test.form.sendEmail();
            return tick();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
          });
      });
      itp('sends email, goes back to login page and allows resending', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.sendEmail();
          return Expect.waitForPwdResetEmailSent(test);
        })
          .then(function (test) {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'EMAIL'
              }
            });
            return test;
          })
          .then(function (test) {
            test.form.goBackToLogin();
            return Expect.waitForPrimaryAuth(test);
          })
          .then(function (test) {
            Expect.isPrimaryAuth(test.router.controller);

            // Click Forgot Password again
            test.loginForm.forgotPasswordLink().click();
            return Expect.waitForForgotPassword(test);
          })
          .then(function (test) {
          // Submit the user name again
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeEmail);
            test.form.setUsername('foo');
            test.form.sendEmail();
            return Expect.waitForPwdResetEmailSent(test);
          })
          .then(function () {
          // Expect the same request as before
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                'username': 'foo',
                'factorType': 'EMAIL'
              }
            });
          });
      });
      itp('shows an org\'s contact form when user clicks no email access link', function () {
        return setup({ helpSupportNumber: '(999) 123-4567' })
          .then(function (test) {
            expect(test.form.hasCantAccessEmailLink()).toBe(true);
            test.form.clickCantAccessEmail();
            expect(test.form.contactSupportText()).toMatch(/\(999\) 123-4567/);
            expect(test.form.hasCantAccessEmailLink()).toBe(false);
          });
      });
      itp('shows the "Reset via email" link after sending sms', function () {
        return setupWithSms()
          .then(function (test) {
            test.setNextResponse(resChallengeSms);
            test.form.setUsername('foo');
            test.form.sendSms();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function (test) {
            expect(test.form.hasSendEmailLink()).toBe(true);
            expect(test.form.sendEmailLink().trimmedText()).toEqual('Didn\'t receive a code? Reset via email');
          });
      });
      itp('does not show the "Reset via email" link after sending sms if emailRecovery is false', function () {
        return setupWithSmsWithoutEmail()
          .then(function (test) {
            test.setNextResponse(resChallengeSms);
            test.form.setUsername('foo');
            test.form.sendSms();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function (test) {
            expect(test.form.hasSendEmailLink()).toBe(false);
          });
      });
      itp('sends an email when user clicks the "Reset via email" link, after sending sms', function () {
        return setupWithSms().then(function (test) {
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo@bar');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge(test);
        })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeEmail);
            test.form.clickSendEmailLink();
            return Expect.waitForPwdResetEmailSent();
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                username: 'foo@bar',
                factorType: 'EMAIL'
              }
            });
          });
      });
      itp('shows email sent confirmation screen when user clicks the "Reset via email" link, after sending sms',
        function () {
          return setupWithSms().then(function (test) {
            test.setNextResponse(resChallengeSms);
            test.form.setUsername('foo@bar');
            test.form.sendSms();
            return Expect.waitForRecoveryChallenge(test);
          })
            .then(function (test) {
              test.setNextResponse(resChallengeEmail);
              test.form.clickSendEmailLink();
              return Expect.waitForPwdResetEmailSent(test);
            })
            .then(function (test) {
              expect(test.form.titleText()).toBe('Email sent!');
              expect(test.form.getEmailSentConfirmationText().indexOf('foo@bar') >= 0).toBe(true);
              expect(test.form.backToLoginButton().length).toBe(1);
            });
        });
      itp('shows an error if sending email via "Reset via email" link results in an error, after sending sms',
        function () {
          return setupWithSms().then(function (test) {
            test.setNextResponse(resChallengeSms);
            test.form.setUsername('foo');
            test.form.sendSms();
            return Expect.waitForRecoveryChallenge(test);
          })
            .then(function (test) {
              Q.stopUnhandledRejectionTracking();
              test.setNextResponse(resError);
              test.form.clickSendEmailLink();
              return tick(test);
            })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
            });
        });
      itp('shows the "Reset via email" link after making a Voice Call', function () {
        return setupWithCall().then(function (test) {
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge(test);
        })
          .then(function (test) {
            expect(test.form.hasSendEmailLink()).toBe(true);
            expect(test.form.sendEmailLink().trimmedText()).toEqual('Didn\'t receive a code? Reset via email');
          });
      });
      itp('does not show the "Reset via email" link after making a Voice Call if emailRecovery is false', function () {
        return setupWithCallWithoutEmail()
          .then(function (test) {
            test.setNextResponse(resChallengeCall);
            test.form.setUsername('foo');
            test.form.makeCall();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function (test) {
            expect(test.form.hasSendEmailLink()).toBe(false);
          });
      });
      itp('sends an email when user clicks the "Reset via email" link, after making a Voice Call', function () {
        return setupWithCall().then(function (test) {
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo@bar');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge(test);
        })
          .then(function (test) {
            $.ajax.calls.reset();
            test.setNextResponse(resChallengeEmail);
            test.form.clickSendEmailLink();
            return Expect.waitForPwdResetEmailSent(test);
          })
          .then(function () {
            expect($.ajax.calls.count()).toBe(1);
            Expect.isJsonPost($.ajax.calls.argsFor(0), {
              url: 'https://foo.com/api/v1/authn/recovery/password',
              data: {
                username: 'foo@bar',
                factorType: 'EMAIL'
              }
            });
          });
      });
      itp('shows email sent confirmation screen when user clicks the "Reset via email" link, after making a Voice Call',
        function () {
          return setupWithCall().then(function (test) {
            test.setNextResponse(resChallengeCall);
            test.form.setUsername('foo@bar');
            test.form.makeCall();
            return Expect.waitForRecoveryChallenge(test);
          })
            .then(function (test) {
              test.setNextResponse(resChallengeEmail);
              test.form.clickSendEmailLink();
              return Expect.waitForPwdResetEmailSent(test);
            })
            .then(function (test) {
              expect(test.form.titleText()).toBe('Email sent!');
              expect(test.form.getEmailSentConfirmationText().indexOf('foo@bar') >= 0).toBe(true);
              expect(test.form.backToLoginButton().length).toBe(1);
            });
        });
      itp('shows an error if sending email via "Reset via email" link results in an error, after making a Voice Call',
        function () {
          return setupWithCall().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resChallengeCall);
            test.form.setUsername('foo');
            test.form.makeCall();
            return Expect.waitForRecoveryChallenge(test);
          })
            .then(function (test) {
              test.setNextResponse(resError);
              test.form.clickSendEmailLink();
              return Expect.waitForFormError(test.form, test);
            })
            .then(function (test) {
              expect(test.form.hasErrors()).toBe(true);
              expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
              expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
              expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
                {
                  controller: 'recovery-challenge'
                },
                {
                  name: 'AuthApiError',
                  message: 'You do not have permission to perform the requested action',
                  statusCode: 403,
                  xhr: {
                    status: 403,
                    responseType: 'json',
                    responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oaeJFD_L3CcQoC9Am9y7tpfrQ","errorCauses":[]}',
                    responseJSON: {
                      errorCode: 'E0000006',
                      errorSummary: 'You do not have permission to perform the requested action',
                      errorLink: 'E0000006',
                      errorId: 'oaeJFD_L3CcQoC9Am9y7tpfrQ',
                      errorCauses: []
                    }
                  }
                }
              ]);
            });
        });
    });

  });

});
