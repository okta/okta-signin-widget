import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import success from '../../../playground/mocks/data/idp/idx/success';
import deviceAssuranceGracePeriodMultipleOptionsResponse from '../../../playground/mocks/data/idp/idx/device-assurance-grace-period-multiple-options.json';
import deviceAssuranceGracePeriodOneOptionResponse from '../../../playground/mocks/data/idp/idx/device-assurance-grace-period-one-option.json';
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
