/* eslint max-params: [2, 14] */
define([
  'okta',
  'okta/jquery',
  'q',
  '@okta/okta-auth-js/jquery',
  'helpers/mocks/Util',
  'helpers/dom/EnrollU2FForm',
  'helpers/dom/Beacon',
  'helpers/util/Expect',
  'util/BrowserFeatures',
  'sandbox',
  'LoginRouter',
  'helpers/xhr/MFA_ENROLL_allFactors',
  'helpers/xhr/MFA_ENROLL_ACTIVATE_u2f',
  'helpers/xhr/SUCCESS'
],
function (Okta,
          $,
          Q,
          OktaAuth,
          Util,
          Form,
          Beacon,
          Expect,
          BrowserFeatures,
          $sandbox,
          Router,
          resAllFactors,
          resEnrollActivateU2F,
          resSuccess) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  Expect.describe('EnrollU2F', function () {

    function setup(startRouter) {
      var setNextResponse = Util.mockAjax();
      var baseUrl = 'https://foo.com';
      var authClient = new OktaAuth({url: baseUrl});
      var successSpy = jasmine.createSpy('success');
      var router = new Router({
        el: $sandbox,
        baseUrl: baseUrl,
        authClient: authClient,
        globalSuccessFn: successSpy
      });
      Util.registerRouter(router);
      Util.mockRouterNavigate(router, startRouter);
      return tick()
      .then(function () {
        setNextResponse(resAllFactors);
        router.refreshAuthState('dummy-token');
        return Expect.waitForEnrollChoices();
      })
      .then(function () {
        router.enrollU2F();
        return Expect.waitForEnrollU2F({
          router: router,
          beacon: new Beacon($sandbox),
          form: new Form($sandbox),
          ac: authClient,
          setNextResponse: setNextResponse,
          successSpy: successSpy
        });
      });
    }

    function mockFirefox(isAvailable){
      spyOn(BrowserFeatures, 'isFirefox').and.returnValue(isAvailable);
    }

    function mockU2f(){
      window.u2f = { register: function () {} };
    }

    function mocku2fSuccessRegistration() {
      mockU2f();
      spyOn(window.u2f, 'register').and.callFake(function (appId, registerRequests, registeredKeys, callback) {
        callback({
          registrationData: 'someRegistrationData',
          version: 'U2F_V2',
          challenge: 'NONCE',
          clientData: 'someClientData'
        });
      });
    }

    function setupU2fFails(errorCode) {
      Q.stopUnhandledRejectionTracking();
      mockU2f();
      spyOn(window.u2f, 'register').and.callFake(function (appId, registerRequests, registeredKeys, callback) {
        callback({ errorCode: errorCode });
      });

      return setup().then(function (test) {
        test.setNextResponse(resEnrollActivateU2F);
        test.form.submit();
        return tick(test);
      });
    }

    function expectErrorHtml(test, errorMessage){
      expect(window.u2f.register).toHaveBeenCalled();
      expect(test.form.hasErrors()).toBe(true);
      expect(test.form.errorBox()).toHaveLength(1);
      expect(test.form.errorMessage()).toEqual(errorMessage);
    }

    Expect.describe('Header & Footer', function () {
      itp('displays the correct factorBeacon', function () {
        return setup().then(function (test) {
          expect(test.beacon.isFactorBeacon()).toBe(true);
          expect(test.beacon.hasClass('mfa-u2f')).toBe(true);
        });
      });
      itp('has a "back" link in the footer', function () {
        return setup().then(function (test) {
          Expect.isVisible(test.form.backLink());
        });
      });
    });

    Expect.describe('Enroll factor', function () {
      itp('shows error if wrong browser', function () {
        delete window.u2f;
        mockFirefox(false);

        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(1);
          expect(test.form.errorHtml().html()).toEqual('The Security Key is only supported for Chrome or ' +
            'Firefox browsers. Select another factor or contact your admin for assistance.');
        });
      });

      itp('shows error if Firefox without extension', function () {
        delete window.u2f;
        mockFirefox(true);

        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(1);
          expect(test.form.errorHtml().html()).toEqual('<a target="_blank" ' +
            'href="https://addons.mozilla.org/en-US/firefox/addon/u2f-support-add-on/">Download</a> ' +
            'and install the Firefox U2F browser extension before proceeding. You may be required to restart ' +
            'your browser after installation.');
        });
      });

      itp('does not show error if Chrome', function () {
        mockU2f();

        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(0);
        });
      });

      itp('does not show error if Firefox with extension', function () {
        mockU2f();
        mockFirefox(true);

        return setup().then(function (test) {
          expect(test.form.errorHtml()).toHaveLength(0);
        });
      });

      itp('shows instructions and a register button', function () {
        mockU2f();

        return setup().then(function (test) {
          Expect.isVisible(test.form.enrollInstructions());
          Expect.isVisible(test.form.submitButton());
        });
      });

      itp('shows a waiting spinner and devices images after submitting the form', function () {
        mocku2fSuccessRegistration();
        return setup().then(function (test) {
          test.setNextResponse([resEnrollActivateU2F, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy, test);
        })
        .then(function (test) {
          Expect.isVisible(test.form.enrollWaitingText());
          Expect.isVisible(test.form.enrollDeviceImages());
          Expect.isVisible(test.form.enrollSpinningIcon());
          Expect.isNotVisible(test.form.submitButton());
        });
      });

      itp('sends enroll request after submitting the form', function () {
        mocku2fSuccessRegistration();
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse([resEnrollActivateU2F, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://foo.com/api/v1/authn/factors',
            data: {
              stateToken: 'testStateToken',
              factorType: 'u2f',
              provider: 'FIDO'
            }
          });
        });
      });

      itp('calls u2f.register and activates the factor', function () {
        mocku2fSuccessRegistration();
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse([resEnrollActivateU2F, resSuccess]);
          test.form.submit();
          return Expect.waitForSpyCall(test.successSpy);
        })
        .then(function () {
          expect(window.u2f.register).toHaveBeenCalled();
          expect($.ajax.calls.count()).toBe(2);
          Expect.isJsonPost($.ajax.calls.argsFor(1), {
            url: 'https://test.okta.com/api/v1/authn/factors/u2fFactorId/lifecycle/activate',
            data: {
              registrationData: 'someRegistrationData',
              version: 'U2F_V2',
              challenge: 'NONCE',
              clientData: 'someClientData',
              stateToken: 'testStateToken'
            }
          });
        });
      });

      itp('shows proper error if u2f.register fails with code 1', function () {
        return setupU2fFails(1)
        .then(function (test) {
          expectErrorHtml(test, 'An unknown error has occured. Try again or select another factor.');
        });
      });

      itp('shows proper error if u2f.register fails with code 2', function () {
        return setupU2fFails(2)
        .then(function (test) {
          expectErrorHtml(test, 'There was an error with the U2F request. Try again or select another factor.');
        });
      });

      itp('shows proper error if u2f.register fails with code 3', function () {
        return setupU2fFails(3)
        .then(function (test) {
          expectErrorHtml(test, 'There was an error with the U2F request. Try again or select another factor.');
        });
      });

      itp('shows proper error if u2f.register fails with code 4', function () {
        return setupU2fFails(4)
        .then(function (test) {
          expectErrorHtml(test, 'The security key is unsupported. Select another factor.');
        });
      });

      itp('shows proper error if u2f.register fails with code 5', function () {
        return setupU2fFails(5)
        .then(function (test) {
          expectErrorHtml(test, 'You have timed out of the authentication period. Please try again.');
        });
      });
    });
  });

});
