/* eslint max-params: [2, 16] */
import { _ } from 'okta';
import createAuthClient from 'widget/createAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollWebauthnForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resEnrollActivateWebauthn from 'helpers/xhr/MFA_ENROLL_ACTIVATE_webauthn';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resWebauthn from 'helpers/xhr/MFA_ENROLL_webauthn';
import resSuccess from 'helpers/xhr/SUCCESS';
import Q from 'q';
import $sandbox from 'sandbox';
import BrowserFeatures from 'util/BrowserFeatures';
import CryptoUtil from 'util/CryptoUtil';
import webauthn from 'util/webauthn';
const itp = Expect.itp;
const testAttestationObject = 'c29tZS1yYW5kb20tYXR0ZXN0YXRpb24tb2JqZWN0';
const testClientData = 'c29tZS1yYW5kb20tY2xpZW50LWRhdGE=';

Expect.describe('EnrollWebauthn', function() {
  function setup(startRouter, onlyWebauthn) {
    const settings = {};

    settings['features.webauthn'] = true;

    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = createAuthClient({ issuer: baseUrl });
    const successSpy = jasmine.createSpy('success');
    const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
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

    router.on('afterError', afterErrorHandler);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router, startRouter);

    const test = {
      router: router,
      beacon: new Beacon($sandbox),
      form: new Form($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy,
      afterErrorHandler: afterErrorHandler,
    };

    const enrollWebAuthn = test => {
      setNextResponse(onlyWebauthn ? resWebauthn : resAllFactors);
      router.refreshAuthState('dummy-token');
      return Expect.waitForEnrollChoices(test).then(function(test) {
        router.enrollWebauthn();
        return Expect.waitForEnrollWebauthn(test);
      });
    };
    if (startRouter) {
      return Expect.waitForPrimaryAuth(test).then(enrollWebAuthn);
    } else {
      return enrollWebAuthn(test);
    }
  }

  function mockWebauthn() {
    navigator.credentials = { create: function() {} };
  }

  function mockWebauthnSuccessRegistration(resolvePromise) {
    mockWebauthn();
    spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
    spyOn(navigator.credentials, 'create').and.callFake(function() {
      const deferred = Q.defer();

      if (resolvePromise) {
        deferred.resolve({
          response: {
            attestationObject: CryptoUtil.strToBin(testAttestationObject),
            clientDataJSON: CryptoUtil.strToBin(testClientData),
          },
        });
      }
      return deferred.promise;
    });
  }

  function mockWebauthnFailureRegistration() {
    Q.stopUnhandledRejectionTracking();
    mockWebauthn();
    spyOn(navigator.credentials, 'create').and.callFake(function() {
      const deferred = Q.defer();

      deferred.reject({ message: 'something went wrong' });
      return deferred.promise;
    });
  }

  Expect.describe('Header & Footer', function() {
    itp('displays the correct factorBeacon', function() {
      return setup().then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-webauthn')).toBe(true);
      });
    });
    itp('has a "back" link in the footer', function() {
      return setup().then(function(test) {
        Expect.isVisible(test.form.backLink());
      });
    });
  });

  Expect.describe('Enroll factor', function() {
    itp('shows error if browser does not support webauthn', function() {
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(false);

      return setup().then(function(test) {
        expect(test.form.errorHtml().length).toEqual(1);
        expect(test.form.errorHtml().html()).toEqual(
          'Security key or biometric authenticator is not supported on this browser.' +
            ' Select another factor or contact your admin for assistance.'
        );
      });
    });

    itp('shows error if browser does not support webauthn and only one factor', function() {
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(false);

      return setup(false, true).then(function(test) {
        expect(test.form.errorHtml().length).toEqual(1);
        expect(test.form.errorHtml().html()).toEqual(
          'Security key or biometric authenticator is not supported on this browser.' +
            ' Contact your admin for assistance.'
        );
      });
    });

    itp('does not show error if browser supports webauthn', function() {
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
      return setup().then(function(test) {
        expect(test.form.errorHtml().length).toEqual(0);
      });
    });

    itp('shows instructions and a register button', function() {
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
      return setup().then(function(test) {
        Expect.isVisible(test.form.enrollInstructions());
        Expect.isVisible(test.form.submitButton());
      });
    });

    itp('shows correct instructions for Edge browser', function() {
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
      spyOn(BrowserFeatures, 'isEdge').and.returnValue(true);
      return setup().then(function(test) {
        Expect.isVisible(test.form.enrollInstructions());
        Expect.isVisible(test.form.enrollEdgeInstructions());
        expect(test.form.enrollEdgeInstructions().text()).toEqual(
          'Note: If you are enrolling a security key and' +
            ' Windows Hello or PIN is enabled, you will need to select \'Cancel\' in the prompt before continuing.'
        );
        Expect.isVisible(test.form.submitButton());
        expect(BrowserFeatures.isEdge).toHaveBeenCalled();
      });
    });

    itp('shows a note on support restrictions for firefox on mac', function() {
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
      spyOn(BrowserFeatures, 'isFirefox').and.returnValue(true);
      spyOn(BrowserFeatures, 'isSafari').and.returnValue(false);
      spyOn(BrowserFeatures, 'isMac').and.returnValue(true);
      return setup().then(function(test) {
        Expect.isVisible(test.form.enrollInstructions());
        Expect.isVisible(test.form.enrollRestrictions());
        expect(test.form.enrollRestrictions().text()).toEqual(
          'Note: Some browsers may not support biometric authenticators.'
        );
        Expect.isVisible(test.form.submitButton());
        expect(BrowserFeatures.isFirefox).toHaveBeenCalled();
        expect(BrowserFeatures.isSafari).not.toHaveBeenCalled();
        expect(BrowserFeatures.isMac).toHaveBeenCalled();
      });
    });

    itp('shows a note on support restrictions for safari on mac', function() {
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);
      spyOn(BrowserFeatures, 'isFirefox').and.returnValue(false);
      spyOn(BrowserFeatures, 'isSafari').and.returnValue(true);
      spyOn(BrowserFeatures, 'isMac').and.returnValue(true);
      return setup().then(function(test) {
        Expect.isVisible(test.form.enrollInstructions());
        Expect.isVisible(test.form.enrollRestrictions());
        expect(test.form.enrollRestrictions().text()).toEqual(
          'Note: Some browsers may not support biometric authenticators.'
        );
        Expect.isVisible(test.form.submitButton());
        expect(BrowserFeatures.isFirefox).toHaveBeenCalled();
        expect(BrowserFeatures.isSafari).toHaveBeenCalled();
        expect(BrowserFeatures.isMac).toHaveBeenCalled();
      });
    });

    itp('calls abort on appstate when switching to factor list after clicking enroll', function() {
      mockWebauthnSuccessRegistration(false);
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn]);
          test.form.submit();
          return Expect.waitForSpyCall(navigator.credentials.create, test);
        })
        .then(function(test) {
          Util.resetAjaxRequests();
          test.webauthnAbortController = test.router.controller.model.webauthnAbortController;
          expect(test.webauthnAbortController).toBeDefined();
          spyOn(test.webauthnAbortController, 'abort').and.callThrough();
          test.setNextResponse([resAllFactors]);
          test.form.backLink().click();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function(test) {
          expect(test.router.controller.model.webauthnAbortController).not.toBeDefined();
          expect(test.webauthnAbortController.abort).toHaveBeenCalled();
        });
    });

    itp('shows a waiting spinner after submitting the form', function() {
      mockWebauthnSuccessRegistration(true);
      return setup()
        .then(function(test) {
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(navigator.credentials.create, test);
        })
        .then(function(test) {
          Expect.isVisible(test.form.enrollInstructions());
          Expect.isVisible(test.form.enrollSpinningIcon());
          Expect.isNotVisible(test.form.submitButton());
        });
    });

    itp('sends enroll request after submitting the form', function() {
      mockWebauthnSuccessRegistration(true);
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              stateToken: 'testStateToken',
              factorType: 'webauthn',
              provider: 'FIDO',
            },
          });
        });
    });

    itp('calls navigator.credentials.create and activates the factor', function() {
      mockWebauthnSuccessRegistration(true);
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          expect(navigator.credentials.create).toHaveBeenCalledWith({
            publicKey: {
              rp: {
                name: 'acme',
              },
              user: {
                id: CryptoUtil.strToBin('00u1212qZXXap6Cts0g4'),
                name: 'yuming.cao@okta.com',
                displayName: 'Test User',
              },
              pubKeyCredParams: [
                {
                  type: 'public-key',
                  alg: -7,
                },
              ],
              challenge: CryptoUtil.strToBin('G7bIvwrJJ33WCEp6GGSH'),
              authenticatorSelection: {
                authenticatorAttachment: 'cross-platform',
                requireResidentKey: false,
                userVerification: 'preferred',
              },
              u2fParams: {
                appid: 'https://test.okta.com',
              },
              excludeCredentials: [
                {
                  type: 'public-key',
                  id: CryptoUtil.strToBin(
                    'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt'
                  ),
                },
              ],
            },
            signal: jasmine.any(Object),
          });
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/fuf52dhWPdJAbqiUU0g4/lifecycle/activate',
            data: {
              attestation: testAttestationObject,
              clientData: testClientData,
              stateToken: 'testStateToken',
            },
          });
          expect(test.router.controller.model.webauthnAbortController).toBe(null);
        });
    });

    itp('shows error when navigator.credentials.create failed', function() {
      spyOn(webauthn, 'isNewApiAvailable').and.returnValue(true);

      mockWebauthnFailureRegistration();
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(navigator.credentials.create, test);
        })
        .then(function(test) {
          expect(navigator.credentials.create).toHaveBeenCalled();
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toEqual(1);
          expect(test.form.errorMessage()).toEqual('something went wrong');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
            {
              controller: 'enroll-webauthn',
            },
            {
              name: 'WEB_AUTHN_ERROR',
              message: 'something went wrong',
              xhr: {
                responseJSON: {
                  errorSummary: 'something went wrong',
                },
              },
            },
          ]);
          expect(test.router.controller.model.webauthnAbortController).toBe(null);
        });
    });
  });
});
