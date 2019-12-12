/* eslint max-params:[2, 15] */
define([
  'okta',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/EnrollCustomFactorForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'sandbox',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_ClaimsProvider',
  'helpers/xhr/NO_PERMISSION_error',
  'helpers/xhr/SUCCESS'
],
function (Okta,
  OktaAuth,
  LoginUtil,
  Util,
  Form,
  Beacon,
  Expect,
  $sandbox,
  Router,
  responseMfaEnrollAll,
  responseMfaEnrollActivateClaimsProvider,
  resNoPermissionError,
  responseSuccess) {

  var SharedUtil = Okta.internal.util.Util;
  var itp = Expect.itp;

  Expect.describe('EnrollActivateCustomFactor', function () {

    function setup (options) {
      var initResponse = getInitialResponse(options);
      var setNextResponse = Util.mockAjax([initResponse]);
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
      var successSpy = jasmine.createSpy('success');
      var afterErrorHandler = jasmine.createSpy('afterErrorHandler');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy
      });
      router.on('afterError', afterErrorHandler);
      Util.registerRouter(router);
      Util.mockRouterNavigate(router);
      return Util.mockIntrospectResponse(router, initResponse).then(function () {
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollCustomFactor({
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse,
          successSpy: successSpy,
          afterErrorHandler: afterErrorHandler
        });
      });
    }

    function getInitialResponse (options) {
      var initResponse = JSON.parse(JSON.stringify(responseMfaEnrollActivateClaimsProvider));
      if(options && options.setFactorResult) {
        initResponse.response.factorResult = options.factorResult;
        initResponse.response.factorResultMessage = options.factorResultMessage;
      }
      return initResponse;
    }

    describe('Enroll Activate CUSTOM_CLAIMS', function () {

      itp('displays the correct factorBeacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-custom-factor')).toBe(true);
        });
      });

      itp('has a "back" link in the footer', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.backLink());
        });
      });

      itp('displays correct title', function () {
        return setup().then(function (test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.titleText()).toBe('IDP factor');
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('displays correct subtitle', function () {
        return setup().then(function (test) {
          test.setNextResponse(responseSuccess);
          expect(test.form.subtitleText())
            .toBe('Clicking below will redirect to MFA enrollment with IDP factor');
          expect(test.form.buttonBar().hasClass('hide')).toBe(false);
        });
      });

      itp('redirects to third party when Enroll button is clicked', function () {
        spyOn(SharedUtil, 'redirect');
        return setup().then(function (test) {
          test.setNextResponse(responseSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
          .then(function () {
            expect(SharedUtil.redirect).toHaveBeenCalledWith(
              'http://rain.okta1.com:1802/sso/idps/idpId?stateToken=testStateToken'
            );
          });
      });

      itp('does not display error for normal setup', function () {
        return setup().then(function (test) {
          expect(test.form.hasErrorBox()).toBe(false);
        });
      });

      itp('displays error when factorResult is FAILED', function () {
        var options = {
          setFactorResult: true,
          factorResult: 'FAILED',
          factorResultMessage: 'Enroll failed.'
        };
        return setup(options).then(function (test) {
          expect(test.form.hasErrorBox()).toBe(true);
          expect(test.form.errorBoxMessage()).toBe('Enroll failed.');
        });
      });

      itp('does not display error when factorResult is WAITING', function () {
        var options = {
          setFactorResult: true,
          factorResult: 'WAITING',
          factorResultMessage: 'Enroll failed.'
        };
        return setup(options).then(function (test) {
          expect(test.form.hasErrorBox()).toBe(false);
        });
      });

      itp('does not display error when factorResult is undefined', function () {
        var options = {
          setFactorResult: true,
          factorResultMessage: 'Enroll failed.'
        };
        return setup(options).then(function (test) {
          expect(test.form.hasErrorBox()).toBe(false);
        });
      });

      itp('displays default error when factorResultMessage is undefined', function () {
        var options = {
          setFactorResult: true,
          factorResult: 'FAILED',
        };
        return setup(options).then(function (test) {
          expect(test.form.hasErrorBox()).toBe(true);
          expect(test.form.errorBoxMessage())
            .toBe('There was an unexpected internal error. Please try again.');
        });
      });
    });
  });

});
