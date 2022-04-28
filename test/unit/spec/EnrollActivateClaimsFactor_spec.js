/* eslint max-params:[2, 15] */
import { internal } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollCustomFactorForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import responseMfaEnrollActivateClaimsProvider from 'helpers/xhr/MFA_ENROLL_ACTIVATE_ClaimsProvider';
import responseSuccess from 'helpers/xhr/SUCCESS';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;

Expect.describe('EnrollActivateCustomFactor', function() {
  function setup(options) {
    const initResponse = getInitialResponse(options);
    const setNextResponse = Util.mockAjax([initResponse]);
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
    });
    const successSpy = jasmine.createSpy('success');
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy,
    });

    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    router.refreshAuthState('dummy-token');
    return Expect.waitForEnrollCustomFactor({
      router: router,
      beacon: new Beacon($sandbox),
      form: new Form($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy,
      afterErrorHandler: afterErrorHandler,
    });
  }

  function getInitialResponse(options) {
    const initResponse = JSON.parse(JSON.stringify(responseMfaEnrollActivateClaimsProvider));

    if (options && options.setFactorResult) {
      initResponse.response.factorResult = options.factorResult;
      initResponse.response.factorResultMessage = options.factorResultMessage;
    }
    return initResponse;
  }

  describe('Enroll Activate CUSTOM_CLAIMS', function() {
    itp('displays the correct factorBeacon', function() {
      return setup().then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-custom-factor')).toBe(true);
      });
    });

    itp('has a "back" link in the footer', function() {
      return setup().then(function(test) {
        Expect.isVisible(test.form.backLink());
      });
    });

    itp('displays correct title', function() {
      return setup().then(function(test) {
        test.setNextResponse(responseSuccess);
        expect(test.form.titleText()).toBe('IDP factor');
        expect(test.form.buttonBar().hasClass('hide')).toBe(false);
      });
    });

    itp('displays correct subtitle', function() {
      return setup().then(function(test) {
        test.setNextResponse(responseSuccess);
        expect(test.form.subtitleText()).toBe('Clicking below will redirect to MFA enrollment with IDP factor');
        expect(test.form.buttonBar().hasClass('hide')).toBe(false);
      });
    });

    itp('redirects to third party when Enroll button is clicked', function() {
      spyOn(SharedUtil, 'redirect');
      return setup()
        .then(function(test) {
          test.setNextResponse(responseSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function() {
          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'http://rain.okta1.com:1802/sso/idps/idpId?stateToken=testStateToken'
          );
        });
    });

    itp('does not display error for normal setup', function() {
      return setup().then(function(test) {
        expect(test.form.hasErrorBox()).toBe(false);
      });
    });

    itp('displays error when factorResult is FAILED', function() {
      const options = {
        setFactorResult: true,
        factorResult: 'FAILED',
        factorResultMessage: 'Enroll failed.',
      };

      return setup(options).then(function(test) {
        expect(test.form.hasErrorBox()).toBe(true);
        expect(test.form.errorBoxMessage()).toBe('Enroll failed.');
      });
    });

    itp('does not display error when factorResult is WAITING', function() {
      const options = {
        setFactorResult: true,
        factorResult: 'WAITING',
        factorResultMessage: 'Enroll failed.',
      };

      return setup(options).then(function(test) {
        expect(test.form.hasErrorBox()).toBe(false);
      });
    });

    itp('does not display error when factorResult is undefined', function() {
      const options = {
        setFactorResult: true,
        factorResultMessage: 'Enroll failed.',
      };

      return setup(options).then(function(test) {
        expect(test.form.hasErrorBox()).toBe(false);
      });
    });

    itp('displays default error when factorResultMessage is undefined', function() {
      const options = {
        setFactorResult: true,
        factorResult: 'FAILED',
      };

      return setup(options).then(function(test) {
        expect(test.form.hasErrorBox()).toBe(true);
        expect(test.form.errorBoxMessage()).toBe('There was an unexpected internal error. Please try again.');
      });
    });
  });
});
