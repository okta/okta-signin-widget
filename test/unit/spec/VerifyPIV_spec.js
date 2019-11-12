/* eslint max-params: [2, 18], max-statements: 0 */
define([
  'q',
  'okta',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/PivForm',
  'helpers/dom/PrimaryAuthForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/PIV_error',
  'helpers/xhr/PIV_CHALLENGE',
  'helpers/xhr/MFA_REQUIRED_oktaVerify',
  'helpers/xhr/SUCCESS'
],
function (Q, Okta, OktaAuth, Util, PivForm, PrimaryAuthForm, Beacon, Expect,
  Router, $sandbox, resError, resChallenge, resMfaRequired, resSuccess) {

  var SharedUtil = Okta.internal.util.Util;
  var { _, $ } = Okta;
  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup (hasError) {
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
      piv: {
        certAuthUrl: 'https://foo.com'
      }
    }));
    var form = new PivForm($sandbox);
    var loginForm = new PrimaryAuthForm($sandbox);
    var beacon = new Beacon($sandbox);
    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    spyOn(SharedUtil, 'redirect');
    setNextResponse(hasError ? [resError] : [resChallenge]);
    router.verifyPIV();
    return Expect.waitForVerifyPIV({
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

  Expect.describe('PIV', function () {

    Expect.describe('General', function () {
      itp('displays the correct beacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isPIVBeacon()).toBe(true);
          expect(test.beacon.hasClass('smartcard')).toBe(true);
        });
      });
      itp('has a "back" link in the footer', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.backLink());
        });
      });
      itp('has spinning wait icon', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.spinningIcon());
          Expect.isNotVisible(test.form.submitButton());
        });
      });
      itp('redirects on successful cert auth', function () {
        return setup().then(function (test) {
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function () {
          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'https://rain.okta1.com/login/sessionCookieRedirect?redirectUrl=%2Fapp%2FUserHome&amp;token=token1'
          );
        });
      });
    });
    Expect.describe('Error', function () {
      itp('shows error box with error response', function () {
        return setup(true).then(function (test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox()).toHaveLength(1);
          expect(test.form.errorMessage()).toEqual('Invalid certificate.');
        });
      });
      itp('displays retry button', function () {
        return setup(true).then(function (test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          Expect.isVisible(test.form.submitButton());
          Expect.isNotVisible(test.form.spinningIcon());
        });
      });
      itp('can retry authentication', function () {
        return setup(true).then(function (test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function (test) {
          test.setNextResponse([resChallenge]);
          test.form.submit();
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function () {
          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'https://rain.okta1.com/login/sessionCookieRedirect?redirectUrl=%2Fapp%2FUserHome&amp;token=token1'
          );
        });
      });
    });

  });

});
