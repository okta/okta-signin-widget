/* eslint max-params: 0 */
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import AuthContainer from 'helpers/dom/AuthContainer';
import Beacon from 'helpers/dom/Beacon';
import EnrollActivateEmailForm from 'helpers/dom/EnrollActivateEmailForm';
import EnrollEmailForm from 'helpers/dom/EnrollEmailForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import xhrEnrollActivateEmail from 'helpers/xhr/MFA_ENROLL_ACTIVATE_email';
import xhrEnrollEmail from 'helpers/xhr/MFA_ENROLL_email';
import xhrResendError from 'helpers/xhr/MFA_RESEND_error';
import xhrSUCCESS from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;

Expect.describe('EnrollEmail', function() {
  function setup(resp) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'http://localhost:3000';
    const authClient = getAuthClient({
      authParams: {
        issuer: baseUrl,
        transformErrorXHR: LoginUtil.transformErrorXHR,
      }
    });
    const successSpy = jasmine.createSpy('successSpy');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy,
      'features.router': false,
    });

    Util.registerRouter(router);
    Util.mockRouterNavigate(router, false);
    setNextResponse(resp);
    router.refreshAuthState('dummy-token');
    return Expect.waitForEnrollChoices().then(function() {
      router.enrollEmail();
      return Expect.waitForEnrollEmail({
        router: router,
        authContainer: new AuthContainer($sandbox),
        beacon: new Beacon($sandbox),
        form: new EnrollEmailForm($sandbox),
        setNextResponse: setNextResponse,
        successSpy: successSpy,
      });
    });
  }

  itp('display start enroll email form and is able to send code to email', function() {
    return setup(xhrEnrollEmail)
      .then(function(test) {
        // 1. verify the page loads
        expect(test.form.titleText()).toBe('Set up Email Authentication');
        expect(test.form.enrollEmailContent()).toBe('Send a verification code to your registered email.');
        expect(test.form.submitButtonText()).toBe('Send me the code');
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-okta-email')).toBe(true);

        return test;
      })
      .then(function(test) {
        // 2. mock data and click send button.
        Util.resetAjaxRequests();
        test.setNextResponse(xhrEnrollActivateEmail);
        test.form.submit();
        return Expect.waitForAjaxRequest();
      })
      .then(function() {
        // 3. verify request has been made
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'http://localhost:3000/api/v1/authn/factors',
          data: {
            provider: 'OKTA',
            factorType: 'email',
            stateToken: 'dummy-token',
          },
        });
      });
  });

  itp('verify email code', function() {
    return setup(xhrEnrollEmail)
      .then(function(test) {
        // 1. click 'send to email' button
        Util.resetAjaxRequests();
        test.setNextResponse(xhrEnrollActivateEmail);
        test.form.submit();
        return Expect.waitForEnrollActivateEmail(test);
      })
      .then(function(test) {
        // 2. assert landing on the email code verification page
        const form = new EnrollActivateEmailForm($sandbox);
        expect(form.titleText()).toBe('Set up Email Authentication');
        expect(form.enrollEmailActivateContent()).toBe(
          'A verification code was sent to t...n@okta.com. Check your email and enter the code below.'
        );
        expect(form.labelText('passCode')).toBe('Verification code');
        expect(form.submitButtonText()).toBe('Verify');
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-okta-email')).toBe(true);
        expect(form.getResendEmailMessage().length).toBe(0);
        expect(form.getResendButton().length).toBe(0);

        return Object.assign({}, test, { form: form });
      })
      .then(function(test) {
        // 3. submit verification code
        Util.resetAjaxRequests();
        test.setNextResponse(xhrSUCCESS);
        test.form.setVerificationCode('1209876');
        test.form.submit();
        return Expect.waitForSpyCall(test.successSpy, test);
      })
      .then(function(test) {
        // 4. enroll successfully
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'http://localhost:3000/api/v1/authn/factors/eml198rKSEWOSKRIVIFT/lifecycle/activate',
          data: {
            passCode: '1209876',
            stateToken: 'dummy-token',
          },
        });
        expect(test.successSpy.calls.count()).toBe(1);
        expect(test.successSpy).toHaveBeenCalledWith({
          user: {
            id: '00ui0jgywTAHxYGMM0g3',
            profile: {
              login: 'administrator1@clouditude.net',
              firstName: 'Add-Min',
              lastName: 'O\'Cloudy Tud',
              locale: 'en_US',
              timeZone: 'America/Los_Angeles',
            },
          },
          type: 'SESSION_SSO',
          session: {
            token: 'THE_SESSION_TOKEN',
            setCookieAndRedirect: jasmine.any(Function),
          },
          status: 'SUCCESS',
        });
      });
  });
  itp('shall be able to resend email', function() {
    Util.speedUpDelay();
    return setup(xhrEnrollEmail)
      .then(function(test) {
        // 1. click 'send to email' button
        Util.resetAjaxRequests();
        test.setNextResponse(xhrEnrollActivateEmail);
        test.form.submit();
        return Expect.waitForEnrollActivateEmail(test);
      })
      .then(function(test) {
        // 2. verify resend again view
        const form = new EnrollActivateEmailForm($sandbox);
        expect(form.getResendEmailMessage().length).toBe(1);
        expect(form.getResendButton().length).toBe(1);

        // 3. click resend link
        Util.resetAjaxRequests();
        test.setNextResponse(xhrEnrollActivateEmail);
        form.clickResend();
        expect(form.getResendEmailMessage().length).toBe(0);
        expect(form.getResendButton().length).toBe(0);
        expect(form.getResendEmailView().attr('class')).toBe('resend-email-infobox hide');
        return Expect.waitForAjaxRequest(Object.assign(test, { form }));
      })
      .then(function(test) {
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'http://localhost:3000/api/v1/authn' + '/factors/eml198rKSEWOSKRIVIFT/lifecycle/resend',
          data: {
            stateToken: 'dummy-token',
          },
        });
        return Expect.wait(() => {
          return test.form.getResendEmailView().attr('class') === 'resend-email-infobox';
        }, test);
      })
      .then(function(test) {
        expect(test.form.getResendEmailMessage().length).toBe(1);
        expect(test.form.getResendButton().length).toBe(1);
      });
  });
  itp('shall display resend email error', function() {
    Util.speedUpDelay();
    return setup(xhrEnrollEmail)
      .then(function(test) {
        // 1. click 'send to email' button
        Util.resetAjaxRequests();
        test.setNextResponse(xhrEnrollActivateEmail);
        test.form.submit();
        return Expect.waitForEnrollActivateEmail(test);
      })
      .then(function(test) {
        // 2. verify resend again view
        const form = new EnrollActivateEmailForm($sandbox);
        expect(form.getResendEmailMessage().length).toBe(1);
        expect(form.getResendButton().length).toBe(1);

        // 3. click resend link
        Util.resetAjaxRequests();
        test.setNextResponse(xhrResendError);
        form.clickResend();
        expect(form.getResendEmailMessage().length).toBe(0);
        expect(form.getResendButton().length).toBe(0);
        expect(form.getResendEmailView().attr('class')).toBe('resend-email-infobox hide');
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox().length).toBe(1);
        expect(test.form.errorMessage()).toBe('You do not have permission to perform the requested action');
        expect(Util.numAjaxRequests()).toBe(1);
        Expect.isJsonPost(Util.getAjaxRequest(0), {
          url: 'http://localhost:3000/api/v1/authn' + '/factors/eml198rKSEWOSKRIVIFT/lifecycle/resend',
          data: {
            stateToken: 'dummy-token',
          },
        });
      });
  });
});
