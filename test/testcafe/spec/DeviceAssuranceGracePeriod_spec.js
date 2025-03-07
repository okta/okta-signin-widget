import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import success from '../../../playground/mocks/data/idp/idx/success';
import deviceAssuranceGracePeriodMultipleOptionsResponse from '../../../playground/mocks/data/idp/idx/device-assurance-grace-period-multiple-options.json';
import deviceAssuranceGracePeriodOneOptionResponse from '../../../playground/mocks/data/idp/idx/device-assurance-grace-period-one-option.json';
import deviceAssuranceAdpRemediationAppLinkFallbackSingleOptionGracePeriodResponse from '../../../playground/mocks/data/idp/idx/end-user-remediation-adp-remediation-app-link-fallback-single-option-with-grace-period.json';
import deviceAssuranceAdpRemediationMessageFallbackMultipleOptionsGracePeriodResponse from '../../../playground/mocks/data/idp/idx/end-user-remediation-adp-remediation-message-fallback-multiple-options-with-grace-period.json';
import { oktaDashboardContent } from '../framework/shared';
import DeviceAssuranceGracePeriodPageObject from '../framework/page-objects/DeviceAssuranceGracePeriodPageObject';
import TimeUtil from '../../../src/util/TimeUtil';

const multipleOptionsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceGracePeriodMultipleOptionsResponse)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const oneOptionMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceGracePeriodOneOptionResponse);

const oktaVerifyAppContent = `
  <h1>Okta Verify Landing Page</h1>
`;

const ovAppLogger = RequestLogger(/okta-verify.html/);
const loopbackServerLogger = RequestLogger(/probe|remediation/,
  { logRequestBody: true, stringifyRequestBody: true });
const singleOptionAdpGracePeriodRemediationSuccessfulLoopbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationAppLinkFallbackSingleOptionGracePeriodResponse)
  .onRequestTo(/6511|6512|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/remediation/)
  .respond(null, 200, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

const singleOptionAdpGracePeriodRemediationAppLinkFallbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationAppLinkFallbackSingleOptionGracePeriodResponse)
  .onRequestTo(/6511|6512|2000|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

const multipleOptionsRemediationMessageFallbackMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceAssuranceAdpRemediationMessageFallbackMultipleOptionsGracePeriodResponse)
  .onRequestTo(/6511|6512|2000|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/okta-verify.\/html/)
  .respond(oktaVerifyAppContent);

fixture('Device Assurance Grace Period Form');

async function setup(t) {
  const deviceAssuranceGracePeriodPage = new DeviceAssuranceGracePeriodPageObject(t);
  await deviceAssuranceGracePeriodPage.navigateToPage();
  await t.expect(deviceAssuranceGracePeriodPage.formExists()).ok();
  return deviceAssuranceGracePeriodPage;
}

test.requestHooks(multipleOptionsMock)('should render correct messaging and navigate to dashboard after clicking continue button for grace period with multiple options', async t => {
  const deviceAssuranceGracePeriodPage = await setup(t);
  const expiryLocaleString = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00.000Z'), 'en');
  await checkA11y(t);

  await t.expect(deviceAssuranceGracePeriodPage.form.getNthTitle(0)).eql('Device assurance reminder');
  const warningBox = deviceAssuranceGracePeriodPage.getWarningBox();
  await t.expect(warningBox.visible).ok();
  

  await t.expect(deviceAssuranceGracePeriodPage.hasText(`Your device doesn't meet the security requirements. Fix the issue by ${expiryLocaleString} to prevent lockout.`)).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.getOptionHeading(0)).eql('Option 1:');
  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-biometric-lock').withExactText('Enable lock screen and biometrics').exists).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.getOptionHeading(1)).eql('Option 2:');
  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-disk-encrypted').withExactText('Encrypt your device').exists).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/help').withExactText('the help page').exists).eql(true);
  await t.expect(deviceAssuranceGracePeriodPage.form.getAnchorsWithBlankTargetsWithoutRelevantAttributes().exists).eql(false);
  
  await deviceAssuranceGracePeriodPage.clickContinueToAppButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(oneOptionMock)('should render correct messaging for grace period with one option', async t => {
  const deviceAssuranceGracePeriodPage = await setup(t);
  const expiryLocaleString = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00.000Z'), 'en');
  await checkA11y(t);

  await t.expect(deviceAssuranceGracePeriodPage.form.getNthTitle(0)).eql('Device assurance reminder');
  const warningBox = deviceAssuranceGracePeriodPage.getWarningBox();
  await t.expect(warningBox.visible).ok();

  await t.expect(deviceAssuranceGracePeriodPage.hasText(`Your device doesn't meet the security requirements. Fix the issue by ${expiryLocaleString} to prevent lockout.`)).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-biometric-lock').withExactText('Enable lock screen and biometrics').exists).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/help').withExactText('the help page').exists).eql(true);
  await t.expect(deviceAssuranceGracePeriodPage.form.getAnchorsWithBlankTargetsWithoutRelevantAttributes().exists).eql(false);
});

