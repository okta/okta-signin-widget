/* eslint max-params: [2, 16] */
define([
  'vendor/lib/q',
  'underscore',
  'jquery',
  'vendor/OktaAuth',
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
  'helpers/xhr/MFA_REQUIRED_oktaVerify',
  'helpers/xhr/SUCCESS'
],
function (Q, _, $, OktaAuth, Util, AccountRecoveryForm, PrimaryAuthForm, Beacon, Expect,
          Router, $sandbox, resError, resChallengeEmail, resChallengeSms,
          resMfaRequired, resSuccess) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup(settings, startRouter) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({uri: baseUrl});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: function () {}
    }, settings));
    var form = new AccountRecoveryForm($sandbox);
    var loginForm = new PrimaryAuthForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.mockRouterNavigate(router, startRouter);
    router.forgotPassword();
    return tick().then(function () {
      return {
        router: router,
        form: form,
        loginForm: loginForm,
        beacon: beacon,
        ac: authClient,
        setNextResponse: setNextResponse
      };
    });
  }

  var setupWithSms = _.partial(setup, { 'features.smsRecovery': true });

  describe('ForgotPassword', function () {
    beforeEach(function () {
      $.fx.off = true;
    });

    afterEach(function () {
      $.fx.off = false;
      $sandbox.empty();
    });

    describe('settings', function () {
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

    describe('elements', function () {
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
      itp('supports sms reset', function () {
        return setupWithSms().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(true);
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
    });

    describe('events', function () {
      itp('shows an error if username is empty and request email', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.form.submit();
          expect($.ajax).not.toHaveBeenCalled();
          expect(test.form.usernameErrorField().length).toBe(1);
        });
      });
      itp('sends email', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.submit();
          return tick();
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
      itp('updates appState username after sending email', function () {
        return setup()
        .then(function (test) {
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.submit();
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
          test.form.submit();
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.titleText()).toBe('Email sent!');
          expect(test.form.getEmailSentConfirmationText().indexOf('baz@bar') >= 0).toBe(true);
          expect(test.form.backToLoginButton().length).toBe(1);
          test.form.goBackToLogin();
          return tick(test);
        })
        .then(function (test) {
          expect(test.router.navigate).toHaveBeenCalledWith('', {trigger: true});
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
          test.form.submit();
          return tick(test);
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
          test.form.submit();
          return tick()
            .then(tick);
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
          test.form.submit();
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
          return tick();
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
          return tick(test);
        })
        .then(function (test) {
          expect(test.router.appState.get('username')).toBe('foo');
        });
      });
      itp('shows an error if sending sms results in an error', function () {
        return setupWithSms()
        .then(function (test) {
          Q.stopUnhandledRejectionTracking();
          test.setNextResponse(resError);
          test.form.setUsername('foo');
          test.form.sendSms();
          return tick(test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
        });
      });
      itp('does not have a problem with sending email after sending sms', function () {
        return setupWithSms()
        .then(function (test) {
          Q.stopUnhandledRejectionTracking();
          test.setNextResponse(resError);
          test.form.setUsername('foo');
          test.form.sendSms();
          return tick(test);
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          test.form.submit();
          return tick();
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
        return setup({}, {}, true).then(function (test) {
          Util.triggerBrowserBackButton();
          return test;
        })
        .then(function (test) {
          Expect.isPrimaryAuthController(test.router.controller);
          Util.stopRouter();
        });
      });
      itp('resets auth status on initialization', function () {
        return setup()
        .then(function (test) {
          test.form.goBack();
          return tick(test);
        })
        .then(function (test) {
          test.loginForm.setUsername('testuser');
          test.loginForm.setPassword('pass');
          test.setNextResponse(resMfaRequired);
          test.loginForm.submit();
          return tick(test);
        })
        .then(function (test) {
          test.router.navigate('signin/forgot-password');
          return tick(test);
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          test.form.setUsername('foo');
          test.form.submit();
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
          test.form.submit();
          return tick(test);
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
          return tick(test);
        })
        .then(function (test) {
          test.form.goBackToLogin();
          return tick(test);
        })
        .then(function (test) {
          expect(test.router.navigate).toHaveBeenCalledWith('', {trigger: true});

          // Click Forgot Password again
          test.loginForm.forgotPasswordLink().click();
          return tick(test);
        })
        .then(function (test) {
          // Submit the user name again
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.submit();
          return tick(test);
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
        return setup({
          helpSupportNumber: '(999) 123-4567'
        }).then(function (test) {
          expect(test.form.hasCantAccessEmailLink()).toBe(true);
          test.form.clickCantAccessEmail();
          expect(test.form.contactSupportText()).toMatch(/\(999\) 123-4567/);
          expect(test.form.hasCantAccessEmailLink()).toBe(false);
        });
      });
    });

  });

});
