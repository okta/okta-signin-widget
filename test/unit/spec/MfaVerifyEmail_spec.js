/* eslint-disable max-len */
import { _ } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import MfaVerifyForm from 'helpers/dom/MfaVerifyForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resChallengeEmail from 'helpers/xhr/MFA_CHALLENGE_email';
import resMfaLocked from 'helpers/xhr/MFA_LOCKED_FAILED_ATEMPTS';
import resAllFactors from 'helpers/xhr/MFA_REQUIRED_allFactors';
import resResendError from 'helpers/xhr/MFA_RESEND_error';
import resSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;

function createRouter(baseUrl, authClient, successSpy, settings) {
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
      },
      settings
    )
  );

  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  return router;
}

function setupEmail() {
  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: {
      issuer: baseUrl,
      transformErrorXHR: LoginUtil.transformErrorXHR,
    }
  });
  const successSpy = jasmine.createSpy('success');
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
  const router = createRouter(baseUrl, authClient, successSpy);

  router.on('afterError', afterErrorHandler);

  setNextResponse(resAllFactors);
  router.refreshAuthState('dummy-token');
  return Expect.waitForMfaVerify()
    .then(function() {
      const factors = router.appState.get('factors');
      const selectedFactor = factors.findWhere({ factorType: 'email' });

      router.verify(selectedFactor.get('provider'), selectedFactor.get('factorType'));
      return Expect.waitForVerifyEmail();
    })
    .then(function() {
      const form = new MfaVerifyForm($sandbox);
      const beacon = new Beacon($sandbox);

      return {
        router: router,
        form: form,
        beacon: beacon,
        ac: authClient,
        setNextResponse: setNextResponse,
        successSpy: successSpy,
        afterErrorHandler: afterErrorHandler,
      };
    });
}

function setupEmailAndClickSend() {
  return setupEmail().then(function(test) {
    Util.resetAjaxRequests();
    test.setNextResponse(resChallengeEmail);
    test.form.submit();
    return waitForEmailVerificationPage(test);
  });
}

function waitForEmailVerificationPage(test) {
  return Expect.wait(() => {
    return test.form.submitButtonText() === 'Verify';
  }, test);
}

Expect.describe('MFA Verify (Email)', function() {
  itp('is email', function() {
    return setupEmail().then(function(test) {
      expect(test.form.isEmail()).toBe(true);
      expect(test.beacon.isFactorBeacon()).toBe(true);
      expect(test.beacon.hasClass('mfa-okta-email')).toBe(true);
    });
  });
  itp('shows send email page', function() {
    return setupEmail().then(function(test) {
      expect(test.form.titleText()).toBe('Verify with Email Authentication');
      expect(test.form.el('mfa-send-email-content').html()).toBe(
        'Send a verification code to ' + '<span class="mask-email">a...1@clouditude.net</span>.'
      );
      expect(test.form.submitButtonText()).toBe('Send me the code');
      expect(test.form.answerField().length).toBe(0);
    });
  });

  itp('click send email will send request to factor endpoint', function() {
    return setupEmailAndClickSend().then(function() {
      expect(Util.numAjaxRequests()).toBe(1);
      Expect.isJsonPost(Util.getAjaxRequest(0), {
        url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify?rememberDevice=false',
        data: {
          passCode: '',
          stateToken: 'testStateToken',
        },
      });
    });
  });
  itp('click send email and show verify passcode page', function() {
    return setupEmailAndClickSend().then(function(test) {
      const answer = test.form.answerField();

      expect(answer.length).toBe(1);
      expect(answer.attr('type')).toEqual('tel');
      expect(test.form.el('mfa-email-sent-content').html()).toBe(
        'A verification code was sent to ' +
          '<span class="mask-email">a...1@clouditude.net</span>. ' +
          'Check your email and enter the code below.'
      );
      Expect.isVisible(test.form.rememberDeviceCheckbox());
    });
  });
  itp('shows errors if verify button is clicked and answer is empty', function() {
    return setupEmailAndClickSend()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resChallengeEmail);
        test.form.submit();
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(0);
        expect(test.form.passCodeErrorField().length).toBe(1);
        expect(test.form.passCodeErrorField().text()).toBe('This field cannot be left blank');
        expect(test.form.errorMessage()).toBe(
          'We found some errors. ' + 'Please review the form and make corrections.'
        );
      });
  });

  itp('calls verifyFactor with rememberDevice URL param', function() {
    return setupEmailAndClickSend()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resSuccess);
        test.form.setAnswer('456123');
        test.form.setRememberDevice(true);
        test.form.submit();
        return Expect.waitForSpyCall(test.successSpy);
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify?rememberDevice=true',
          data: {
            passCode: '456123',
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('calls verify endpoint when form is submitted with a passcode', function() {
    return setupEmailAndClickSend()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resSuccess);
        test.form.setAnswer('456123');
        test.form.submit();
        return Expect.waitForSpyCall(test.successSpy);
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify?rememberDevice=false',
          data: {
            passCode: '456123',
            stateToken: 'testStateToken',
          },
        });
      });
  });
  itp('shows proper account locked error after too many failed MFA attempts.', function() {
    return setupEmailAndClickSend()
      .then(function(test) {
        test.setNextResponse(resMfaLocked);
        test.form.setAnswer('12345');
        test.form.submit();
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox().length).toBe(1);
        expect(test.form.errorMessage()).toBe('Your account is locked because of too many authentication attempts.');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'mfa-verify',
          },
          {
            name: 'AuthApiError',
            message: 'User Locked',
            statusCode: 403,
            xhr: {
              status: 403,
              responseType: 'json',
              responseText: '{"errorCode":"E0000069","errorSummary":"User Locked","errorLink":"E0000069","errorId":"oaeGLSGT-QCT_ijvM0RT6SV0A","errorCauses":[]}',
              responseJSON: {
                errorCode: 'E0000069',
                errorSummary: 'Your account is locked because of too many authentication attempts.',
                errorLink: 'E0000069',
                errorId: 'oaeGLSGT-QCT_ijvM0RT6SV0A',
                errorCauses: [],
              },
            },
          },
        ]);
      });
  });

  itp('posts to resend link when click the `send again` button', function() {
    return setupEmailAndClickSend()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resChallengeEmail);
        expect(test.form.$('.resend-email-infobox').length).toBe(1);
        test.form.$('.resend-email-btn').click();
        return Expect.wait(() => {
          return test.form.$('.resend-email-infobox.hide').length === 1;
        }, test);
      })
      .then(function() {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          data: { stateToken: 'testStateToken' },
          url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify/resend',
        });
      });
  });

  itp('display resend error', function() {
    Util.speedUpDelay();
    return setupEmailAndClickSend()
      .then(function(test) {
        Util.resetAjaxRequests();
        test.setNextResponse(resResendError);
        expect(test.form.$('.resend-email-infobox:not(.hide)').length).toBe(1);
        test.form.$('.resend-email-btn').click();
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox().length).toBe(1);
        expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          data: { stateToken: 'testStateToken' },
          url: 'https://foo.com/api/v1/authn/factors/emailhp9NXcoXu8z2wN0g3/verify/resend',
        });
      });
  });
});
