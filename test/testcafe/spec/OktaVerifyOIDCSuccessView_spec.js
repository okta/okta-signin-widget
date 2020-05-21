import { RequestMock } from 'testcafe';
import OktaVerifyOIDCSuccessPageObject from '../framework/page-objects/OktaVerifyOIDCSuccessPageObject';
import oktaVerifyOIDCSuccess from '../../../playground/mocks/idp/idx/data/oktaverify-oidc-success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(oktaVerifyOIDCSuccess);

fixture(`Okta Verify OIDC Success`)
  .requestHooks(mock);

async function setup(t) {
  const ovOIDCSuccessPage = new OktaVerifyOIDCSuccessPageObject(t);
  await ovOIDCSuccessPage.navigateToPage();
  return ovOIDCSuccessPage;
}

test(`has the correct content`, async t => {
  const ovOIDCSuccessPage = await setup(t);
  await t.expect(ovOIDCSuccessPage.getFormTitle()).eql('Sign In Verified');
  await t.expect(ovOIDCSuccessPage.getFormSubtitle()).eql('Feel free to close this browser tab.');
  // await t.debug();
  await t.expect(ovOIDCSuccessPage.hasOktaVerifyIconAsBeacon()).eql(true);
});
