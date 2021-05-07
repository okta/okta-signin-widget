import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages } from '../framework/shared';
import unknownUser from '../../../playground/mocks/data/idp/idx/identify-unknown-user';
import registeredUser from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator.json';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import { RequestMock } from 'testcafe';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(unknownUser)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(registeredUser);

fixture('Identify but Unknown User')
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();

  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });

  return identityPage;
}

test('should show messages callout for unknown user', async t => {
  const identityPage = await setup(t);
  await identityPage.fillIdentifierField('unknown');
  await identityPage.clickNextButton();
  await t.expect(identityPage.getUnknownUserCalloutContent())
    .eql('There is no account with that email.');
});

test('should remove messages callout for unknown user once successful', async t => {
  const identityPage = await setup(t);
  await identityPage.fillIdentifierField('unknown');
  await identityPage.clickNextButton();
  await identityPage.fillIdentifierField('registered');
  await identityPage.clickNextButton();
  await t.expect(identityPage.hasCallout()).eql(false);
});
