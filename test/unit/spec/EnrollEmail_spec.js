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
], function (Q, Okta, OktaAuth, LoginUtil, Util, AuthContainer,
  EnrollEmailForm, EnrollActivateEmailForm, Beacon, Expect, $sandbox, Router,
  xhrEnrollEmail, xhrEnrollActivateEmail, xhrSUCCESS) {

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
      // router.on('afterError', afterErrorHandler);
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
          expect(test.form.titleText()).toBe('Set up Email Authentication');
          expect(test.form.enrollEmailContent()).toBe('Send a verification code to your registered email.');
          expect(test.form.submitButtonText()).toBe('Send me the code');
          return test;
        })
        .then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(xhrEnrollActivateEmail);
          test.form.submit();
          return Expect.waitForSpyCall($.ajax);
        })
        .then(function () {
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
            .toBe('A verification code was sent to t....son@okta.com. Check your email and enter the code below.');
          expect(form.labelText('passCode')).toBe('Verification code');
          expect(form.submitButtonText()).toBe('Verify');
          return Object.assign({}, test, {form: form});
        })
      // TODO: 3. verify send again

        .then(function (test) {
          // 4. submit verification code
          $.ajax.calls.reset();
          test.setNextResponse(xhrSUCCESS);
          test.form.setVerificationCode('1209876');
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          // 5. enroll successfully
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
      return setup(xhrEnrollEmail)
        .then(function (test) {
          // 1. click 'send to email' button
          $.ajax.calls.reset();
          test.setNextResponse(xhrEnrollActivateEmail);
          test.form.submit();
          return Expect.waitForEnrollActivateEmail(test);
        })
        .then(function (test) {
          // 2. verify send again
          const form = new EnrollActivateEmailForm($sandbox);
          $.ajax.calls.reset();
          test.setNextResponse(xhrEnrollActivateEmail);
          form.clickResend();
          return Expect.waitForSpyCall($.ajax);
        })
        .then(function () {
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
