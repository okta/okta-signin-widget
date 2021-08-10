import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { RequestMock, Selector } from 'testcafe';
import warning from '../../../playground/mocks/data/idp/idx/warning-account';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(warning);

fixture('Warning Form')
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
}

test('should display warning message', async t => {
  await setup(t);
  const calloutText = Selector('.infobox-warning').textContent;
  await t.expect(calloutText)
    .eql('Haven\'t received a push notification yet? Try opening the Okta Verify App on your phone.');
});
