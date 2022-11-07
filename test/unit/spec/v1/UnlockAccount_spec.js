/* eslint max-params: [2, 16], max-statements: [2, 44] */
import { _ } from 'okta';
import getAuthClient from 'helpers/getAuthClient';
import Router from 'v1/LoginRouter';
import AccountRecoveryForm from 'helpers/dom/AccountRecoveryForm';
import Beacon from 'helpers/dom/Beacon';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resChallengeCall from 'helpers/xhr/RECOVERY_CHALLENGE_CALL_UNLOCK';
import resChallengeEmail from 'helpers/xhr/RECOVERY_CHALLENGE_EMAIL_UNLOCK';
import resChallengeSms from 'helpers/xhr/RECOVERY_CHALLENGE_SMS_UNLOCK';
import resError from 'helpers/xhr/RECOVERY_error';
import $sandbox from 'sandbox';

const itp = Expect.itp;

async function setup(settings, startRouter) {
  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl }
  });
  const successSpy = jasmine.createSpy('success');
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        'features.router': startRouter,
      },
      settings
    )
  );

  router.on('afterError', afterErrorHandler);
  const form = new AccountRecoveryForm($sandbox);
  const beacon = new Beacon($sandbox);

  Util.registerRouter(router);
  Util.mockRouterNavigate(router, startRouter);
  if (startRouter) {
    await Expect.waitForPrimaryAuth();
  }
  router.unlockAccount();
  return Expect.waitForUnlockAccount({
    router: router,
    form: form,
    beacon: beacon,
    setNextResponse: setNextResponse,
    successSpy: successSpy,
    afterErrorHandler: afterErrorHandler,
  });
}

function transformUsername(name) {
  const suffix = '@example.com';

  return name.indexOf(suffix) !== -1 ? name : name + suffix;
}

function expectError(test, controller) {
  const message = 'You do not have permission to perform the requested action';

  expect(test.form.hasErrors()).toBe(true);
  expect(test.form.errorMessage()).toBe(message);
  expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
  expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
    {
      controller: controller || 'account-unlock',
    },
    {
      name: 'AuthApiError',
      message: message,
      statusCode: 403,
      xhr: {
        status: 403,
        headers: { 'content-type': 'application/json' },
        responseType: 'json',
        responseText: '{"errorCode":"E0000006","errorSummary":"You do not have permission to perform the requested action","errorLink":"E0000006","errorId":"oaeJFD_L3CcQoC9Am9y7tpfrQ","errorCauses":[]}',
        responseJSON: {
          errorCode: 'E0000006',
          errorSummary: message,
          errorLink: 'E0000006',
          errorId: 'oaeJFD_L3CcQoC9Am9y7tpfrQ',
          errorCauses: [],
        },
      },
    },
  ]);
}

const setupWithSms = _.partial(setup, { 'features.smsRecovery': true });

const setupWithCall = _.partial(setup, { 'features.callRecovery': true });

const setupWithSmsAndCall = _.partial(setup, { 'features.smsRecovery': true, 'features.callRecovery': true });

const setupWithTransformUsername = _.partial(setup, { transformUsername: transformUsername });

const setupWithoutEmail = _.partial(setup, { 'features.emailRecovery': false });

const setupWithSmsWithoutEmail = _.partial(setup, { 'features.smsRecovery': true, 'features.emailRecovery': false });

const setupWithCallWithoutEmail = _.partial(setup, { 'features.callRecovery': true, 'features.emailRecovery': false });

