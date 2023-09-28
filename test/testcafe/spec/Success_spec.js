import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import success from '../../../playground/mocks/data/idp/idx/success';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import { oktaDashboardContent } from '../framework/shared';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

fixture('Success Form')
  .requestHooks(mock);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

test('should navigate to redirect link google.com after success', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

