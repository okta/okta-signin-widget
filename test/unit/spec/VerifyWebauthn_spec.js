/* eslint max-params: [2, 19] */

import { _, $ } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import MfaVerifyForm from 'helpers/dom/MfaVerifyForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resCancel from 'helpers/xhr/CANCEL';
import resChallengeMultipleWebauthn from 'helpers/xhr/MFA_CHALLENGE_multipleWebauthn';
import resChallengeWebauthn from 'helpers/xhr/MFA_CHALLENGE_webauthn';
import resAllFactors from 'helpers/xhr/MFA_REQUIRED_allFactors';
import resMultipleWebauthn from 'helpers/xhr/MFA_REQUIRED_multipleWebauthn';
import resMultipleWebauthnWithQuestion from 'helpers/xhr/MFA_REQUIRED_multipleWebauthn_question';
import resSuccess from 'helpers/xhr/SUCCESS';
import Q from 'q';
import $sandbox from 'sandbox';
import CryptoUtil from 'util/CryptoUtil';
import BrowserFeatures from 'util/BrowserFeatures';
import LoginUtil from 'util/Util';
import webauthn from 'util/webauthn';
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

const Factors = {
  WEBAUTHN: 0,
  QUESTION: 1,
};

const configWithCustomLink = {
  helpLinks: {
    factorPage: {
      text: 'Need help with MFA?',
      href: 'https://acme.com/mfa-help',
    }
  }
};

const configWithCustomLinkNoText = {
  helpLinks: {
    factorPage: {
      href: 'https://acme.com/mfa-help',
    }
  }
};

const configWithCustomLinkNoHref = {
  helpLinks: {
    factorPage: {
      text: 'Need help with MFA?',
    }
  }
};

function clickFactorInDropdown(test, factorName) {
  test.beacon.getOptionsLinks().eq(Factors[factorName]).click();
}

function setup(options) {
  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
  });
  const successSpy = jasmine.createSpy('success');
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
  const router = createRouter(baseUrl, authClient, successSpy, { ...options.settings, 'features.webauthn': true });

  router.on('afterError', afterErrorHandler);
  setNextResponse(options.multipleWebauthn ? [resMultipleWebauthnWithQuestion] : [resAllFactors]);
  router.refreshAuthState('dummy-token');
  return Expect.waitForMfaVerify()
    .then(function() {
      const responses = options.multipleWebauthn ? [resChallengeMultipleWebauthn] : [resChallengeWebauthn];

      if (options.signStatus === 'success') {
        responses.push(resSuccess);
      }
      setNextResponse(responses);
      router.verifyWebauthn();
      return Expect.waitForVerifyWebauthn();
    })
    .then(function() {
      const $forms = $sandbox.find('.o-form');

      let forms = _.map($forms, function(form) {
        return new MfaVerifyForm($(form));
      });

      if (forms.length === 1) {
        forms = forms[0];
      }
      const beacon = new Beacon($sandbox);
      return {
        router: router,
        form: forms,
        beacon: beacon,
        ac: authClient,
        setNextResponse: setNextResponse,
        successSpy: successSpy,
        afterErrorHandler: afterErrorHandler,
      };
    });
}

const testAuthData = 'c29tZS1yYW5kb20tYXR0ZXN0YXRpb24tb2JqZWN0';
const testClientData = 'c29tZS1yYW5kb20tY2xpZW50LWRhdGE=';
const testSignature = 'YWJjZGVmYXNkZmV3YWZrbm1hc2xqZWY=';
const testCredentialId = 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZw';
const testChallenge = 'kygOUtSWURMv_t_Gj71Y';

function mockWebauthn(options) {
  if (options.webauthnSupported) {
    Object.defineProperty(navigator, 'credentials', {
      value: {
        get: () => jasmine.createSpy('webauthn-spy'),
      },
      configurable: true
    });

    if (options.signStatus === 'fail') {
      mockWebauthnSignFailure();
    } else if (options.signStatus === 'success') {
      mockWebauthnSignSuccess(options.rememberDevice);
    } else {
      mockWebauthnSignPending();
    }
  } else {
    delete navigator.credentials;
  }
}

function mockWebauthnSignFailure() {
  spyOn(navigator.credentials, 'get').and.callFake(function() {
    const deferred = Q.defer();

    deferred.reject({ message: 'something went wrong' });
    return deferred.promise;
  });
}

function mockWebauthnSignSuccess(rememberDevice) {
  spyOn(navigator.credentials, 'get').and.callFake(function() {
    if (rememberDevice) {
      $('[name=rememberDevice]').prop('checked', true);
      $('[name=rememberDevice]').trigger('change');
    }
    const deferred = Q.defer();

    deferred.resolve({
      response: {
        signature: CryptoUtil.strToBin(testSignature),
        clientDataJSON: CryptoUtil.strToBin(testClientData),
        authenticatorData: CryptoUtil.strToBin(testAuthData),
      },
    });
    return deferred.promise;
  });
}

