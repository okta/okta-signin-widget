/* eslint max-params: [2, 18], max-statements: 0 */
import { _, internal } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'v1/LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import PivForm from 'helpers/dom/PivForm';
import PrimaryAuthForm from 'helpers/dom/PrimaryAuthForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resGet from 'helpers/xhr/PIV_GET';
import resPost from 'helpers/xhr/PIV_POST';
import resError from 'helpers/xhr/PIV_error';
import $sandbox from 'sandbox';
const SharedUtil = internal.util.Util;
const itp = Expect.itp;

function setup(errorResponse, pivConfig) {
  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl }
  });
  const successSpy = jasmine.createSpy('success');
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
  const defaultConfig = {
    certAuthUrl: 'https://foo.com',
    isCustomDomain: true,
  };
  const router = new Router(
    _.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy,
      relayState: '%2Fapp%2FUserHome',
      piv: pivConfig || defaultConfig,
    })
  );
  const form = new PivForm($sandbox);
  const loginForm = new PrimaryAuthForm($sandbox);
  const beacon = new Beacon($sandbox);

  router.on('afterError', afterErrorHandler);
  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  spyOn(SharedUtil, 'redirect');
  setNextResponse(errorResponse ? [errorResponse] : [resGet, resPost]);
  Util.resetAjaxRequests();
  router.verifyPIV();
  return Expect.waitForVerifyPIV({
    router: router,
    form: form,
    loginForm: loginForm,
    beacon: beacon,
    ac: authClient,
    setNextResponse: setNextResponse,
    successSpy: successSpy,
    afterErrorHandler: afterErrorHandler,
  });
}

function deepClone(res) {
  return JSON.parse(JSON.stringify(res));
}

Expect.describe('PIV', function() {
  Expect.describe('General', function() {
    itp('displays the correct beacon', function() {
      return setup().then(function(test) {
        expect(test.beacon.isPIVBeacon()).toBe(true);
        expect(test.beacon.hasClass('smartcard')).toBe(true);
      });
    });
    itp('displays the correct title', function() {
      return setup().then(function(test) {
        expect(test.form.titleText()).toBe('PIV / CAC card');
      });
    });
    itp('has a "back" link in the footer', function() {
      return setup().then(function(test) {
        Expect.isVisible(test.form.backLink());
      });
    });
    itp('has spinning wait icon', function() {
      return setup().then(function(test) {
        Expect.isVisible(test.form.spinningIcon());
        Expect.isNotVisible(test.form.submitButton());
      });
    });
    itp('displays the correct instructions', function() {
      return setup().then(function(test) {
        expect(test.form.instructions()).toBe('Please insert your PIV / CAC card and select the user certificate.');
      });
    });
    itp('makes ajax get and post calls with correct data', function() {
      return setup()
        .then(function() {
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(2);

          const argsForGet = Util.getAjaxRequest(0);

          expect(argsForGet.url).toBe('https://foo.com');
          expect(argsForGet.method).toBe('GET');

          const argsForPost = Util.getAjaxRequest(1);

          expect(argsForPost.url).toBe('https://foo.com');
          expect(argsForPost.method).toBe('POST');
          expect(JSON.parse(argsForPost.params)).toEqual({
            fromURI: '%2Fapp%2FUserHome',
            isCustomDomain: true,
          });
        });
    });
    itp('makes post call with correct data when isCustomDomain is false', function() {
      const config = {
        certAuthUrl: 'https://foo.com',
        isCustomDomain: false,
      };

      return setup(null, config)
        .then(function() {
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(2);
          const argsForPost = Util.getAjaxRequest(1);

          expect(JSON.parse(argsForPost.params)).toEqual({
            fromURI: '%2Fapp%2FUserHome',
            isCustomDomain: false,
          });
        });
    });
    itp('makes post call with correct data when isCustomDomain is undefined', function() {
      const config = {
        certAuthUrl: 'https://foo.com',
        isCustomDomain: undefined,
      };

      return setup(null, config)
        .then(function() {
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(2);
          const argsForPost = Util.getAjaxRequest(1);

          expect(JSON.parse(argsForPost.params)).toEqual({
            fromURI: '%2Fapp%2FUserHome',
          });
        });
    });
    itp('redirects on successful cert auth', function() {
      return setup()
        .then(function() {
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function() {
          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'https://rain.okta1.com/login/sessionCookieRedirect?redirectUrl=%2Fapp%2FUserHome&amp;token=token1'
          );
        });
    });
  });
  Expect.describe('Error', function() {
    const pivError = deepClone(resError);

    itp('shows error box with error response', function() {
      return setup(pivError)
        .then(function(test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toEqual(1);
          expect(test.form.errorMessage()).toEqual('Invalid certificate.');
        });
    });
    itp('displays retry button', function() {
      return setup(pivError)
        .then(function(test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          Expect.isVisible(test.form.submitButton());
          Expect.isNotVisible(test.form.spinningIcon());
        });
    });
    itp('can retry authentication', function() {
      return setup(pivError)
        .then(function(test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          test.setNextResponse([resGet, resPost]);
          test.form.submit();
          return Expect.waitForSpyCall(SharedUtil.redirect);
        })
        .then(function() {
          expect(SharedUtil.redirect).toHaveBeenCalledWith(
            'https://rain.okta1.com/login/sessionCookieRedirect?redirectUrl=%2Fapp%2FUserHome&amp;token=token1'
          );
        });
    });
    itp('shows generic error message for undefined error response', function() {
      const res = deepClone(resError);

      res.response = undefined;
      return setup(res)
        .then(function(test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toEqual(1);
          expect(test.form.errorMessage()).toEqual(
            'There was an error signing in. Click the button below to try again.'
          );
        });
    });
    itp('shows generic error message for empty text error response', function() {
      const res = deepClone(resError);

      res.responseType = 'text';
      res.response = '';
      return setup(res)
        .then(function(test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toEqual(1);
          expect(test.form.errorMessage()).toEqual(
            'There was an error signing in. Click the button below to try again.'
          );
        });
    });
    itp('shows correct error message for text error response', function() {
      const res = deepClone(resError);

      res.responseType = 'text';
      res.response =
        '{"errorCode":"E0000004","errorSummary":"Authentication failed","errorLink":"E0000004","errorId":"oaeDtg9knyJR7agwMN-70SYgw","errorCauses":[]}';
      return setup(res)
        .then(function(test) {
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toEqual(1);
          expect(test.form.errorMessage()).toEqual('Authentication failed');
        });
    });
  });
});
