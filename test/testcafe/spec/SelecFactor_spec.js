import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SelectFactorPageObject from '../framework/page-objects/SelectFactorPageObject';
import { RequestMock } from 'testcafe';
import selectFactorAuthenticate from '../../../playground/mocks/idp/idx/data/select-factor-authenticate';
// import factorRequiredPassword from '../../../playground/mocks/idp/idx/data/factor-required-password-with-options';
// import success from '../../../playground/mocks/idp/idx/data/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(selectFactorAuthenticate)

fixture(`Challenge Password Form`)
  .requestHooks(mock)

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  return new SelectFactorPageObject(t);
}

test
  (`should load select factor list`, async t => {
  const selectFactorPage = await setup(t);
  await t.expect(selectFactorPage.hasPasswordSelectButton()).eql(true);
});
