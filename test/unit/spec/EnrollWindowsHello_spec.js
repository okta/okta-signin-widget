/* eslint max-params:[2, 16] */
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollWindowsHelloForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import responseMfaEnrollActivateWindowsHello from 'helpers/xhr/MFA_ENROLL_ACTIVATE_windows_hello';
import responseMfaEnrollAll from 'helpers/xhr/MFA_ENROLL_allFactors';
import responseSuccess from 'helpers/xhr/SUCCESS';
import Q from 'q';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
import webauthn from 'util/webauthn';
const itp = Expect.itp;

Expect.describe('EnrollWindowsHello', function() {
  function setup() {
    const setNextResponse = Util.mockAjax([responseMfaEnrollAll, responseMfaEnrollActivateWindowsHello]);
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
    });
    const successSpy = jasmine.createSpy('success');
    const router = new Router({
      el: $sandbox,
      baseUrl: baseUrl,
      authClient: authClient,
      globalSuccessFn: successSpy,
    });

    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    router.refreshAuthState('dummy-token');
    return Expect.waitForEnrollChoices().then(function() {
      router.enrollWebauthn();
      return Expect.waitForEnrollWindowsHello({
        router: router,
        beacon: new Beacon($sandbox),
        form: new Form($sandbox),
        ac: authClient,
        setNextResponse: setNextResponse,
        successSpy: successSpy,
      });
    });
  }

  function emulateNotWindows() {
    spyOn(webauthn, 'isAvailable').and.returnValue(false);
    spyOn(webauthn, 'makeCredential');
    spyOn(webauthn, 'getAssertion');
    return Q();
  }

  function emulateWindows(errorType) {
    spyOn(webauthn, 'isAvailable').and.returnValue(true);

    spyOn(webauthn, 'makeCredential').and.callFake(function() {
      const deferred = Q.defer();

      switch (errorType) {
      case 'AbortError':
        deferred.reject({
          message: 'AbortError',
        });
        break;

      case 'NotSupportedError':
        deferred.reject({
          message: 'NotSupportedError',
        });
        break;

      default:
        deferred.resolve({
          credential: { id: 'credentialId' },
          publicKey: 'publicKey',
        });
      }

      return deferred.promise;
    });

    return Q();
  }

  describe('Header & Footer', function() {
    itp('displays the correct factorBeacon', function() {
      return emulateNotWindows().then(setup).then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-windows-hello')).toBe(true);
      });
    });
    itp('has a "back" link in the footer', function() {
      return emulateNotWindows().then(setup).then(function(test) {
        Expect.isVisible(test.form.backLink());
      });
    });
  });

  describe('Enroll factor', function() {
    itp('displays error if not Windows', function() {
      return emulateNotWindows().then(setup).then(function(test) {
        expect(test.form.hasErrorHtml()).toBe(true);
        expect(test.form.submitButton().length).toBe(0);
      });
    });

    itp('does not display error if Windows', function() {
      return emulateWindows().then(setup).then(function(test) {
        expect(test.form.hasErrorHtml()).toBe(false);
        expect(test.form.submitButton().length).toBe(1);
      });
    });

    itp('subtitle changes after submitting the form', function() {
      return emulateWindows().then(setup).then(function(test) {
        test.setNextResponse(responseSuccess);
        expect(test.form.subtitleText()).toBe('Click below to enroll Windows Hello as a second form of authentication');
        expect(test.form.buttonBar().hasClass('hide')).toBe(false);

        test.form.submit();
        expect(test.form.subtitleText()).toBe('Please wait while Windows Hello is loading...');
        expect(test.form.buttonBar().hasClass('hide')).toBe(true);
      });
    });

    itp('sends enroll request after submitting the form', function() {
      return emulateWindows()
        .then(setup)
        .then(function(test) {
          test.setNextResponse(responseSuccess);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              factorType: 'webauthn',
              provider: 'FIDO',
              stateToken: 'testStateToken',
            },
          });
        });
    });

    itp('calls webauthn.makeCredential and activates the factor', function() {
      return emulateWindows()
        .then(setup)
        .then(function(test) {
          test.setNextResponse([responseMfaEnrollActivateWindowsHello, responseSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(webauthn.makeCredential).toHaveBeenCalled();
          expect(Util.numAjaxRequests()).toBe(3);
          Expect.isJsonPost(Util.getAjaxRequest(2), {
            url: 'https://foo.com/api/v1/authn/factors/factorId1234/lifecycle/activate',
            data: {
              credentialId: 'credentialId',
              publicKey: 'publicKey',
              stateToken: 'testStateToken',
              attestation: null,
            },
          });
        });
    });

    itp('does not show error if webauthn.makeCredential fails with AbortError', function() {
      return emulateWindows('AbortError')
        .then(setup)
        .then(function(test) {
          test.setNextResponse([responseMfaEnrollActivateWindowsHello, responseSuccess]);
          test.form.submit();
          expect(test.form.subtitleText()).toBe('Please wait while Windows Hello is loading...');
          return Expect.wait(function() {
            return test.form.$('.o-form-button-bar').hasClass('hide') === false;
          }, test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(2);
          expect(test.form.subtitleText()).toBe(
            'Click below to enroll Windows Hello as a second form of authentication'
          );
          expect(test.form.hasErrorHtml()).toBe(false);
        });
    });

    itp('shows error if webauthn.makeCredential fails with NotSupportedError', function() {
      return emulateWindows('NotSupportedError')
        .then(setup)
        .then(function(test) {
          test.setNextResponse([responseMfaEnrollActivateWindowsHello, responseSuccess]);
          test.form.submit();
          expect(test.form.subtitleText()).toBe('Please wait while Windows Hello is loading...');
          return Expect.wait(function() {
            return test.form.$('.o-form-button-bar').hasClass('hide') === false;
          }, test);
        })
        .then(function(test) {
          expect(Util.numAjaxRequests()).toBe(2);
          expect(test.form.subtitleText()).toBe(
            'Click below to enroll Windows Hello as a second form of authentication'
          );
          expect(test.form.hasErrorHtml()).toBe(true);
        });
    });
  });
});