test.requestHooks(loopbackServerLogger, singleOptionAdpGracePeriodRemediationSuccessfulLoopbackMock)('should render AZT ADP install end user remediation error message inside grace period callout and on click should trigger successful loopback to remediate', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const deviceAssuranceGracePeriodPage = await setup(t);
  const expiryLocaleString = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00.000Z'), 'en');
  await checkA11y(t);

  await t.expect(deviceAssuranceGracePeriodPage.form.getNthTitle(0)).eql('Device assurance reminder');
  const warningBox = deviceAssuranceGracePeriodPage.getWarningBox();
  await t.expect(warningBox.visible).ok();

  await t.expect(deviceAssuranceGracePeriodPage.hasText(`Your device doesn't meet the security requirements. Fix the issue by ${expiryLocaleString} to prevent lockout.`)).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.form.getErrorBoxAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(await deviceAssuranceGracePeriodPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);

  await deviceAssuranceGracePeriodPage.clickADPInstallRememdiationLink();
  
  // Assert loopback request was successful
  await t.expect(loopbackServerLogger.contains(
    record => record.response.statusCode === 200 &&
      record.request.method === 'get' &&
      record.request.url.match(/remediation/)
  )).eql(true);
});

test.requestHooks(loopbackServerLogger, ovAppLogger, singleOptionAdpGracePeriodRemediationAppLinkFallbackMock)('should render AZT ADP install end user remediation error message inside grace period callout and on click should trigger unsuccessful loopback requests and fallback to App link redirect', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const deviceAssuranceGracePeriodPage = await setup(t);
  const expiryLocaleString = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00.000Z'), 'en');
  await checkA11y(t);

  await t.expect(deviceAssuranceGracePeriodPage.form.getNthTitle(0)).eql('Device assurance reminder');
  const warningBox = deviceAssuranceGracePeriodPage.getWarningBox();
  await t.expect(warningBox.visible).ok();

  await t.expect(deviceAssuranceGracePeriodPage.hasText(`Your device doesn't meet the security requirements. Fix the issue by ${expiryLocaleString} to prevent lockout.`)).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.form.getErrorBoxAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(await deviceAssuranceGracePeriodPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);

  await deviceAssuranceGracePeriodPage.clickADPInstallRememdiationLink();
  
  // Assert probing failed
  await t.expect(loopbackServerLogger.count(
    record => record.response.statusCode === 500 &&
      record.request.url.match(/probe/)
  )).eql(4);

  // Verify we have been redirected
  await t.expect(ovAppLogger.count(
    record => record.response.statusCode === 200
      && record.request.url.match(/okta-verify.html/) // redirect to OV App link
  )).eql(1);
});

test.requestHooks(loopbackServerLogger, ovAppLogger, multipleOptionsRemediationMessageFallbackMock)('should render AZT ADP install end user remediation error message inside grace period callout with multiple remediation options and on click should trigger unsuccessful loopback requests and fallback to an updated message', async t => {
  ovAppLogger.clear();
  loopbackServerLogger.clear();

  const deviceAssuranceGracePeriodPage = await setup(t);
  const expiryLocaleString = TimeUtil.formatDateToDeviceAssuranceGracePeriodExpiryLocaleString(new Date('2024-09-05T00:00:00.000Z'), 'en');
  await checkA11y(t);

  await t.expect(deviceAssuranceGracePeriodPage.form.getNthTitle(0)).eql('Device assurance reminder');
  const warningBox = deviceAssuranceGracePeriodPage.getWarningBox();
  await t.expect(warningBox.visible).ok();
  

  await t.expect(deviceAssuranceGracePeriodPage.hasText(`Your device doesn't meet the security requirements. Fix the issue by ${expiryLocaleString} to prevent lockout.`)).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.getOptionHeading(0)).eql('Option 1:');
  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-biometric-lock').withExactText('Enable lock screen and biometrics').exists).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.getOptionHeading(1)).eql('Option 2:');
  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(await deviceAssuranceGracePeriodPage.adpInstallRemediationLinkExists()).eql(true);

  await t.expect(deviceAssuranceGracePeriodPage.getAnchor('https://okta.com/help').withExactText('the help page').exists).eql(true);

  await deviceAssuranceGracePeriodPage.clickADPInstallRememdiationLink();
  
  // Assert probing failed
  await t.expect(loopbackServerLogger.count(
    record => record.response.statusCode === 500 &&
      record.request.url.match(/probe/)
  )).eql(4);

  // Assert remediation message has updated text
  await t.expect(await deviceAssuranceGracePeriodPage.adpOVInstallInstructionsMessageExists()).eql(true);
});
