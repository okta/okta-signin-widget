/* eslint max-params: [2, 16] */
import { _ } from '@okta/courage';
import getAuthClient from 'helpers/getAuthClient';
import Router from 'v1/LoginRouter';
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
const transports = ['usb', 'nfc'];
const clientExtensions = { 'credProps': { 'rk': true } };

Expect.describe('EnrollWebauthn', function () {
  function setup(startRouter, onlyWebauthn) {
    const settings = {};

    settings['features.webauthn'] = true;

    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl }
    });
    // const successSpy = jasmine.createSpy('success');
    const successSpy = jest.fn();
    // const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
    const afterErrorHandler = jest.fn();
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
      return Expect.waitForEnrollChoices(test).then(function (test) {
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
    Object.defineProperty(navigator, 'credentials', {
      value: {
        // create: () => jasmine.createSpy('enroll-webauthn-spy'),
        create: () => jest.fn(),
      },
      configurable: true
    });
  }

  function mockWebauthnSuccessRegistration(resolvePromise, isNullable = false) {
    mockWebauthn();
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(navigator.credentials, 'create').mockImplementation(function () {
      const deferred = Q.defer();
      var localTransports;
      var localClientExtensions;
      if (!isNullable) {
        localTransports = transports;
        localClientExtensions = clientExtensions;
      } else {
        localTransports = null;
        localClientExtensions = null;
      }

      if (resolvePromise) {
        deferred.resolve({
          response: {
            attestationObject: CryptoUtil.strToBin(testAttestationObject),
            clientDataJSON: CryptoUtil.strToBin(testClientData),
            getTransports: function () { return localTransports; },
          },
          getClientExtensionResults: function () { return localClientExtensions; },
        });
      }
      return deferred.promise;
    });
  }

  function mockWebauthnFailureRegistration() {
    Q.stopUnhandledRejectionTracking();
    mockWebauthn();
    jest.spyOn(navigator.credentials, 'create').mockImplementation(function () {
      const deferred = Q.defer();

      deferred.reject({ message: 'something went wrong' });
      return deferred.promise;
    });
  }

  function mockWebauthnNonSupportResponse(mockGetTransports, mockGetClientExtensions) {
    mockWebauthn();
    jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
    jest.spyOn(navigator.credentials, 'create').mockImplementation(function () {
      const deferred = Q.defer();
      const localTransports = transports;
      const localClientExtensions = clientExtensions;

      const authenticatorResponse = {
        response: {
          attestationObject: CryptoUtil.strToBin(testAttestationObject),
          clientDataJSON: CryptoUtil.strToBin(testClientData),
        }
      };

      if (mockGetTransports) {
        authenticatorResponse.response.getTransports = function () { return localTransports; };
      }
      if (mockGetClientExtensions) {
        authenticatorResponse.getClientExtensionResults = function () { return localClientExtensions; };
      }

      deferred.resolve(authenticatorResponse);
      return deferred.promise;
    });
  }

  Expect.describe('Header & Footer', function () {
    itp('displays the correct factorBeacon', function () {
      return setup().then(function (test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-webauthn')).toBe(true);
      });
    });
    itp('has a "back" link in the footer', function () {
      return setup().then(function (test) {
        Expect.isVisible(test.form.backLink());
      });
    });
  });

  Expect.describe('Enroll factor', function () {
    itp('shows error if browser does not support webauthn', function () {
      jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(false);

      return setup().then(function (test) {
        expect(test.form.errorHtml().length).toEqual(1);
        expect(test.form.errorHtml().html()).toEqual(
          'Security key or biometric authenticator is not supported on this browser.' +
          ' Select another factor or contact your admin for assistance.'
        );
      });
    });

    itp('shows error if browser does not support webauthn and only one factor', function () {
      jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(false);

      return setup(false, true).then(function (test) {
        expect(test.form.errorHtml().length).toEqual(1);
        expect(test.form.errorHtml().html()).toEqual(
          'Security key or biometric authenticator is not supported on this browser.' +
          ' Contact your admin for assistance.'
        );
      });
    });

    itp('does not show error if browser supports webauthn', function () {
      jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
      return setup().then(function (test) {
        expect(test.form.errorHtml().length).toEqual(0);
      });
    });

    itp('shows instructions and a register button', function () {
      jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
      return setup().then(function (test) {
        Expect.isVisible(test.form.enrollInstructions());
        Expect.isVisible(test.form.submitButton());
      });
    });

    itp('shows correct instructions for Edge browser', function () {
      jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
      jest.spyOn(BrowserFeatures, 'isEdge').mockReturnValue(true);
      return setup().then(function (test) {
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

    itp('shows a note on support restrictions for firefox on mac', function () {
      jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
      jest.spyOn(BrowserFeatures, 'isFirefox').mockReturnValue(true);
      jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(false);
      jest.spyOn(BrowserFeatures, 'isMac').mockReturnValue(true);
      return setup().then(function (test) {
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

    itp('shows a note on support restrictions for safari on mac', function () {
      jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);
      jest.spyOn(BrowserFeatures, 'isFirefox').mockReturnValue(false);
      jest.spyOn(BrowserFeatures, 'isSafari').mockReturnValue(true);
      jest.spyOn(BrowserFeatures, 'isMac').mockReturnValue(true);
      return setup().then(function (test) {
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

    itp('calls abort on appstate when switching to factor list after clicking enroll', function () {
      mockWebauthnSuccessRegistration(false);
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn]);
          test.form.submit();
          return Expect.waitForSpyCall(navigator.credentials.create, test);
        })
        .then(function (test) {
          Util.resetAjaxRequests();
          test.webauthnAbortController = test.router.controller.model.webauthnAbortController;
          expect(test.webauthnAbortController).toBeDefined();
          // jest.spyOn(test.webauthnAbortController, 'abort').and.callThrough();
          jest.spyOn(test.webauthnAbortController, 'abort');
          test.setNextResponse([resAllFactors]);
          test.form.backLink().click();
          return Expect.waitForEnrollChoices(test);
        })
        .then(function (test) {
          expect(test.router.controller.model.webauthnAbortController).not.toBeDefined();
          expect(test.webauthnAbortController.abort).toHaveBeenCalled();
        });
    });

    itp('shows a waiting spinner after submitting the form', function () {
      mockWebauthnSuccessRegistration(true);
      return setup()
        .then(function (test) {
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(navigator.credentials.create, test);
        })
        .then(function (test) {
          Expect.isVisible(test.form.enrollInstructions());
          Expect.isVisible(test.form.enrollSpinningIcon());
          Expect.isNotVisible(test.form.submitButton());
        });
    });

    itp('sends enroll request after submitting the form', function () {
      mockWebauthnSuccessRegistration(true);
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
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

    itp('calls navigator.credentials.create and activates the factor', function () {
      mockWebauthnSuccessRegistration(true);
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          expect(navigator.credentials.create).toHaveBeenCalledWith({
            publicKey: {
              rp: {
                name: 'acme',
              },
              user: {
                id: CryptoUtil.strToBin('00u1212qZXXap6Cts0g4'),
                name: 'test.user@okta.com',
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
            // signal: jasmine.any(Object),
            signal: expect.any(Object),
          });
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/fuf52dhWPdJAbqiUU0g4/lifecycle/activate',
            data: {
              attestation: testAttestationObject,
              clientData: testClientData,
              transports: JSON.stringify(transports),
              clientExtensions: JSON.stringify(clientExtensions),
              stateToken: 'testStateToken',
            },
          });
          expect(test.router.controller.model.webauthnAbortController).toBe(null);
        });
    });

    itp('calls navigator.credentials.create and receives null response', function () {
      mockWebauthnSuccessRegistration(true, true);
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          expect(navigator.credentials.create).toHaveBeenCalledWith({
            publicKey: {
              rp: {
                name: 'acme',
              },
              user: {
                id: CryptoUtil.strToBin('00u1212qZXXap6Cts0g4'),
                name: 'test.user@okta.com',
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
            // signal: jasmine.any(Object),
            signal: expect.any(Object),
          });
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/fuf52dhWPdJAbqiUU0g4/lifecycle/activate',
            data: {
              attestation: testAttestationObject,
              clientData: testClientData,
              transports: null,
              clientExtensions: null,
              stateToken: 'testStateToken',
            },
          });
          expect(test.router.controller.model.webauthnAbortController).toBe(null);
        });
    });

    itp('calls navigator.credentials.create on getTransports non-supported browser', function () {
      mockWebauthnNonSupportResponse(false, true);
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          expect(navigator.credentials.create).toHaveBeenCalledWith({
            publicKey: {
              rp: {
                name: 'acme',
              },
              user: {
                id: CryptoUtil.strToBin('00u1212qZXXap6Cts0g4'),
                name: 'test.user@okta.com',
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
            // signal: jasmine.any(Object),
            signal: expect.any(Object),
          });
          expect(Util.numAjaxRequests()).toBe(2);
          const dataObject = {
            attestation: testAttestationObject,
            clientData: testClientData,
            stateToken: 'testStateToken',
            clientExtensions: JSON.stringify(clientExtensions),
            transports: null
          };

          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/fuf52dhWPdJAbqiUU0g4/lifecycle/activate',
            data: dataObject
          });
          expect(test.router.controller.model.webauthnAbortController).toBe(null);
        });
    });

    itp('calls navigator.credentials.create on getClientExtensions non-supported browser', function () {
      mockWebauthnNonSupportResponse(true, false);
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          expect(navigator.credentials.create).toHaveBeenCalledWith({
            publicKey: {
              rp: {
                name: 'acme',
              },
              user: {
                id: CryptoUtil.strToBin('00u1212qZXXap6Cts0g4'),
                name: 'test.user@okta.com',
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
            // signal: jasmine.any(Object),
            signal: expect.any(Object),
          });
          expect(Util.numAjaxRequests()).toBe(2);
          const dataObject = {
            attestation: testAttestationObject,
            clientData: testClientData,
            stateToken: 'testStateToken',
            transports: JSON.stringify(transports),
            clientExtensions: null
          };

          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/fuf52dhWPdJAbqiUU0g4/lifecycle/activate',
            data: dataObject
          });
          expect(test.router.controller.model.webauthnAbortController).toBe(null);
        });
    });

    itp('shows error when navigator.credentials.create failed', function () {
      jest.spyOn(webauthn, 'isNewApiAvailable').mockReturnValue(true);

      mockWebauthnFailureRegistration();
      return setup()
        .then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateWebauthn, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(navigator.credentials.create, test);
        })
        .then(function (test) {
          expect(navigator.credentials.create).toHaveBeenCalled();
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorBox().length).toEqual(1);
          expect(test.form.errorMessage()).toEqual('something went wrong');
          expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
          expect(test.afterErrorHandler.mock.calls[0]).toEqual([
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
