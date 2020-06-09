import SelectFactorPageObject from '../framework/page-objects/SelectFactorPageObject';
import { RequestMock } from 'testcafe';
import factorEnrollOptions from '../../../playground/mocks/data/idp/idx/factor-enroll-options';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(factorEnrollOptions);

fixture(`Select Factor to enroll Form`)
  .requestHooks(mock);

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test(`should load select factor list with right text`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Set up Authenticators');
  await t.expect(selectFactorPage.getFormSubtitle()).eql(`Set up authenticators to ensure that only you have access to your account.`);
  await t.expect(selectFactorPage.hasPasswordSelectButton()).eql(true);
  await t.expect(selectFactorPage.hasPasswordIcon()).eql(true);
  await t.expect(selectFactorPage.hasEmailIcon()).eql(true);
  await t.expect(selectFactorPage.getPasswordLabel()).eql('Password Label');
  await t.expect(selectFactorPage.getEmailLabel()).eql('Email Label');
});
