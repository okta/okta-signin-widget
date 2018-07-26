/* eslint max-params: [2, 16], max-statements: [2, 39] */
define([
  'vendor/lib/q',
  'okta/underscore',
  'okta/jquery',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/AccountRecoveryForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/RECOVERY_error',
  'helpers/xhr/RECOVERY_CHALLENGE_EMAIL_UNLOCK',
  'helpers/xhr/RECOVERY_CHALLENGE_SMS_UNLOCK',
  'helpers/xhr/RECOVERY_CHALLENGE_CALL_UNLOCK'
],
function (Q, _, $, OktaAuth, Util, AccountRecoveryForm, Beacon, Expect, Router,
          $sandbox, resError, resChallengeEmail, resChallengeSms, resChallengeCall) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup(settings, startRouter) {
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://foo.com';
    var authClient = new OktaAuth({url: baseUrl});
    var successSpy = jasmine.createSpy('success');
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      'features.router': startRouter
    }, settings));
    var form = new AccountRecoveryForm($sandbox);
    var beacon = new Beacon($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);
    router.unlockAccount();
    return Expect.waitForUnlockAccount({
      router: router,
      form: form,
      beacon: beacon,
      setNextResponse: setNextResponse,
      successSpy: successSpy
    });
  }

  function transformUsername(name) {
    var suffix = '@example.com';
    return (name.indexOf(suffix) !== -1) ? name : (name + suffix);
  }

  var setupWithSms = _.partial(setup, { 'features.smsRecovery': true });
  var setupWithCall = _.partial(setup, { 'features.callRecovery': true });
  var setupWithSmsAndCall = _.partial(setup, { 'features.smsRecovery': true, 'features.callRecovery': true });
  var setupWithTransformUsername = _.partial(setup, { transformUsername: transformUsername });
  var setupWithoutEmail = _.partial(setup, { 'features.emailRecovery': false });
  var setupWithSmsWithoutEmail = _.partial(setup, { 'features.smsRecovery': true, 'features.emailRecovery': false });
  var setupWithCallWithoutEmail = _.partial(setup, { 'features.callRecovery': true, 'features.emailRecovery': false });

  Expect.describe('UnlockAccount', function () {

    Expect.describe('settings', function () {
      itp('has correct title', function () {
        return setup().then(function (test) {
          expect(test.form.titleText()).toEqual('Unlock account');
        });
      });
      itp('has correct username placeholder', function () {
        return setup().then(function (test) {
          var $username = test.form.usernameField();
          expect($username.attr('placeholder')).toEqual('Email or username');
        });
      });
      itp('does not allow autocomplete', function () {
        return setup().then(function (test) {
          expect(test.form.getUsernameAutocomplete()).toBe('off');
        });
      });
      itp('has correct username tooltip', function () {
        return setup().then(function (test) {
          var tip = test.form.usernameTooltipText();
          expect(tip).toEqual('Email or username');
        });
      });
    });

    Expect.describe('elements', function () {
      itp('has a username field', function () {
        return setup().then(function (test) {
          Expect.isTextField(test.form.usernameField());
        });
      });
      itp('doesn\'t have an sms option by default', function () {
        return setup().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(false);
        });
      });
      itp('doesn\'t have Voice Call option by default', function () {
        return setup().then(function (test) {
          expect(test.form.hasCallButton()).toBe(false);
        });
      });
      itp('supports sms', function () {
        return setupWithSms().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(true);
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
          expect(test.form.hasSmsHint()).toBe(false);
        });
      });
      itp('supports Voice Call', function () {
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
      itp('supports SMS and Voice Call unlock factors together', function () {
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
      itp('shows error if no recovery factors are enabled', function() {
        return setupWithoutEmail().then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('No unlock options available. Please contact your administrator.');
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
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'EMAIL'
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
          return Expect.waitForUnlockEmailSent();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              'username': 'foo',
              'factorType': 'EMAIL'
            }
          });
        });
      });
      itp('calls the transformUsername function with the right parameters', function () {
        return setupWithTransformUsername().then(function (test) {
          spyOn(test.router.settings, 'transformUsername');
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.sendEmail();
          expect(test.router.settings.transformUsername.calls.count()).toBe(1);
          expect(test.router.settings.transformUsername.calls.argsFor(0)).toEqual(['foo', 'UNLOCK_ACCOUNT']);
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
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo@example.com',
              factorType: 'EMAIL'
            }
          });
        });
      });
      itp('updates appState username after sending email', function () {
        return setup()
        .then(function (test) {
          test.form.setUsername('foo');
          test.setNextResponse(resChallengeEmail);
          test.form.sendEmail();
          return tick(test);
        })
        .then(function (test) {
          expect(test.router.appState.get('username')).toBe('foo');
        });
      });
      itp('shows email sent confirmation screen, and has a button that navigates back', function () {
        return setup()
        .then(function (test) {
          test.form.setUsername('foo@bar');
          test.setNextResponse(resChallengeEmail);
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function (test) {
          expect(test.form.titleText()).toBe('Email sent!');
          expect(test.form.getEmailSentConfirmationText().indexOf('foo@bar') >= 0).toBe(true);
          expect(test.form.backToLoginButton().length).toBe(1);
          test.form.goBackToLogin();
          expect(test.router.navigate).toHaveBeenCalledWith('', {trigger: true});
        });
      });
      itp('calls globalSuccessFn when an email has been sent', function () {
        var successSpy = jasmine.createSpy('successSpy');
        return setup({ globalSuccessFn: successSpy })
        .then(function (test) {
          test.form.setUsername('foo@bar');
          test.setNextResponse(resChallengeEmail);
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function () {
          expect(successSpy).toHaveBeenCalledWith({
            status: 'UNLOCK_ACCOUNT_EMAIL_SENT',
            username: 'foo@bar'
          });
        });
      });
      itp('shows an error if sending email results in an error', function () {
        return setup()
        .then(function (test) {
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
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
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
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
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
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              'username': 'foo',
              'factorType': 'SMS'
            }
          });
        });
      });
      itp('sends sms when pressing enter if SMS is the first factor of the list', function () {
        return setupWithSms().then(function (test) {
          expect(test.form.hasSmsButton()).toBe(true);
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
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
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
          test.form.setUsername('foo');
          test.setNextResponse(resChallengeSms);
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
          test.setNextResponse(resError);
          test.form.setUsername('foo');
          test.form.sendSms();
          return tick(test);
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resChallengeEmail);
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
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
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
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
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
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
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
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
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
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
        });
      });
      itp('goes back', function () {
        return setup().then(function (test) {
          test.form.goBack();
          expect(test.router.navigate).toHaveBeenCalledWith('', {trigger: true});
        });
      });
      itp('returns to primary auth when browser\'s back button is clicked', function () {
        return setup(null, true).then(function (test) {
          Util.triggerBrowserBackButton();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function (test) {
          Expect.isPrimaryAuth(test.router.controller);
          Util.stopRouter();
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
      itp('shows the "Unlock via email" link after sending sms', function () {
        return setupWithSms().then(function (test) {
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function (test) {
          expect(test.form.hasSendEmailLink()).toBe(true);
          expect(test.form.sendEmailLink().trimmedText()).toEqual('Didn\'t receive a code? Unlock via email');
        });
      });
      itp('does not show the "Unlock via email" link after sending sms if emailRecovery is false', function () {
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
      itp('sends an email when user clicks the "Unlock via email" link, after sending sms', function () {
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
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo@bar',
              factorType: 'EMAIL'
            }
          });
        });
      });
      itp('shows email sent confirmation screen when user clicks the "Unlock via email" link, after sending sms',
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
            return Expect.waitForUnlockEmailSent(test);
          })
          .then(function (test) {
            expect(test.form.titleText()).toBe('Email sent!');
            expect(test.form.getEmailSentConfirmationText().indexOf('foo@bar') >= 0).toBe(true);
            expect(test.form.backToLoginButton().length).toBe(1);
          });
        });
      itp('shows an error if sending email via "Unlock via email" link results in an error, after sending sms',
        function () {
          return setupWithSms().then(function (test) {
            Q.stopUnhandledRejectionTracking();
            test.setNextResponse(resChallengeSms);
            test.form.setUsername('foo');
            test.form.sendSms();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function (test) {
            test.setNextResponse(resError);
            test.form.clickSendEmailLink();
            return tick(test);
          })
          .then(function (test) {
            expect(test.form.hasErrors()).toBe(true);
            expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
          });
        });
      itp('shows the "Unlock via email" link after making a Voice Call', function () {
        return setupWithCall().then(function (test) {
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function (test) {
          expect(test.form.hasSendEmailLink()).toBe(true);
          expect(test.form.sendEmailLink().trimmedText()).toEqual('Didn\'t receive a code? Unlock via email');
        });
      });
      itp('does not show the "Unlock via email" link after making a Voice Call if emailRecovery is false', function () {
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
      itp('sends an email when user clicks the "Unlock via email" link, after making a Voice Call', function () {
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
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo@bar',
              factorType: 'EMAIL'
            }
          });
        });
      });
      itp('shows email sent confirmation when user clicks "Unlock via email" link, after making a Voice Call',
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
            return Expect.waitForUnlockEmailSent(test);
          })
          .then(function (test) {
            expect(test.form.titleText()).toBe('Email sent!');
            expect(test.form.getEmailSentConfirmationText().indexOf('foo@bar') >= 0).toBe(true);
            expect(test.form.backToLoginButton().length).toBe(1);
          });
        });
      itp('shows an error if sending email via "Unlock via email" link results in an error, after making a Voice Call',
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
          });
        });

    });

  });

});
