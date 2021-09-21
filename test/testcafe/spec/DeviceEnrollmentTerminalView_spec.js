import {RequestLogger, RequestMock} from 'testcafe';
import { renderWidget as rerenderWidget } from '../framework/shared';
import DeviceEnrollmentTerminalPageObject from '../framework/page-objects/DeviceEnrollmentTerminalPageObject';
import IOSOdaEnrollment from '../../../playground/mocks/data/idp/idx/oda-enrollment-ios';
import AndroidOdaEnrollmentLoopback from '../../../playground/mocks/data/idp/idx/oda-enrollment-android';
import MdmEnrollment from '../../../playground/mocks/data/idp/idx/mdm-enrollment';

const logger = RequestLogger(/introspect/);

const iosOdaMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(IOSOdaEnrollment);
const androidOdaLoopbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(AndroidOdaEnrollmentLoopback);
const mdmMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(MdmEnrollment);

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
    await t.expect(content).contains('To sign in using Okta Verify, you will need to set up');
    await t.expect(content).contains('Okta Verify on this device.');
    await t.expect(content).contains('Tap the Copy Link button below.');
    await t.expect(deviceEnrollmentTerminalPage.getCopyButtonLabel()).eql('Copy link to clipboard');
    await t.expect(deviceEnrollmentTerminalPage.getCopiedValue()).eql('https://apps.apple.com/us/app/okta-verify/id490179405');
    await t.expect(content).contains('On this device, open your browser, then paste the copied link into the address bar.');
    await t.expect(content).contains('Download the Okta Verify app.');
    await t.expect(content).contains('Open Okta Verify and follow the steps to add your account.');
    await t.expect(content).contains('When prompted, choose Sign In, then enter the sign-in URL:');
    await t.expect(content).contains('https://idx.okta1.com');
    await t.expect(deviceEnrollmentTerminalPage.getCopyOrgLinkButtonLabel()).eql('Copy sign-in URL to clipboard');
    await t.expect(content).contains('Finish setting up your account in Okta Verify, then try accessing this app again.');
  });

test
  .requestHooks(logger, androidOdaLoopbackMock)('shows the correct content in Android ODA Loopback terminal view', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Download Okta Verify');
    await t.expect(deviceEnrollmentTerminalPage.getBeaconClass()).contains('mfa-okta-verify');
    const content = deviceEnrollmentTerminalPage.getContentText();
    await t.expect(content).contains('To sign in using Okta Verify, you will need to set up');
    await t.expect(content).contains('On Google Play, download the Okta Verify app.');
    await t.expect(content).contains('Open Okta Verify and follow the steps to add your account.');
    await t.expect(content).contains('When prompted, choose Sign In, then enter the sign-in URL:');
    await t.expect(content).contains('https://idx.okta1.com');
    await t.expect(deviceEnrollmentTerminalPage.getCopyOrgLinkButtonLabel()).eql('Copy sign-in URL to clipboard');
    await t.expect(content).contains('Finish setting up your account in Okta Verify, then try accessing this app again.');
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

// Below two tests are covering special use cases in ODA Universal Link/App Link flow
// When the user clicks on the button, if Okta Verify is not installed it will be redirected to /authenticators/ov-not-installed
// And the endpoint will return a new SIW with proxyIdxResponse in config
// These tests are testing SIW can directly render terminal page when receiving such proxyIdxResponse instead of making introspect call
// The mocks and device enrollment values are intentionally set differently from above tests to make sure the we properly consume SIW config
test
  .requestHooks()('shows the correct content in iOS ODA terminal view when Okta Verify is not installed in Universal Link flow', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await rerenderWidget({
      'proxyIdxResponse': {
        'deviceEnrollment': {
          'type': 'object',
          'value': {
            'name': 'oda',
            'platform': 'IOS',
            'enrollmentLink': '',
            'vendor': '',
            'signInUrl': 'https://rain.okta1.com'
          }
        }
      }
    });
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Download Okta Verify');
    await t.expect(deviceEnrollmentTerminalPage.getBeaconClass()).contains('mfa-okta-verify');
    const content = deviceEnrollmentTerminalPage.getContentText();
    await t.expect(content).contains('To sign in using Okta Verify, you will need to set up');
    await t.expect(content).contains('Okta Verify on this device.');
    await t.expect(content).contains('Tap the Copy Link button below.');
    await t.expect(deviceEnrollmentTerminalPage.getCopyButtonLabel()).eql('Copy link to clipboard');
    await t.expect(deviceEnrollmentTerminalPage.getCopiedValue()).eql('https://apps.apple.com/us/app/okta-verify/id490179405');
    await t.expect(content).contains('On this device, open your browser, then paste the copied link into the address bar.');
    await t.expect(content).contains('Download the Okta Verify app.');
    await t.expect(content).contains('Open Okta Verify and follow the steps to add your account.');
    await t.expect(content).contains('When prompted, choose Sign In, then enter the sign-in URL:');
    await t.expect(content).contains('https://rain.okta1.com');
    await t.expect(deviceEnrollmentTerminalPage.getCopyOrgLinkButtonLabel()).eql('Copy sign-in URL to clipboard');
    await t.expect(content).contains('Finish setting up your account in Okta Verify, then try accessing this app again.');
  });

