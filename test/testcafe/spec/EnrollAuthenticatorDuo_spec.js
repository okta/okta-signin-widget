import { RequestMock } from 'testcafe';
import { a11yCheck, checkConsoleMessages, renderWidget } from '../framework/shared';
import DuoPageObject from '../framework/page-objects/DuoPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrAuthenticatorEnrollDuo from '../../../playground/mocks/data/idp/idx/authenticator-enroll-duo';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

fixture('Authenticator Enroll Duo')
  .requestHooks(mock);

async function setup(t) {
  const enrollDuoPage = new DuoPageObject(t);
  await enrollDuoPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'enroll-duo',
    formName: 'enroll-authenticator',
    authenticatorKey: 'duo',
    methodType: 'idp',
  });
  await a11yCheck(t);

  return enrollDuoPage;
}

test('should render an iframe for duo', async t => {
  const enrollDuoPage = await setup(t);

  // Check title
  await t.expect(enrollDuoPage.getFormTitle()).eql('Set up Duo Security');
  await t.expect(enrollDuoPage.hasDuoIframe()).eql(true);

  // Verify links (switch authenticator link not present since there are no other authenticators available)
  await t.expect(await enrollDuoPage.switchAuthenticatorLinkExists()).notOk();
  await t.expect(await enrollDuoPage.signoutLinkExists()).ok();
});

test('should render an iframe for duo without sign-out link', async t => {
  const enrollDuoPage = await setup(t);
  await renderWidget({
    features: { hideSignOutLinkInMFA: true },
  });

  // Check title
  await t.expect(enrollDuoPage.getFormTitle()).eql('Set up Duo Security');

  // signout link is not visible
  await t.expect(await enrollDuoPage.signoutLinkExists()).notOk();
});

test('enrolls successfully', async t => {
  const enrollDuoPage = await setup(t);
  const successPage = new SuccessPageObject(t);

  await enrollDuoPage.clickDuoMockLink();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});
