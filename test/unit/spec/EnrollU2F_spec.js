/* eslint max-params: [2, 14] */
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import Beacon from 'helpers/dom/Beacon';
import Form from 'helpers/dom/EnrollU2FForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resEnrollActivateU2F from 'helpers/xhr/MFA_ENROLL_ACTIVATE_u2f';
import resU2F from 'helpers/xhr/MFA_ENROLL_U2F';
import resAllFactors from 'helpers/xhr/MFA_ENROLL_allFactors';
import resSuccess from 'helpers/xhr/SUCCESS';
import Q from 'q';
import $sandbox from 'sandbox';
const itp = Expect.itp;
const tick = Expect.tick;

Expect.describe('EnrollU2F', function() {
  function setup(startRouter, onlyU2F) {
    const setNextResponse = Util.mockAjax();
    const baseUrl = 'https://foo.com';
    const authClient = getAuthClient({
      authParams: { issuer: baseUrl }
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
    Util.mockRouterNavigate(router, startRouter);
    return tick()
      .then(function() {
        setNextResponse(onlyU2F ? resU2F : resAllFactors);
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function() {
        router.enrollU2F();
        return Expect.waitForEnrollU2F({
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse,
          successSpy: successSpy,
          afterErrorHandler: afterErrorHandler,
        });
      });
  }

  function mockU2f() {
    window.u2f = { register: function() {} };
  }

  function mocku2fSuccessRegistration() {
    mockU2f();
    spyOn(window.u2f, 'register').and.callFake(function(appId, registerRequests, registeredKeys, callback) {
      callback({
        registrationData: 'someRegistrationData',
        version: 'U2F_V2',
        challenge: 'NONCE',
        clientData: 'someClientData',
      });
    });
  }

  function setupU2fFails(errorCode) {
    Q.stopUnhandledRejectionTracking();
    mockU2f();
    spyOn(window.u2f, 'register').and.callFake(function(appId, registerRequests, registeredKeys, callback) {
      callback({ errorCode: errorCode });
    });

    return setup().then(function(test) {
      test.setNextResponse(resEnrollActivateU2F);
      test.form.submit();
      return tick(test);
    });
  }

  function expectError(test, errorMessage) {
    expect(window.u2f.register).toHaveBeenCalled();
    expect(test.form.hasErrors()).toBe(true);
    expect(test.form.errorBox().length).toEqual(1);
    expect(test.form.errorMessage()).toEqual(errorMessage);
    expect(test.afterErrorHandler).toHaveBeenCalledTimes(1);
    expect(test.afterErrorHandler.calls.allArgs()[0]).toEqual([
      {
        controller: 'enroll-u2f',
      },
      {
        name: 'U2F_ERROR',
        message: errorMessage,
        xhr: {
          responseJSON: {
            errorSummary: errorMessage,
          },
        },
      },
    ]);
  }

  Expect.describe('Header & Footer', function() {
    itp('displays the correct factorBeacon', function() {
      return setup().then(function(test) {
        expect(test.beacon.isFactorBeacon()).toBe(true);
        expect(test.beacon.hasClass('mfa-u2f')).toBe(true);
      });
    });
    itp('has a "back" link in the footer', function() {
      return setup().then(function(test) {
        Expect.isVisible(test.form.backLink());
      });
    });
  });

  Expect.describe('Enroll factor', function() {
    itp('shows error if browser does not support u2f', function() {
      delete window.u2f;

      return setup().then(function(test) {
        expect(test.form.errorHtml().length).toEqual(1);
        expect(test.form.errorHtml().html()).toEqual(
          'Security Key (U2F) is not supported on this browser.' +
            ' Select another factor or contact your admin for assistance.'
        );
      });
    });

    itp('shows error if browser does not support u2f and only one factor', function() {
      delete window.u2f;

      return setup(false, true).then(function(test) {
        expect(test.form.errorHtml().length).toEqual(1);
        expect(test.form.errorHtml().html()).toEqual(
          'Security Key (U2F) is not supported on this browser.' + ' Contact your admin for assistance.'
        );
      });
    });

    itp('does not show error if browser supports u2f', function() {
      mockU2f();

      return setup().then(function(test) {
        expect(test.form.errorHtml().length).toEqual(0);
      });
    });

    itp('shows instructions and a register button', function() {
      mockU2f();

      return setup().then(function(test) {
        Expect.isVisible(test.form.enrollInstructions());
        Expect.isVisible(test.form.submitButton());
      });
    });

    itp('shows a waiting spinner and devices images after submitting the form', function() {
      mocku2fSuccessRegistration();
      return setup()
        .then(function(test) {
          test.setNextResponse([resEnrollActivateU2F, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function(test) {
          Expect.isVisible(test.form.enrollWaitingText());
          Expect.isVisible(test.form.enrollDeviceImages());
          Expect.isVisible(test.form.enrollSpinningIcon());
          Expect.isNotVisible(test.form.submitButton());
        });
    });

    itp('sends enroll request after submitting the form', function() {
      mocku2fSuccessRegistration();
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateU2F, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              stateToken: 'testStateToken',
              factorType: 'u2f',
              provider: 'FIDO',
            },
          });
        });
    });

    itp('calls u2f.register and activates the factor', function() {
      mocku2fSuccessRegistration();
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse([resEnrollActivateU2F, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function() {
          expect(window.u2f.register).toHaveBeenCalled();
          expect(Util.numAjaxRequests()).toBe(2);
          Expect.isJsonPost(Util.getAjaxRequest(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/u2fFactorId/lifecycle/activate',
            data: {
              registrationData: 'someRegistrationData',
              version: 'U2F_V2',
              challenge: 'NONCE',
              clientData: 'someClientData',
              stateToken: 'testStateToken',
            },
          });
        });
    });

    itp('shows proper error if u2f.register fails with code 1', function() {
      return setupU2fFails(1).then(function(test) {
        expectError(test, 'An unknown error has occured. Try again or select another factor.');
      });
    });

    itp('shows proper error if u2f.register fails with code 2', function() {
      return setupU2fFails(2).then(function(test) {
        expectError(test, 'There was an error with the U2F request. Try again or select another factor.');
      });
    });

    itp('shows proper error if u2f.register fails with code 3', function() {
      return setupU2fFails(3).then(function(test) {
        expectError(test, 'There was an error with the U2F request. Try again or select another factor.');
      });
    });

    itp('shows proper error if u2f.register fails with code 4', function() {
      return setupU2fFails(4).then(function(test) {
        expectError(test, 'The security key is unsupported. Select another factor.');
      });
    });

    itp('shows proper error if u2f.register fails with code 5', function() {
      return setupU2fFails(5).then(function(test) {
        expectError(test, 'You have timed out of the authentication period. Please try again.');
      });
    });
  });
});
