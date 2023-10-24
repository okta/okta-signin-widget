import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import MFAVerifyPageObject from '../../framework/page-objects-v1/MFAVerifyPageObject';
import PrimaryAuthPageObject from '../../framework/page-objects-v1/PrimaryAuthPageObject';
import authnMfaAllFactorsResponse from '../../../../playground/mocks/data/api/v1/authn/mfa-all-factors';

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const authNMfaAllFactorsMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authnMfaAllFactorsResponse);

fixture('MFA Verify Form');

const logger = RequestLogger(
  /api\/v1/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logResponseBody: true,
  }
);

async function setup(t) {
  const config = {
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      router: true,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  };
  const primaryAuthPage = new PrimaryAuthPageObject(t);
  await primaryAuthPage.navigateToPage({ render: false });

  await renderWidget(config);
  await t.expect(primaryAuthPage.formExists()).eql(true);
  return primaryAuthPage;
}

test.requestHooks(logger, authNMfaAllFactorsMock)('should set aria-expanded when factors dropDown link is clicked', async (t) => {
  const primaryAuthForm = await setup(t);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'administrator@okta1.com');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  await primaryAuthForm.clickNextButton('Sign In');

  const mfaVerifyForm = new MFAVerifyPageObject(t);
  await t.expect(mfaVerifyForm.getBeaconContainer().exists).ok();
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().exists).ok();
  await t.expect(mfaVerifyForm.getFormTitle()).eql('Security Question');
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().getAttribute('aria-expanded')).eql('false');
  await mfaVerifyForm.clickFactorsDropdown();
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().getAttribute('aria-expanded')).eql('true');

});

test.requestHooks(logger, authNMfaAllFactorsMock)('should set aria-expanded when beacon is clicked', async (t) => {
  const primaryAuthForm = await setup(t);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'administrator@okta1.com');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  await primaryAuthForm.clickNextButton('Sign In');

  const mfaVerifyForm = new MFAVerifyPageObject(t);
  await t.expect(mfaVerifyForm.getBeaconContainer().exists).ok();
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().exists).ok();
  await t.expect(mfaVerifyForm.getFormTitle()).eql('Security Question');
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().getAttribute('aria-expanded')).eql('false');
  await mfaVerifyForm.clickBeacon();
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().getAttribute('aria-expanded')).eql('true');
});

test.requestHooks(logger, authNMfaAllFactorsMock)('should keep aria-expanded as false when anywhere outside of the dropdown is clicked', async (t) => {
  const primaryAuthForm = await setup(t);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'administrator@okta1.com');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  await primaryAuthForm.clickNextButton('Sign In');

  const mfaVerifyForm = new MFAVerifyPageObject(t);
  await t.expect(mfaVerifyForm.getBeaconContainer().exists).ok();
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().exists).ok();
  await t.expect(mfaVerifyForm.getFormTitle()).eql('Security Question');
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().getAttribute('aria-expanded')).eql('false');
  await mfaVerifyForm.clickBeacon();
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().getAttribute('aria-expanded')).eql('true');
  // Click anywhere outside fo the dropdown element (to ensure it is closed)
  await t.click('h1');
  await t.expect(mfaVerifyForm.getFactorsDropdownLink().getAttribute('aria-expanded')).eql('false');
});
