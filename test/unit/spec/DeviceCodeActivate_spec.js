import { _ } from 'okta';
import createAuthClient from 'widget/createAuthClient';
import Router from 'LoginRouter';
import DeviceCodeActivateForm from 'helpers/dom/DeviceCodeActivateForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resDeviceCodeActivate from 'helpers/xhr/DEVICE_CODE_ACTIVATE';
import resDeviceCodeActivateError from 'helpers/xhr/DEVICE_CODE_ACTIVATE_invalidCode';
import resDeviceCodeActivated from 'helpers/xhr/DEVICE_CODE_TERMINAL_activated';
import resDeviceCodeActivateInvalidCode from 'helpers/xhr/DEVICE_CODE_TERMINAL_invalidCode';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;
const fitp = Expect.fitp;

function setup(settings, res) {
  settings || (settings = {});
  const successSpy = jasmine.createSpy('successSpy');
  const setNextResponse = Util.mockAjax();
  const baseUrl = window.location.origin;
  const logoUrl = '/img/logos/default.png';
  const authClient = createAuthClient({ issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR });
  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        logo: logoUrl,
        authClient: authClient,
        globalSuccessFn: successSpy,
      },
      settings
    )
  );

  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  Util.mockJqueryCss();
  setNextResponse(res || resDeviceCodeActivate);
  router.refreshAuthState('dummy-token');
  settings = {
    router: router,
    successSpy: successSpy,
    form: new DeviceCodeActivateForm($sandbox),
    ac: authClient,
    setNextResponse: setNextResponse,
  };
  return Expect.waitForDeviceCodeActivate(settings);
}

Expect.describe('DeviceCodeActivate', function() {
  describe('DeviceCodeActivateForm', function() {
    itp('has the correct title', function() {
      return setup().then(function(test) {
        expect(test.form.titleText()).toBe('Activate your device');
      });
    });
    itp('has the correct subtitle', function() {
      return setup().then(function(test) {
        expect(test.form.subtitleText()).toBe(
          'Follow the instructions on your device to get an activation code'
        );
      });
    });
    itp('has the correct input label', function() {
      return setup().then(function(test) {
        expect(test.form.userCodeLabel().trimmedText()).toBe('Activation Code');
      });
    });
    itp('has the correct input field', function() {
      return setup().then(function(test) {
        expect(test.form.userCodeField().attr('name')).toBe('userCode');
      });
    });
    fitp('next button click makes the correct post', function() {
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resDeviceCodeActivated);
          test.form.setUserCode('ABCD-WXYZ');
          test.form.nextButton().click();
          return Expect.waitForAjaxRequest();
        })
        .then(function() {
          expect(Util.numAjaxRequests()).toBe(1);
          Expect.isJsonPost(Util.lastAjaxRequest(), {
            url: 'http://localhost:3000/api/v1/authn/device/activate',
            data: {
              userCode: 'ABCD-WXYZ',
              stateToken: '00-dummy-state-token',
            },
          });
        });
    });
    itp('next button click with invalid code shows error', function() {
      return setup()
        .then(function(test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resDeviceCodeActivateInvalidCode);
          test.form.setUserCode('BAD-CODE');
          test.form.nextButton().click();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Invalid code. Try again.');
        });
    });
    itp('next button click with empty code shows inline error', function() {
      return setup()
        .then(function(test) {
          test.form.nextButton().click();
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.userCodeErrorField().trimmedText()).toBe('This field cannot be left blank');
        });
    });
    itp('add hyphen after 4th character on input', function() {
      return setup()
        .then(function(test) {
          test.form.setUserCodeAndTriggerKeyup('BADD');
          expect(test.form.userCodeField().val()).toBe('BADD-');
        });
    });
    itp('url with invalid user code shows error', function() {
      return setup(undefined, resDeviceCodeActivateError)
        .then(function(test) {
          Util.resetAjaxRequests();
          return Expect.waitForFormError(test.form, test);
        })
        .then(function(test) {
          expect(test.form.hasErrors()).toBe(true);
          expect(test.form.errorMessage()).toBe('Invalid code. Try again.');
        });
    });
  });
});
