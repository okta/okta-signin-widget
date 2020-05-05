import { RequestMock } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/idp/idx/data/identify';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify);

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

  const needhelpLinkText = identityPage.getNeedhelpLinkText();
  await t.expect(needhelpLinkText).eql('Need help signing in?');
});