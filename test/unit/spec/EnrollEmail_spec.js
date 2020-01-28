/* eslint max-params: 0 */
define([
  'q',
  'okta',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/AuthContainer',
  'helpers/dom/EnrollEmailForm',
  'helpers/dom/EnrollActivateEmailForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_email',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_email',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/SMS_RESEND_error',
], function (
  Q, Okta, OktaAuth, LoginUtil, Util, AuthContainer,
  EnrollEmailForm, EnrollActivateEmailForm, Beacon, Expect, $sandbox, Router,
  xhrEnrollEmail, xhrEnrollActivateEmail, xhrSUCCESS, xhrResendError) {

  var { $ } = Okta;
  var itp = Expect.itp;

  Expect.describe('EnrollEmail', function () {

    function setup (resp) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'http://localhost:3000';
      var authClient = new OktaAuth({
        url: baseUrl,
        transformErrorXHR: LoginUtil.transformErrorXHR
      });
      var successSpy = jasmine.createSpy('successSpy');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
        'features.router': true
      });
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, true);
      setNextResponse(resp);
      return Util.mockIntrospectResponse(router)
        .then(function () {
          router.refreshAuthState('dummy-token');
          return Expect.waitForEnrollChoices();
        })
        .then(function () {
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

    itp('display start enroll email form and is able to send code to email', function () {
      return setup(xhrEnrollEmail)
        .then(function (test) {
          // 1. verify the page loads
          expect(test.form.titleText()).toBe('Set up Email Authentication');
          expect(test.form.enrollEmailContent()).toBe('Send a verification code to your registered email.');
          expect(test.form.submitButtonText()).toBe('Send me the code');
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-okta-email')).toBe(true);

          return test;
        })
        .then(function (test) {
          // 2. mock data and click send button.
          $.ajax.calls.reset();
          test.setNextResponse(xhrEnrollActivateEmail);
          test.form.submit();
          return Expect.waitForSpyCall($.ajax);
        })
        .then(function () {
          // 3. verify request has been made
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'http://localhost:3000/api/v1/authn/factors',
            data: {
              provider: 'OKTA',
              factorType: 'email',
              stateToken: 'dummy-token'
            }
          });
        });
    });

    itp('verify email code', function () {
      return setup(xhrEnrollEmail)
        .then(function (test) {
          // 1. click 'send to email' button
          $.ajax.calls.reset();
          test.setNextResponse(xhrEnrollActivateEmail);
          test.form.submit();
          return Expect.waitForEnrollActivateEmail(test);
        })
        .then(function (test) {
          // 2. assert landing on the email code verification page
          const form = new EnrollActivateEmailForm($sandbox);
          expect(form.titleText()).toBe('Set up Email Authentication');
          expect(form.enrollEmailActivateContent())
            .toBe('A verification code was sent to t...n@okta.com. Check your email and enter the code below.');
          expect(form.labelText('passCode')).toBe('Verification code');
          expect(form.submitButtonText()).toBe('Verify');
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-okta-email')).toBe(true);
          expect(form.getResendEmailMessage().length).toBe(0);
          expect(form.getResendButton().length).toBe(0);

          return Object.assign({}, test, {form: form});
        })
        .then(function (test) {
          // 3. submit verification code
          $.ajax.calls.reset();
          test.setNextResponse(xhrSUCCESS);
          test.form.setVerificationCode('1209876');
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          // 4. enroll successfully
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'http://localhost:3000/api/v1/authn/factors/eml198rKSEWOSKRIVIFT/lifecycle/activate',
            data: {
              passCode: '1209876',
              stateToken: 'dummy-token'
            }
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
                timeZone: 'America/Los_Angeles'
              }
            },
            type: 'SESSION_SSO',
            session: {
              token: 'THE_SESSION_TOKEN',
              setCookieAndRedirect: jasmine.any(Function)
            },
            status: 'SUCCESS'
          });
        });
    });
    itp('shall be able to resend email', function () {
      Util.speedUpDelay();
      return setup(xhrEnrollEmail)
        .then(function (test) {
          // 1. click 'send to email' button
          $.ajax.calls.reset();
          test.setNextResponse(xhrEnrollActivateEmail);
          test.form.submit();
          return Expect.waitForEnrollActivateEmail(test);
        })
        .then(function (test) {
          // 2. verify resend again view
          const form = new EnrollActivateEmailForm($sandbox);
          expect(form.getResendEmailMessage().length).toBe(1);
          expect(form.getResendButton().length).toBe(1);

          // 3. click resend link
          $.ajax.calls.reset();
          test.setNextResponse(xhrEnrollActivateEmail);
          form.clickResend();
          expect(form.getResendEmailMessage().length).toBe(0);
          expect(form.getResendButton().length).toBe(0);
          expect(form.getResendEmailView().attr('class'))
            .toBe('resend-email-infobox hide');
          return Expect.waitForSpyCall($.ajax, Object.assign(test, {form}));
        })
        .then(function (test) {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'http://localhost:3000/api/v1/authn' +
              '/factors/eml198rKSEWOSKRIVIFT/lifecycle/resend',
            data: {
              stateToken: 'dummy-token'
            }
          });
          return Expect.wait(() => {
            return test.form.getResendEmailView().attr('class') === 'resend-email-infobox';
          }, test);
        })
        .then(function (test) {
          expect(test.form.getResendEmailMessage().length).toBe(1);
          expect(test.form.getResendButton().length).toBe(1);
        })
      ;
    });
    itp('shall display resend email error', function () {
      Util.speedUpDelay();
      return setup(xhrEnrollEmail)
        .then(function (test) {
          // 1. click 'send to email' button
          $.ajax.calls.reset();
          test.setNextResponse(xhrEnrollActivateEmail);
          test.form.submit();
          return Expect.waitForEnrollActivateEmail(test);
        })
        .then(function (test) {
          // 2. verify resend again view
          const form = new EnrollActivateEmailForm($sandbox);
          expect(form.getResendEmailMessage().length).toBe(1);
          expect(form.getResendButton().length).toBe(1);

          // 3. click resend link
          $.ajax.calls.reset();
          test.setNextResponse(xhrResendError);
          form.clickResend();
          expect(form.getResendEmailMessage().length).toBe(0);
          expect(form.getResendButton().length).toBe(0);
          expect(form.getResendEmailView().attr('class'))
            .toBe('resend-email-infobox hide');
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toBe(1);
          expect(test.form.errorMessage())
            .toBe('You do not have permission to perform the requested action');
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'http://localhost:3000/api/v1/authn' +
              '/factors/eml198rKSEWOSKRIVIFT/lifecycle/resend',
            data: {
              stateToken: 'dummy-token'
            }
          });
        })
      ;
    });
  });
});
