import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import unknownUser from '../../../playground/mocks/idp/idx/data/unknown-user'
import { RequestMock } from 'testcafe';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(unknownUser)

fixture(`Unknown user form`)
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

test(`should show messages callout for unknown user`, async t => {
  const identityPage = await setup(t);
  await identityPage.fillIdentifierField('unknown');
  await identityPage.clickNextButton();  
  await t.expect(identityPage.getUnknownUserCalloutContent()).eql('There is no account with the email  test@rain.com .  Sign up  for an account');
});