function mockWebauthnSignPending() {
  spyOn(navigator.credentials, 'get').and.returnValue(Q.defer().promise);
}

function setupWebauthnFactor(options) {
  options || (options = {});
  spyOn(webauthn, 'isNewApiAvailable').and.returnValue(options.webauthnSupported === true);
  const isSafari = options.isSafari ? true : false;
  spyOn(BrowserFeatures, 'isSafari').and.returnValue(isSafari === true);
  mockWebauthn(options);
  return setup(options);
}

function setupMultipleWebauthnOnly(options) {
  options || (options = {});
  options.multipleWebauthn = true;
  spyOn(webauthn, 'isNewApiAvailable').and.returnValue(options.webauthnSupported === true);

  mockWebauthn(options);
  const setNextResponse = Util.mockAjax();
  const baseUrl = 'https://foo.com';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
  });
  const successSpy = jasmine.createSpy('success');
  const afterErrorHandler = jasmine.createSpy('afterErrorHandler');
  const router = createRouter(baseUrl, authClient, successSpy, { ...options.settings, 'features.webauthn': true });

  router.on('afterError', afterErrorHandler);
  const responses = [resMultipleWebauthn, resChallengeMultipleWebauthn];

  if (options.signStatus === 'success') {
    responses.push(resSuccess);
  }
  setNextResponse(responses);
  router.refreshAuthState('dummy-token');
  return Expect.waitForVerifyWebauthn().then(function() {
    const $forms = $sandbox.find('.o-form');

    let forms = _.map($forms, function(form) {
      return new MfaVerifyForm($(form));
    });

    if (forms.length === 1) {
      forms = forms[0];
    }
    const beacon = new Beacon($sandbox);

    return {
      router: router,
      form: forms,
      beacon: beacon,
      ac: authClient,
      setNextResponse: setNextResponse,
      successSpy: successSpy,
      afterErrorHandler: afterErrorHandler,
    };
  });
}

function setupMultipleWebauthn(options) {
  options || (options = {});
  options.multipleWebauthn = true;
  return setupWebauthnFactor(options);
}

function expectHasRightBeaconImage(test, desiredClassName) {
  expect(test.beacon.isFactorBeacon()).toBe(true);
  expect(test.beacon.hasClass(desiredClassName)).toBe(true);
}

function expectTitleToBe(test, desiredTitle) {
  expect(test.form.titleText()).toBe(desiredTitle);
}

function testWebauthnFactor(setupFn, webauthnOnly) {
  itp('shows the right beacon and title for webauthn', function() {
    return setupFn({ webauthnSupported: true }).then(function(test) {
      expectHasRightBeaconImage(test, 'mfa-webauthn');
      expectTitleToBe(test, 'Security Key or Biometric Authenticator');
    });
  });

  itp('shows error if browser does not support webauthn', function() {
    return setupFn({ webauthnSupported: false }).then(function(test) {
      expect(test.form.el('o-form-error-html').length).toEqual(1);
      const errorMessage = webauthnOnly
        ? 'Security key or biometric authenticator is not supported on this browser. ' +
            'Contact your admin for assistance.'
        : 'Security key or biometric authenticator is not supported on this browser. ' +
            'Select another factor or contact your admin for assistance.';

      expect(test.form.el('o-form-error-html').find('strong').html()).toEqual(errorMessage);
    });
  });

  itp('does not show error if browser supports webauthn', function() {
    return setupFn({ webauthnSupported: true }).then(function(test) {
      expect(test.form.el('o-form-error-html').length).toEqual(0);
    });
  });

  itp('shows verify button when webauthn challenge page is loaded when on safari', function() {
    return setupFn({ webauthnSupported: true, isSafari: true }).then(function(test) {
      expect(test.form.submitButton().css('display')).toBe('block');
      expect(test.form.submitButtonText()).toBe('Verify');
    });
  });

  itp('does not show verify button when not on safari', function() {
    return setupFn({ webauthnSupported: true }).then(function(test) {
      return Expect.waitForSpyCall(navigator.credentials.get, test);
    }).then(function(test) {
      Expect.isNotVisible(test.form.submitButton());
      expect(test.form.submitButtonText()).toBe('Verify');
    });
  });

  itp('has remember device checkbox', function() {
    return setupFn({ webauthnSupported: true }).then(function(test) {
      Expect.isVisible(test.form.rememberDeviceCheckbox());
    });
  });

  itp('has a sign out link', function() {
    return setupFn({ webauthnSupported: true }).then(function(test) {
      Expect.isVisible(test.form.signoutLink($sandbox));
      expect(test.form.signoutLink($sandbox).text()).toBe('Back to sign in');
    });
  });
  itp('does not have sign out link if features.hideSignOutLinkInMFA is true', function() {
    return setupFn({ webauthnSupported: true, settings: {'features.hideSignOutLinkInMFA': true} }).then(function(test) {
      expect(test.form.signoutLink($sandbox).length).toBe(0);
    });
  });
  itp('does not have sign out link if features.mfaOnlyFlow is true', function() {
    return setupFn({ webauthnSupported: true, settings: {'features.mfaOnlyFlow': true} }).then(function(test) {
      expect(test.form.signoutLink($sandbox).length).toBe(0);
    });
  });
}

