import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import unknownUser from '../../../playground/mocks/idp/idx/data/unknown-user';
import registeredUser from '../../../playground/mocks/idp/idx/data/select-factor-authenticate';
import identify from '../../../playground/mocks/idp/idx/data/identify';
import { RequestMock } from 'testcafe';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(unknownUser)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(registeredUser);

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
  await t.expect(identityPage.getUnknownUserCalloutContent())
    .eql('There is no account with the email  test@rain.com .  Sign up  for an account');
});

test(`should remove messages callout for unknown user once successful`, async t => {
  const identityPage = await setup(t);
  await identityPage.fillIdentifierField('unknown');
  await identityPage.clickNextButton();
  await identityPage.fillIdentifierField('registered');
  await identityPage.clickNextButton();
  await t.expect(identityPage.hasCallout()).eql(false);
});