test
  .requestHooks()('shows the correct content in iOS MDM terminal view when Okta Verify is not set up in Universal Link flow', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await rerenderWidget({
      'proxyIdxResponse': {
        'deviceEnrollment': {
          'type': 'object',
          'value': {
            'name': 'mdm',
            'platform': 'IOS',
            'enrollmentLink': 'https://anotherSampleEnrollmentlink.com',
            'vendor': 'MobileIron',
            'signInUrl': ''
          }
        }
      }
    });
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Additional setup required');
    const content = deviceEnrollmentTerminalPage.getContentText();
    await t.expect(content).contains('To access this app, your device needs to meet your organization');
    await t.expect(content).contains('s security requirements. Follow the instructions below to continue.');
    await t.expect(content).contains('Tap the Copy Link button below.');
    await t.expect(content).contains('On this device, open your browser, then paste the copied link into the address bar.');
    await t.expect(content).contains('Follow the instructions in your browser to set up MobileIron, then try accessing this app again');
    await t.expect(deviceEnrollmentTerminalPage.getCopyButtonLabel()).eql('Copy link to clipboard');
    await t.expect(deviceEnrollmentTerminalPage.getCopiedValue()).eql('https://anotherSampleEnrollmentlink.com');
  });

test
  .requestHooks()('shows the correct content in Android ODA terminal view', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await rerenderWidget({
      'proxyIdxResponse': {
        'deviceEnrollment': {
          'type': 'object',
          'value': {
            'name': 'oda',
            'platform': 'ANDROID',
            'enrollmentLink': '',
            'vendor': '',
            'signInUrl': 'https://rain.okta1.com',
            'challengeMethod': 'APP_LINK',
            'orgName': 'testOrg'
          }
        }
      }
    });
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Additional setup required to use Okta FastPass');
    await t.expect(deviceEnrollmentTerminalPage.getBeaconClass()).contains('mfa-okta-verify');
    const content = deviceEnrollmentTerminalPage.getContentText();
    await t.expect(content).contains('On this device, do you already have an Okta Verify account for testOrg?');
    await t.expect(content).contains('No, I don’t have an account');
    await t.expect(content).contains('Yes, I already have an account');
    await t.expect(deviceEnrollmentTerminalPage.getBackLink().exists).eql(false);

    // switch to the next page when OV account is not setup
    await deviceEnrollmentTerminalPage.clickWithoutOVAccount();
    await deviceEnrollmentTerminalPage.clickNextButton();
    await t.expect(deviceEnrollmentTerminalPage.getBackLink().exists).eql(true);

    // go back then switch to the next page when OV account is setup
    await deviceEnrollmentTerminalPage.clickBackLink();
    await t.expect(deviceEnrollmentTerminalPage.getBackLink().exists).eql(false);
    await deviceEnrollmentTerminalPage.clickWithOVAccount();
    await deviceEnrollmentTerminalPage.clickNextButton();
    await t.expect(deviceEnrollmentTerminalPage.getBackLink().exists).eql(true);

    await deviceEnrollmentTerminalPage.clickBackLink();
    await t.expect(deviceEnrollmentTerminalPage.getBackLink().exists).eql(false);
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Additional setup required to use Okta FastPass');
  });