Expect.describe('UnlockAccount', function() {
  Expect.describe('settings', function() {
    itp('has correct title', function() {
      return setup().then(function(test) {
        expect(test.form.titleText()).toEqual('Unlock account');
      });
    });
    itp('has correct username label', function() {
      return setup().then(function(test) {
        const $usernameLabel = test.form.usernameLabel();

        expect($usernameLabel.text().trim()).toEqual('Email or username');
      });
    });
    itp('does not allow autocomplete', function() {
      return setup().then(function(test) {
        expect(test.form.getUsernameAutocomplete()).toBe('off');
      });
    });
    itp('username field does not have explain by default', function() {
      return setup().then(function(test) {
        const explain = test.form.usernameExplain();

        expect(explain.length).toBe(0);
      });
    });
    itp('username field does have explain when is customized', function() {
      const options = {
        i18n: {
          en: {
            'account.unlock.email.or.username.tooltip': 'Custom Username Explain',
          },
        },
      };

      return setup(options).then(function(test) {
        const explain = test.form.usernameExplain();

        expect(explain.text()).toEqual('Custom Username Explain');
      });
    });
  });

  Expect.describe('elements', function() {
    itp('has a username field', function() {
      return setup().then(function(test) {
        Expect.isTextField(test.form.usernameField());
      });
    });
    itp('doesn\'t have an sms option by default', function() {
      return setup().then(function(test) {
        expect(test.form.hasSmsButton()).toBe(false);
      });
    });
    itp('doesn\'t have Voice Call option by default', function() {
      return setup().then(function(test) {
        expect(test.form.hasCallButton()).toBe(false);
      });
    });
    itp('supports sms', function() {
      return setupWithSms().then(function(test) {
        expect(test.form.hasSmsButton()).toBe(true);
      });
    });
    itp('has sms hint', function() {
      return setupWithSms().then(function(test) {
        expect(test.form.hasMobileRecoveryHint()).toBe(true);
        expect(test.form.mobileRecoveryHintText()).toEqual(
          'SMS can only be used if a mobile phone number has been configured.'
        );
      });
    });
    itp('does not have sms hint if sms is not enabled', function() {
      return setup().then(function(test) {
        expect(test.form.hasSmsHint()).toBe(false);
      });
    });
    itp('supports Voice Call', function() {
      return setupWithCall().then(function(test) {
        expect(test.form.hasCallButton()).toBe(true);
        expect(test.form.hasSmsButton()).toBe(false);
      });
    });
    itp('has Voice Call hint', function() {
      return setupWithCall().then(function(test) {
        expect(test.form.hasMobileRecoveryHint()).toBe(true);
        expect(test.form.mobileRecoveryHintText()).toEqual(
          'Voice Call can only be used if a mobile phone number has been configured.'
        );
      });
    });
    itp('supports SMS and Voice Call unlock factors together', function() {
      return setupWithSmsAndCall().then(function(test) {
        expect(test.form.hasSmsButton()).toBe(true);
        expect(test.form.hasCallButton()).toBe(true);
      });
    });
    itp('has SMS and Voice Call hint if both features are enabled', function() {
      return setupWithSmsAndCall().then(function(test) {
        expect(test.form.hasMobileRecoveryHint()).toBe(true);
        expect(test.form.mobileRecoveryHintText()).toEqual(
          'SMS or Voice Call can only be used if a mobile phone number has been configured.'
        );
      });
    });
    itp('shows a link to contact support when a help number is given', function() {
      return setup({ helpSupportNumber: '(999) 123-4567' }).then(function(test) {
        expect(test.form.hasCantAccessEmailLink()).toBe(true);
      });
    });
    itp('shows no link to contact support by default', function() {
      return setup().then(function(test) {
        expect(test.form.hasCantAccessEmailLink()).toBe(false);
      });
    });
    itp('does not show email recovery button if emailRecovery is false', function() {
      return setupWithoutEmail().then(function(test) {
        expect(test.form.hasEmailButton()).toBe(false);
      });
    });
    itp('shows email recovery button if emailRecovery is true', function() {
      return setup().then(function(test) {
        expect(test.form.hasEmailButton()).toBe(true);
      });
    });
    itp('shows error if no recovery factors are enabled', function() {
      return setupWithoutEmail().then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorMessage()).toBe('No unlock options available. Please contact your administrator.');
      });
    });
    itp('supports SMS without email', function() {
      return setupWithSmsWithoutEmail().then(function(test) {
        expect(test.form.hasSmsButton()).toBe(true);
        expect(test.form.hasEmailButton()).toBe(false);
      });
    });
    itp('supports Voice Call without email', function() {
      return setupWithCallWithoutEmail().then(function(test) {
        expect(test.form.hasCallButton()).toBe(true);
        expect(test.form.hasEmailButton()).toBe(false);
      });
    });
  });

  Expect.describe('events', function() {
    itp('shows an error if username is empty and request email', function() {
      return setup().then(function(test) {
        Util.resetAjaxRequests();
        test.form.sendEmail();
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.usernameErrorField().length).toBe(1);
      });
    });
    itp('shows an error if username is too long', function() {
      return setup().then(function(test) {
        test.form.setUsername(Util.LoremIpsum);
        test.form.sendEmail();
        expect(test.form.usernameErrorField().length).toBe(1);
        expect(test.form.usernameErrorField().text()).toBe('Please check your username');
      });
    });
    itp('shows an error if username is empty', function() {
      return setup().then(function(test) {
        Util.resetAjaxRequests();
        test.form.setUsername(' ');
        test.form.sendEmail();
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.usernameErrorField().length).toBe(1);
        expect(test.form.usernameErrorField().text()).toBe('This field cannot be left blank');
      });
    });
    itp('sends email', function() {
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'EMAIL',
            },
          });
        });
    });
    itp('sends email when pressing enter if Email is the only factor', function() {
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForUnlockEmailSent();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'EMAIL',
            },
          });
        });
    });
    itp('calls the transformUsername function with the right parameters', function() {
      return setupWithTransformUsername().then(function(test) {
        spyOn(test.router.settings, 'transformUsername');
        test.setNextResponse(resChallengeEmail);
        test.form.setUsername('foo');
        test.form.sendEmail();
        expect(test.router.settings.transformUsername.calls.count()).toBe(1);
        expect(test.router.settings.transformUsername.calls.argsFor(0)).toEqual(['foo', 'UNLOCK_ACCOUNT']);
      });
    });
    itp('appends the suffix returned by the transformUsername function to the username', function() {
      return setupWithTransformUsername()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeEmail);
          test.form.setUsername('foo');
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo@example.com',
              factorType: 'EMAIL',
            },
          });
        });
    });
    itp('updates appState username after sending email', function() {
      return setup()
        .then(function(test) {
          test.form.setUsername('foo');
          expect(test.router.appState.get('username')).toBeUndefined();
          test.setNextResponse(resChallengeEmail);
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function(test) {
          expect(test.router.appState.get('username')).toBe('foo');
        });
    });
    itp('shows email sent confirmation screen, and has a button that navigates back', function() {
      return setup()
        .then(function(test) {
          test.form.setUsername('foo@bar');
          test.setNextResponse(resChallengeEmail);
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function(test) {
          expect(test.form.titleText()).toBe('Email sent!');
          expect(test.form.getEmailSentConfirmationText().indexOf('foo@bar') >= 0).toBe(true);
          expect(test.form.backToLoginButton().length).toBe(1);
          test.form.goBackToLogin();
          expect(test.router.navigate).toHaveBeenCalledWith('', { trigger: true });
        });
    });
    itp('calls globalSuccessFn when an email has been sent', function() {
      const successSpy = jasmine.createSpy('successSpy');

      return setup({ globalSuccessFn: successSpy })
        .then(function(test) {
          test.form.setUsername('foo@bar');
          test.setNextResponse(resChallengeEmail);
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function() {
          expect(successSpy).toHaveBeenCalledWith({
            status: 'UNLOCK_ACCOUNT_EMAIL_SENT',
            username: 'foo@bar',
          });
        });
    });
    itp('shows an error if sending email results in an error', function() {
      return setup()
        .then(function(test) {
          test.setNextResponse(resError);
          test.form.setUsername('foo');
          test.form.sendEmail();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expectError(test);
        });
    });
    itp('shows an error if username is empty and request sms', function() {
      return setupWithSms().then(function(test) {
        Util.resetAjaxRequests();
        test.form.sendSms();
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.usernameErrorField().length).toBe(1);
      });
    });
    itp('sends sms', function() {
      return setupWithSms()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'SMS',
            },
          });
        });
    });
    itp('sends sms without email enabled', function() {
      return setupWithSmsWithoutEmail()
        .then(function(test) {
          expect(test.form.hasSmsButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(false);
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'SMS',
            },
          });
        });
    });
    itp('sends sms when pressing enter if SMS is the only factor', function() {
      return setupWithSmsWithoutEmail()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForRecoveryChallenge();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'SMS',
            },
          });
        });
    });
    itp('sends sms when pressing enter if SMS is the first factor of the list', function() {
      return setupWithSms()
        .then(function(test) {
          expect(test.form.hasSmsButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(true);
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForRecoveryChallenge();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'SMS',
            },
          });
        });
    });
    itp('updates appState username after sending sms', function() {
      return setupWithSms()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          expect(test.router.appState.get('username')).toBeUndefined();
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function(test) {
          expect(test.router.appState.get('username')).toBe('foo');
        });
    });
    itp('shows an error if sending sms results in an error', function() {
      return setupWithSms()
        .then(function(test) {
          test.setNextResponse(resError);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expectError(test);
        });
    });
    itp('does not have a problem with sending email after sending sms', function() {
      return setupWithSms()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resError);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expectError(test);
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeEmail);
          test.form.sendEmail();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'EMAIL',
            },
          });
        });
    });
    itp('shows an error if username is empty and request Voice Call', function() {
      return setupWithCall().then(function(test) {
        Util.resetAjaxRequests();
        test.form.makeCall();
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.usernameErrorField().length).toBe(1);
      });
    });
    itp('makes a Voice Call', function() {
      return setupWithCall()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'CALL',
            },
          });
        });
    });
    itp('makes a Voice Call without email enabled', function() {
      return setupWithCallWithoutEmail()
        .then(function(test) {
          expect(test.form.hasCallButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(false);
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'CALL',
            },
          });
        });
    });
    itp('makes a Voice Call when pressing enter if Voice Call is the only factor', function() {
      return setupWithCallWithoutEmail()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForRecoveryChallenge();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'CALL',
            },
          });
        });
    });
    itp('makes a Voice Call when pressing enter if Voice Call is the first factor of the list', function() {
      return setupWithCall()
        .then(function(test) {
          expect(test.form.hasCallButton()).toBe(true);
          expect(test.form.hasEmailButton()).toBe(true);
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.pressEnter();
          return Expect.waitForRecoveryChallenge();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo',
              factorType: 'CALL',
            },
          });
        });
    });
    itp('updates appState username after making a Voice Call', function() {
      return setupWithCall()
        .then(function(test) {
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function(test) {
          expect(test.router.appState.get('username')).toBe('foo');
        });
    });
    itp('shows an error if making a Voice Call results in an error', function() {
      return setupWithCall()
        .then(function(test) {
          test.setNextResponse(resError);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expectError(test);
        });
    });
    itp('goes back', function() {
      return setup().then(function(test) {
        test.form.goBack();
        expect(test.router.navigate).toHaveBeenCalledWith('', { trigger: true });
      });
    });
    itp('returns to primary auth when browser\'s back button is clicked', function() {
      return setup(null, true)
        .then(function(test) {
          Util.triggerBrowserBackButton();
          return Expect.waitForPrimaryAuth(test);
        })
        .then(function(test) {
          Expect.isPrimaryAuth(test.router.controller);
          Util.stopRouter();
        });
    });
    itp('shows an org\'s contact form when user clicks no email access link', function() {
      return setup({ helpSupportNumber: '(999) 123-4567' }).then(function(test) {
        expect(test.form.hasCantAccessEmailLink()).toBe(true);
        test.form.clickCantAccessEmail();
        expect(test.form.contactSupportText()).toMatch(/\(999\) 123-4567/);
        expect(test.form.hasCantAccessEmailLink()).toBe(false);
      });
    });
    itp('shows the "Unlock via email" link after sending sms', function() {
      return setupWithSms()
        .then(function(test) {
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function(test) {
          expect(test.form.hasSendEmailLink()).toBe(true);
          expect(test.form.sendEmailLink().trimmedText()).toEqual('Didn\'t receive a code? Unlock via email');
        });
    });
    itp('does not show the "Unlock via email" link after sending sms if emailRecovery is false', function() {
      return setupWithSmsWithoutEmail()
        .then(function(test) {
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function(test) {
          expect(test.form.hasSendEmailLink()).toBe(false);
        });
    });
    itp('sends an email when user clicks the "Unlock via email" link, after sending sms', function() {
      return setupWithSms()
        .then(function(test) {
          test.setNextResponse(resChallengeSms);
          test.form.setUsername('foo@bar');
          test.form.sendSms();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeEmail);
          test.form.clickSendEmailLink();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo@bar',
              factorType: 'EMAIL',
            },
          });
        });
    });
    itp(
      'shows email sent confirmation screen when user clicks the "Unlock via email" link, after sending sms',
      function() {
        return setupWithSms()
          .then(function(test) {
            test.setNextResponse(resChallengeSms);
            test.form.setUsername('foo@bar');
            test.form.sendSms();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function(test) {
            test.setNextResponse(resChallengeEmail);
            test.form.clickSendEmailLink();
            return Expect.waitForUnlockEmailSent(test);
          })
          .then(function(test) {
            expect(test.form.titleText()).toBe('Email sent!');
            expect(test.form.getEmailSentConfirmationText().indexOf('foo@bar') >= 0).toBe(true);
            expect(test.form.backToLoginButton().length).toBe(1);
          });
      }
    );
    itp(
      'shows an error if sending email via "Unlock via email" link results in an error, after sending sms',
      function() {
        return setupWithSms()
          .then(function(test) {
            test.setNextResponse(resChallengeSms);
            test.form.setUsername('foo');
            test.form.sendSms();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function(test) {
            test.setNextResponse(resError);
            test.form.clickSendEmailLink();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expectError(test, 'recovery-challenge');
          });
      }
    );
    itp('shows the "Unlock via email" link after making a Voice Call', function() {
      return setupWithCall()
        .then(function(test) {
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function(test) {
          expect(test.form.hasSendEmailLink()).toBe(true);
          expect(test.form.sendEmailLink().trimmedText()).toEqual('Didn\'t receive a code? Unlock via email');
        });
    });
    itp('does not show the "Unlock via email" link after making a Voice Call if emailRecovery is false', function() {
      return setupWithCallWithoutEmail()
        .then(function(test) {
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function(test) {
          expect(test.form.hasSendEmailLink()).toBe(false);
        });
    });
    itp('sends an email when user clicks the "Unlock via email" link, after making a Voice Call', function() {
      return setupWithCall()
        .then(function(test) {
          test.setNextResponse(resChallengeCall);
          test.form.setUsername('foo@bar');
          test.form.makeCall();
          return Expect.waitForRecoveryChallenge(test);
        })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resChallengeEmail);
          test.form.clickSendEmailLink();
          return Expect.waitForUnlockEmailSent(test);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/recovery/unlock',
            data: {
              username: 'foo@bar',
              factorType: 'EMAIL',
            },
          });
        });
    });
    itp(
      'shows email sent confirmation when user clicks "Unlock via email" link, after making a Voice Call',
      function() {
        return setupWithCall()
          .then(function(test) {
            test.setNextResponse(resChallengeCall);
            test.form.setUsername('foo@bar');
            test.form.makeCall();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function(test) {
            test.setNextResponse(resChallengeEmail);
            test.form.clickSendEmailLink();
            return Expect.waitForUnlockEmailSent(test);
          })
          .then(function(test) {
            expect(test.form.titleText()).toBe('Email sent!');
            expect(test.form.getEmailSentConfirmationText().indexOf('foo@bar') >= 0).toBe(true);
            expect(test.form.backToLoginButton().length).toBe(1);
          });
      }
    );
    itp(
      'shows an error if sending email via "Unlock via email" link results in an error, after making a Voice Call',
      function() {
        return setupWithCall()
          .then(function(test) {
            test.setNextResponse(resChallengeCall);
            test.form.setUsername('foo');
            test.form.makeCall();
            return Expect.waitForRecoveryChallenge(test);
          })
          .then(function(test) {
            test.setNextResponse(resError);
            test.form.clickSendEmailLink();
            return Expect.waitForFormError(test.form, test);
          })
          .then(function(test) {
            expectError(test, 'recovery-challenge');
          });
      }
    );
  });
});
