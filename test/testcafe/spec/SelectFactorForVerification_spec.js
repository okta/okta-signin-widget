import SelectFactorPageObject from '../framework/page-objects/SelectFactorPageObject';
import { RequestMock } from 'testcafe';
import selectFactorAuthenticate from '../../../playground/mocks/idp/idx/data/select-factor-authenticate';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(selectFactorAuthenticate);

fixture(`Select Factor for verification Form`)
  .requestHooks(mock);

async function setup(t) {
  const selectFactorPageObject = new SelectFactorPageObject(t);
  await selectFactorPageObject.navigateToPage();
  return selectFactorPageObject;
}

test(`should load select factor list`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.getFormTitle()).eql('Select an authentication factor');
  await t.expect(selectFactorPage.getFormSubtitle()).eql('Verify with one of the following factors.');
  await t.expect(selectFactorPage.hasPasswordSelectButton()).eql(true);
  await t.expect(selectFactorPage.hasPasswordIcon()).eql(true);
  await t.expect(selectFactorPage.hasEmailIcon()).eql(true);
  await t.expect(selectFactorPage.getPasswordLabel()).eql('Password Label');
  await t.expect(selectFactorPage.getEmailLabel()).eql('Email Label');
});
