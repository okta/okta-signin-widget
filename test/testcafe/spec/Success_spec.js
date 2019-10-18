import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { ClientFunction, RequestMock } from 'testcafe';
import success from '../../../playground/mocks/idp/idx/data/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(success);

fixture(`Success Form`)
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}
const getPageUrl = ClientFunction(() => window.location.href);

test(`should navigate to redirect link google.com after success`, async t => {
  const identityPage = await setup(t);
  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  const pageUrl = getPageUrl();
  await t.expect(pageUrl).contains('stateToken=abc123');
});

