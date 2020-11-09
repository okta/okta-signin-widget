import { _ } from 'okta';
import createAuthClient from 'widget/createAuthClient';
import Router from 'v2/WidgetRouter';
import Form from 'helpers/dom/v2/DeviceEnrollmentTerminalViewForm'
import Util from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import $sandbox from 'sandbox';
import LoginUtil from 'util/Util';

const itp = Expect.itp;

function setup (deviceEnrollmentType) {
  const successSpy = jasmine.createSpy('successSpy');
  const baseUrl = window.location.origin;
  const authClient = createAuthClient({
    issuer: baseUrl,
    transformErrorXHR: LoginUtil.transformErrorXHR,
  });

  let deviceEnrollmentValue;
  if (deviceEnrollmentType === 'mdm') {
    deviceEnrollmentValue = {
      name: 'mdm',
      platform: 'IOS',
      vendor: 'Airwatch',
      enrollmentLink: 'https://sampleEnrollmentlink.com'
    };
  } else {
    deviceEnrollmentValue = {
      name: 'oda',
      platform: 'IOS',
      signInUrl: 'https://localhost:3000'
    };
  }

  const router = new Router(
    _.extend(
      {
        el: $sandbox,
        baseUrl: baseUrl,
        stateToken: 'aStateToken',
        authClient: authClient,
        globalSuccessFn: successSpy,
        deviceEnrollment: deviceEnrollmentValue,
      },
    )
  );
  Util.registerRouter(router);
  Util.mockRouterNavigate(router);
  router.deviceEnrollmentTerminalView();

  const settings = {
    router: router,
    successSpy: successSpy,
    form: new Form($sandbox),
  };
  return Expect.waitForDeviceEnrollmentTerminal(settings);
}

Expect.describe('shows the correct content in iOS terminal view when OV is not installed in ODA Universal Link flow', function () {
  itp('shows the correct content in iOS MDM terminal view', function () {
    return setup('mdm').then(function (test) {
      const content = test.form.getContentText();
      expect(test.form.titleText()).toBe('Additional setup required');
      expect(content).toContain('To access this app, your device needs to meet your organization');
      expect(content).toContain('s security requirements. Follow the instructions below to continue.');
      expect(content).toContain('Tap the Copy Link button below.');
      expect(content).toContain('On this device, open your browser, then paste the copied link into the address bar.');
      expect(content).toContain('Follow the instructions in your browser to set up Airwatch, then try accessing this app again');
      expect(test.form.getCopyButtonLabel()).toBe('Copy link to clipboard');
      expect(test.form.getCopiedValue()).toBe('https://sampleEnrollmentlink.com');
    });
  });

  itp('shows the correct content in iOS ODA terminal view', function () {
    return setup('oda').then(function (test) {
      const content = test.form.getContentText();
      expect(test.form.getBeaconClass()).toContain('mfa-okta-verify');
      expect(test.form.titleText()).toBe('Download Okta Verify');
      expect(content).toContain('To sign in using Okta Verify, you');
      expect(content).toContain('ll need to set up Okta Verify on this device. Download the Okta Verify app on the App Store.');
      expect(content).toContain('In the app, follow the instructions to add an organizational account.');
      expect(content).toContain('When prompted, choose Sign In, then enter the sign-in URL:');
      expect(content).toContain('https://idx.okta1.com');
      expect(test.form.getAppStoreLink()).toBe('https://apps.apple.com/us/app/okta-verify/id490179405');
      expect(test.form.getAppStoreLogo()).toBe('ios-app-store-logo');
    });
  });
});