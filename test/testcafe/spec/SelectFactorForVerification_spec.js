import { RequestMock } from 'testcafe';

import SelectFactorPageObject from '../framework/page-objects/SelectFactorPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';

import xhrSelectFactors from '../../../playground/mocks/data/idp/idx/select-factor-authenticate';
import xhrFactorRequiredEmail from '../../../playground/mocks/data/idp/idx/factor-verification-email';

const selectFactorsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectFactors)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrFactorRequiredEmail);


fixture(`Select Factor for verification Form`);

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test.requestHooks(selectFactorsMock)(`should load select factor list`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Select an authentication factor');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Verify with one of the following factors.');
  await t.expect(selectFactorPage.getFactorsCount()).eql(2);

  await t.expect(selectFactorPage.getFactorLabelByIndex(0)).eql('Password Label');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-password');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(0)).eql('Select');
  await t.expect(selectFactorPage.getFactorLabelByIndex(1)).eql('Email Label');
  await t.expect(selectFactorPage.getFactorIconClassByIndex(1)).contains('mfa-okta-email');
  await t.expect(selectFactorPage.getFactorSelectButtonByIndex(1)).eql('Select');

  selectFactorPage.selectFactorByIndex(1);
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await t.expect(challengeFactorPage.getPageTitle()).eql('Verify with your email');
});