function testMultipleWebauthnFactor(setupFn) {
  itp('calls navigator.credentials.get and verifies factor', function() {
    return setupFn({
      webauthnSupported: true,
      signStatus: 'success',
    })
      .then(function(test) {
        return Expect.waitForSpyCall(test.successSpy);
      })
      .then(function() {
        expect(navigator.credentials.get).toHaveBeenCalledWith({
          publicKey: {
            allowCredentials: [
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(testCredentialId),
              },
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(testCredentialId),
              },
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(testCredentialId),
              },
            ],
            challenge: CryptoUtil.strToBin(testChallenge),
            extensions: {
              appid: 'https://foo.com',
            },
          },
          signal: jasmine.any(Object),
        });
        expect(Util.numAjaxRequests()).toBe(3);
        Expect.isJsonPost(Util.getAjaxRequest(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthn/verify?rememberDevice=false',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            authenticatorData: testAuthData,
            stateToken: 'testStateToken',
          },
        });
      });
  });

  itp('calls navigator.credentials.get and verifies factor when rememberDevice set to true', function() {
    return setupFn({
      webauthnSupported: true,
      signStatus: 'success',
      rememberDevice: true,
    })
      .then(function(test) {
        return Expect.waitForSpyCall(test.successSpy);
      })
      .then(function() {
        expect(navigator.credentials.get).toHaveBeenCalledWith({
          publicKey: {
            allowCredentials: [
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(testCredentialId),
              },
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(testCredentialId),
              },
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(testCredentialId),
              },
            ],
            challenge: CryptoUtil.strToBin(testChallenge),
            extensions: {
              appid: 'https://foo.com',
            },
          },
          signal: jasmine.any(Object),
        });
        expect(Util.numAjaxRequests()).toBe(3);
        Expect.isJsonPost(Util.getAjaxRequest(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthn/verify?rememberDevice=true',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            authenticatorData: testAuthData,
            stateToken: 'testStateToken',
          },
        });
      });
  });

  itp('shows an error if navigator.credentials.get fails and displays retry button', function() {
    Expect.allowUnhandledPromiseRejection();
    return setupFn({
      webauthnSupported: true,
      signStatus: 'fail',
    })
      .then(function(test) {
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(navigator.credentials.get).toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox().length).toEqual(1);
        expect(test.form.errorMessage()).toEqual('something went wrong');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.form.submitButton().css('display')).toBe('block');
        expect(test.form.submitButtonText()).toBe('Retry');
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'mfa-verify verify-webauthn',
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
      });
  });
}

Expect.describe('Webauthn Factor', function() {
  testWebauthnFactor(setupWebauthnFactor);

  itp('calls navigator.credentials.get and verifies factor', function() {
    return setupWebauthnFactor({
      webauthnSupported: true,
      signStatus: 'success',
    })
      .then(function(test) {
        return Expect.waitForSpyCall(test.successSpy, test);
      })
      .then(function(test) {
        expect(navigator.credentials.get).toHaveBeenCalledWith({
          publicKey: {
            allowCredentials: [
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(testCredentialId),
              },
            ],
            challenge: CryptoUtil.strToBin(testChallenge),
            extensions: {
              appid: 'https://foo.com',
            },
          },
          signal: jasmine.any(Object),
        });
        expect(Util.numAjaxRequests()).toBe(3);
        Expect.isJsonPost(Util.getAjaxRequest(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthnFactorId/verify?rememberDevice=false',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            authenticatorData: testAuthData,
            stateToken: 'testStateToken',
          },
        });
        expect(test.router.controller.model.webauthnAbortController).toBe(null);
      });
  });

  itp('calls navigator.credentials.get and verifies factor when rememberDevice set to true', function() {
    return setupWebauthnFactor({
      webauthnSupported: true,
      signStatus: 'success',
      rememberDevice: true,
    })
      .then(function(test) {
        return Expect.waitForSpyCall(test.successSpy);
      })
      .then(function() {
        expect(navigator.credentials.get).toHaveBeenCalledWith({
          publicKey: {
            allowCredentials: [
              {
                type: 'public-key',
                id: CryptoUtil.strToBin(testCredentialId),
              },
            ],
            challenge: CryptoUtil.strToBin(testChallenge),
            extensions: {
              appid: 'https://foo.com',
            },
          },
          signal: jasmine.any(Object),
        });
        expect(Util.numAjaxRequests()).toBe(3);
        Expect.isJsonPost(Util.getAjaxRequest(2), {
          url: 'https://foo.com/api/v1/authn/factors/webauthnFactorId/verify?rememberDevice=true',
          data: {
            clientData: testClientData,
            signatureData: testSignature,
            authenticatorData: testAuthData,
            stateToken: 'testStateToken',
          },
        });
      });
  });

  itp('shows an error if navigator.credentials.get fails', function() {
    Expect.allowUnhandledPromiseRejection();
    return setupWebauthnFactor({
      webauthnSupported: true,
      signStatus: 'fail',
    })
      .then(function(test) {
        return Expect.waitForFormError(test.form, test);
      })
      .then(function(test) {
        expect(navigator.credentials.get).toHaveBeenCalled();
        expect(test.form.hasErrors()).toBe(true);
        expect(test.form.errorBox().length).toEqual(1);
        expect(test.form.errorMessage()).toEqual('something went wrong');
        expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
        expect(test.router.controller.model.webauthnAbortController).toBe(null);
        expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
          {
            controller: 'mfa-verify verify-webauthn',
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
      });
  });
});