test
  .requestHooks()('shows the correct content in Android ODA terminal view when Okta Verify is not installed in App Link flow', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await rerenderWidget({
      'proxyIdxResponse': {
        'deviceEnrollment': {
          'type': 'object',
          'value': {
            'name': 'oda',
            'platform': 'ANDROID',
            'enrollmentLink': '',
            'vendor': '',
            'signInUrl': 'https://rain.okta1.com',
            'challengeMethod': 'APP_LINK',
            'orgName': 'testOrg'
          }
        }
      }
    });
    // switch to the next page when OV account is not setup
    await deviceEnrollmentTerminalPage.clickWithoutOVAccount();
    await deviceEnrollmentTerminalPage.clickNextButton();
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Set up an Okta Verify account');
    await t.expect(deviceEnrollmentTerminalPage.getSubHeader()).eql('To sign in with Okta FastPass, you’ll need to set up Okta Verify on this device.');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(1)).contains('If you don’t have Okta Verify installed,');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(1)).contains('download the app.');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(2)).eql('Open Okta Verify and follow the steps to add your account.');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(3)).contains('When prompted, choose Sign In, then enter the sign-in URL:');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(3)).contains('https://rain.okta1.com');
    await t.expect(deviceEnrollmentTerminalPage.getCopyOrgLinkButtonLabel()).eql('Copy sign-in URL to clipboard');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(4)).eql('Finish setting up your account in Okta Verify, then try signing in again.');
    await t.expect(deviceEnrollmentTerminalPage.getBackLink().exists).eql(true);
    await t.expect(deviceEnrollmentTerminalPage.getBackLinkText()).eql('Back');
  });

test
  .requestHooks()('shows the correct content in Android ODA terminal view when Okta Verify is installed in App Link flow', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await rerenderWidget({
      'proxyIdxResponse': {
        'deviceEnrollment': {
          'type': 'object',
          'value': {
            'name': 'oda',
            'platform': 'ANDROID',
            'enrollmentLink': '',
            'vendor': '',
            'signInUrl': 'https://rain.okta1.com',
            'challengeMethod': 'APP_LINK',
            'orgName': 'testOrg'
          }
        }
      }
    });
    // go back then switch to the next page when OV account is setup
    await deviceEnrollmentTerminalPage.clickWithOVAccount();
    await deviceEnrollmentTerminalPage.clickNextButton();
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Additional setup required to use Okta FastPass');
    await t.expect(deviceEnrollmentTerminalPage.getSubHeader()).eql('Okta FastPass is a security method that can sign you in without needing your username.');
    await t.expect(deviceEnrollmentTerminalPage.getTextContent('.subtitle ')).eql('Already have Okta FastPass enabled for your account?');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(1)).eql('On this device, open the Okta Verify app.');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(2)).eql('On the list of accounts, tap your account for https://rain.okta1.com.');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(3)).eql('Under the “Okta FastPass” section, tap Setup, then follow the instructions.');
    await t.expect(deviceEnrollmentTerminalPage.getContentByIndex(4)).eql('After your setup is complete, return here to try signing in again.');
    await t.expect(deviceEnrollmentTerminalPage.getBackLink().exists).eql(true);
    await t.expect(deviceEnrollmentTerminalPage.getBackLinkText()).eql('Back');
  });

test
  .requestHooks()('shows the correct content in ANDROID MDM terminal view when Okta Verify is not installed in App Link flow', async t => {
    const deviceEnrollmentTerminalPage = await setup(t);
    await rerenderWidget({
      'proxyIdxResponse': {
        'deviceEnrollment': {
          'type': 'object',
          'value': {
            'name': 'mdm',
            'platform': 'ANDROID',
            'enrollmentLink': 'https://anotherSampleEnrollmentlink.com',
            'vendor': 'MobileIron',
            'signInUrl': '',
            'challengeMethod': 'APP_LINK',
          }
        }
      }
    });
    await t.expect(deviceEnrollmentTerminalPage.getHeader()).eql('Additional setup required');
    const content = deviceEnrollmentTerminalPage.getContentText();
    await t.expect(content).contains('To access this app, your device needs to meet your organization');
    await t.expect(content).contains('s security requirements. Follow the instructions below to continue.');
    await t.expect(content).contains('Tap the Copy Link button below.');
    await t.expect(content).contains('On this device, open your browser, then paste the copied link into the address bar.');
    await t.expect(content).contains('Follow the instructions in your browser to set up MobileIron, then try accessing this app again');
    await t.expect(deviceEnrollmentTerminalPage.getCopyButtonLabel()).eql('Copy link to clipboard');
    await t.expect(deviceEnrollmentTerminalPage.getCopiedValue()).eql('https://anotherSampleEnrollmentlink.com');
  });
