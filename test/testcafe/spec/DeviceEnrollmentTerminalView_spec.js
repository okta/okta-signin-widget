import {ClientFunction, RequestLogger, RequestMock} from 'testcafe';
import DeviceEnrollmentTerminalPageObject from '../framework/page-objects/DeviceEnrollmentTerminalPageObject';
import IOSOdaEnrollment from '../../../playground/mocks/data/idp/idx/oda-enrollment-ios';
import AndroidOdaEnrollment from '../../../playground/mocks/data/idp/idx/oda-enrollment-android';
import MdmEnrollment from '../../../playground/mocks/data/idp/idx/mdm-enrollment';
import loginConfig from  '../../../playground/mocks/data/idp/idx/mdm-enrollment-in-login-config';

const logger = RequestLogger(/introspect/);

const iosOdaMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(IOSOdaEnrollment);
const androidOdaMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(AndroidOdaEnrollment);
const mdmMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(loginConfig);
const mdmMockConfig = RequestMock()
  .onRequestTo('http://localhost:3000/authenticators/ov-not-installed')
  .respond(loginConfig);

const rerenderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

fixture('Device enrollment terminal view for ODA and MDM');

async function setup(t) {
  const deviceEnrollmentTerminalPageObject = new DeviceEnrollmentTerminalPageObject(t);
  await deviceEnrollmentTerminalPageObject.navigateToPage();
  return deviceEnrollmentTerminalPageObject;
}

test
  .requestHooks(logger, iosOdaMock)('shows the correct content in iOS ODA terminal view', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Download Okta Verify');
    await t.expect(deviceEnrollmentTerminalPage.getBeaconClass()).contains('mfa-okta-verify');
    const content = deviceEnrollmentTerminalPage.getContentText();
    await t.expect(content).contains('To sign in using Okta Verify, you');
    await t.expect(content).contains('ll need to set up Okta Verify on this device. Download the Okta Verify app on the App Store.');
    await t.expect(content).contains('In the app, follow the instructions to add an organizational account.');
    await t.expect(content).contains('When prompted, choose Sign In, then enter the sign-in URL:');
    await t.expect(content).contains('https://idx.okta1.com');
    await t.expect(deviceEnrollmentTerminalPage.getAppStoreLink()).eql('https://apps.apple.com/us/app/okta-verify/id490179405');
    await t.expect(deviceEnrollmentTerminalPage.getAppStoreLogo()).contains('ios-app-store-logo');
  });

test
  .requestHooks(logger, androidOdaMock)('shows the correct content in Android ODA terminal view', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Download Okta Verify');
    await t.expect(deviceEnrollmentTerminalPage.getBeaconClass()).contains('mfa-okta-verify');
    const content = deviceEnrollmentTerminalPage.getContentText();
    await t.expect(content).contains('To sign in using Okta Verify, you');
    await t.expect(content).contains('ll need to set up Okta Verify on this device. Download the Okta Verify app on Google Play.');
    await t.expect(content).contains('In the app, follow the instructions to add an organizational account.');
    await t.expect(content).contains('When prompted, choose Sign In, then enter the sign-in URL:');
    await t.expect(content).contains('https://idx.okta1.com');
    await t.expect(deviceEnrollmentTerminalPage.getAppStoreLink()).eql('https://play.google.com/store/apps/details?id=com.okta.android.auth');
    await t.expect(deviceEnrollmentTerminalPage.getAppStoreLogo()).contains('android-app-store-logo');
  });

test
  .requestHooks(logger, mdmMock)('shows the correct content in MDM terminal view', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Additional setup required');
    const content = deviceEnrollmentTerminalPage.getContentText();
    await t.expect(content).contains('To access this app, your device needs to meet your organization');
    await t.expect(content).contains('s security requirements. Follow the instructions below to continue.');
    await t.expect(content).contains('Tap the Copy Link button below.');
    await t.expect(content).contains('On this device, open your browser, then paste the copied link into the address bar.');
    await t.expect(content).contains('Follow the instructions in your browser to set up Airwatch, then try accessing this app again');
    await t.expect(deviceEnrollmentTerminalPage.getCopyButtonLabel()).eql('Copy link to clipboard');
    await t.expect(deviceEnrollmentTerminalPage.getCopiedValue()).eql('https://sampleEnrollmentlink.com');
  });

test
  .requestHooks(logger, mdmMock)('shows the correct content in MDM terminal view', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await rerenderWidget({
      'helpLinks': {
        'help': 'https://google.com',
        'forgotPassword': 'https://okta.okta.com/signin/forgot-password',
        'custom': [
          {
            'text': 'What is Okta?',
            'href': 'https://acme.com/what-is-okta'
          },
          {
            'text': 'Acme Portal',
            'href': 'https://acme.com',
            'target': '_blank'
          }
        ]
      },
      'signOutLink': 'https://okta.okta.com/',
    });
  });
