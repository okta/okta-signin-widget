import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { a11yCheck, checkConsoleMessages } from '../framework/shared';
import unknownUser from '../../../playground/mocks/data/idp/idx/identify-unknown-user';
import notAssignedApp from '../../../playground/mocks/data/idp/idx/error-400-user-not-assigned';
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

const unassignedApplinkMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(unknownUser)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(notAssignedApp);

fixture('Identify Unknown User');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();

  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });
  await a11yCheck(t);
  return identityPage;
}

test
  .requestHooks(mock)('should show messages callout for unknown user', async t => {
    const identityPage = await setup(t);
    await identityPage.fillIdentifierField('unknown');
    await identityPage.clickNextButton();
    await t.expect(identityPage.getUnknownUserCalloutContent())
      .eql('Unable to sign in');
    await t.expect(identityPage.hasUnknownUserErrorCallout()).eql(true);
  });

test
  .requestHooks(unassignedApplinkMock)('should remove the old error per UI reload', async t => {
    const identityPage = await setup(t);
    await t.expect(identityPage.getUnknownUserCalloutContent())
      .eql('Unable to sign in');
    await identityPage.fillIdentifierField('unknown');
    await identityPage.clickNextButton();
    await t.expect(identityPage.hasCallout()).eql(false);
    await t.expect(identityPage.getGlobalErrors()).eql('User is not assigned to this application.');
  });

test
  .requestHooks(mock)('should remove messages callout for unknown user once successful', async t => {
    const identityPage = await setup(t);
    await identityPage.fillIdentifierField('unknown');
    await identityPage.clickNextButton();
    await identityPage.fillIdentifierField('registered');
    await identityPage.clickNextButton();
    await t.expect(identityPage.hasCallout()).eql(false);
  });
