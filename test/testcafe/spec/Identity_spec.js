import { RequestMock } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import errorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify);

const identifyLockedUserMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(errorIdentify, 403);

fixture(`Identity Form`)
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

test(`should have editable fields`, async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');

  await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
});

test(`should show errors if required fields are empty`, async t => {
  const identityPage = await setup(t);

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasIdentifierError()).eql(true);
  await t.expect(identityPage.hasIdentifierErrorMessage()).eql(true);
});

test(`should have correct display texts`, async t => {
  // i18n values can be tested here.
  const identityPage = await setup(t);

  const identityPageTitle = identityPage.getPageTitle();
  await t.expect(identityPageTitle).eql('Sign In');

  const signupLinkText = identityPage.getSignupLinkText();
  await t.expect(signupLinkText).eql('Sign Up');

  const rememberMeText = identityPage.getRememberMeText();
  await t.expect(rememberMeText).eql('Remember Me');

  const rememberMeValue = identityPage.getRememberMeValue();
  await t.expect(rememberMeValue).eql(false);

  const needhelpLinkText = identityPage.getNeedhelpLinkText();
  await t.expect(needhelpLinkText).eql('Need help signing in?');
});

test(`should show global error for invalid user`, async t => {
  await t
    .removeRequestHooks(mock)
    .addRequestHooks(identifyLockedUserMock);

  const identityPage = await setup(t);
  await identityPage.fillIdentifierField('Test Identifier');

  await identityPage.clickNextButton();

  await identityPage.waitForErrorBox();

  await t.expect(identityPage.getGlobalErrors()).contains('You do not have permission to perform the requested action.');
});