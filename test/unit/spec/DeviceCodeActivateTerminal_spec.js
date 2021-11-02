import { _ } from 'okta';
import getAuthClient from 'widget/getAuthClient';
import Router from 'LoginRouter';
import DeviceCodeActivateTerminalForm from 'helpers/dom/DeviceCodeActivateTerminalForm';
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import resDeviceCodeActivated from 'helpers/xhr/DEVICE_CODE_TERMINAL_activated';
import resDeviceCodeNotActivated from 'helpers/xhr/DEVICE_CODE_TERMINAL_notActivated';
import resDeviceCodeConsentDenied from 'helpers/xhr/DEVICE_CODE_TERMINAL_consentDenied';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';
const itp = Expect.itp;

function setup(res) {
  let settings = {};
  const successSpy = jasmine.createSpy('successSpy');
  const setNextResponse = Util.mockAjax();
  const baseUrl = window.location.origin;
  const logoUrl = '/img/logos/default.png';
  const authClient = getAuthClient({
    authParams: { issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR }
  });
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
  setNextResponse(res);
  router.refreshAuthState('dummy-token');
  settings = {
    router: router,
    successSpy: successSpy,
    form: new DeviceCodeActivateTerminalForm($sandbox),
    ac: authClient,
    setNextResponse: setNextResponse,
  };
  return Expect.waitForDeviceCodeTerminal(settings);
}

function assertDeviceNotActivatedPage(test, subtitle) {
  expect(test.form.titleText()).toBe('Device not activated');
  expect(test.form.subtitleText()).toBe(subtitle);
  expect(test.form.isTerminalErrorIconPresent()).toBe(true);
  expect(test.form.isBeaconTerminalPresent()).toBe(false);
  expect(test.form.isTryAgainButtonPresent()).toBe(true);
  expect(test.form.tryAgainButton().attr('href')).toBe('/activate');
}

Expect.describe('DeviceCodeActivateTerminal', function() {
  describe('DeviceCodeActivateTerminalForm', function() {
    itp('renders correctly when device is activated', function() {
      return setup(resDeviceCodeActivated).then(function(test) {
        expect(test.form.titleText()).toBe('Device activated');
        expect(test.form.subtitleText()).toBe('Follow the instructions on your device for next steps');
        expect(test.form.isTerminalSuccessIconPresent()).toBe(true);
        expect(test.form.isBeaconTerminalPresent()).toBe(false);
        expect(test.form.isTryAgainButtonPresent()).toBe(false);
      });
    });
    itp('renders correctly when device is not activated', function() {
      return setup(resDeviceCodeNotActivated).then(function(test) {
        assertDeviceNotActivatedPage(test, 'Your device cannot be activated because of an internal error');
      });
    });
    itp('renders correctly when consent is denied', function() {
      return setup(resDeviceCodeConsentDenied).then(function(test) {
        assertDeviceNotActivatedPage(test, 'Your device cannot be activated because you did not allow access');
      });
    });
  });
});