Expect.describe('Only multiple Webauthn is setup', function() {
  testWebauthnFactor(setupMultipleWebauthnOnly, true);
  testMultipleWebauthnFactor(setupMultipleWebauthnOnly);
});

Expect.describe('Multiple Webauthn and one or more factors are setup', function() {
  testWebauthnFactor(setupMultipleWebauthn);
  testMultipleWebauthnFactor(setupMultipleWebauthn);

  itp('switching to another factor after initiating webauthn verify calls abort', function() {
    return setupMultipleWebauthn({ webauthnSupported: true })
      .then(function(test) {
        return Expect.waitForSpyCall(navigator.credentials.get, test);
      })
      .then(function(test) {
        expect(test.form.el('webauthn-waiting').length).toBe(1);
        const webauthnAbortController = test.router.controller.model.webauthnAbortController;

        expect(webauthnAbortController).toBeDefined();
        spyOn(webauthnAbortController, 'abort').and.callThrough();
        clickFactorInDropdown(test, 'QUESTION');
        expect(test.router.navigate).toHaveBeenCalledWith('signin/verify/okta/question', { trigger: true });
        expect(test.router.controller.model.webauthnAbortController).not.toBeDefined();
        expect(webauthnAbortController.abort).toHaveBeenCalled();
      });
  });

  itp('SignOut after initiating webauthn verify calls abort', function() {
    return setupMultipleWebauthn({ webauthnSupported: true })
      .then(function(test) {
        return Expect.waitForSpyCall(navigator.credentials.get, test);
      })
      .then(function(test) {
        expect(test.form.el('webauthn-waiting').length).toBe(1);
        test.webauthnAbortController = test.router.controller.model.webauthnAbortController;
        expect(test.webauthnAbortController).toBeDefined();
        spyOn(test.webauthnAbortController, 'abort').and.callThrough();
        test.setNextResponse([resCancel]);
        test.form.signoutLink(test.router.el).click();
        return Expect.waitForPrimaryAuth(test);
      })
      .then(function(test) {
        expect(test.router.controller.model.webauthnAbortController).not.toBeDefined();
        expect(test.webauthnAbortController.abort).toHaveBeenCalled();
      });
  });
});

Expect.describe('Factor page custom link', function() {
  itp('is visible if configured and has correct text and url', function() {
    return setupWebauthnFactor({ webauthnSupported: true, settings: configWithCustomLink }).then(function(test) {
      Expect.isVisible(test.form.factorPageCustomLink($sandbox));
      expect(test.form.factorPageCustomLinkLabel($sandbox).trim()).toBe('Need help with MFA?');
      expect(test.form.factorPageCustomLinkHref($sandbox).trim()).toBe('https://acme.com/mfa-help');
    });
  });
  itp('is not visible if not configured', function() {
    return setupWebauthnFactor({ webauthnSupported: true }).then(function(test) {
      expect(test.form.factorPageCustomLink($sandbox).length).toBe(0);
    });
  });
  itp('is not visible if configured without text', function() {
    return setupWebauthnFactor({ webauthnSupported: true, settings: configWithCustomLinkNoText }).then(function(test) {
      expect(test.form.factorPageCustomLink($sandbox).length).toBe(0);
    });
  });
  itp('is not visible if configured without url', function() {
    return setupWebauthnFactor({ webauthnSupported: true, settings: configWithCustomLinkNoHref }).then(function(test) {
      expect(test.form.factorPageCustomLink($sandbox).length).toBe(0);
    });
  });
});
