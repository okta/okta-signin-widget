import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SelectFactorPageObject from '../framework/page-objects/SelectFactorPageObject';
import { RequestMock } from 'testcafe';
import selectFactorAuthenticate from '../../../playground/mocks/idp/idx/data/select-factor-authenticate';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(selectFactorAuthenticate);

fixture(`Select Factor Form`)
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  return new SelectFactorPageObject(t);
}

test(`should load select factor list`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.hasPasswordSelectButton()).eql(true);
  await t.expect(selectFactorPage.hasPasswordIcon()).eql(true);
  await t.expect(selectFactorPage.hasEmailIcon()).eql(true);
  await t.expect(selectFactorPage.getPasswordLabel()).eql('Password Label');
  await t.expect(selectFactorPage.getEmailLabel()).eql('Email Label');
});
