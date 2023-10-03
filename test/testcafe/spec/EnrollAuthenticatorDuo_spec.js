import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { checkConsoleMessages, mockDuoIframeHtml, renderWidget } from '../framework/shared';

import DuoPageObject from '../framework/page-objects/DuoPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrAuthenticatorEnrollDuo from '../../../playground/mocks/data/idp/idx/authenticator-enroll-duo.json';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success.json';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess)
  .onRequestTo('http://localhost:3000/mocks/spec-duo/duo-iframe.html')
  .respond(mockDuoIframeHtml);

fixture('Authenticator Enroll Duo').meta('v3', true)
  .requestHooks(mock);

async function setup(t) {
  const enrollDuoPage = new DuoPageObject(t);
  await enrollDuoPage.navigateToPage();
  await t.expect(enrollDuoPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: 'enroll-duo',
    formName: 'enroll-authenticator',
    authenticatorKey: 'duo',
    methodType: 'idp',
  });

  return enrollDuoPage;
}

test('should render an iframe for duo', async t => {
  const enrollDuoPage = await setup(t);
  await checkA11y(t);

  // Check title
  await t.expect(enrollDuoPage.getFormTitle()).eql('Set up Duo Security');
  await t.expect(enrollDuoPage.hasDuoIframe()).eql(true);

  // Verify links (switch authenticator link is present even if there is just one authenticator available)
  await t.expect(await enrollDuoPage.returnToAuthenticatorListLinkExists()).ok();
  await t.expect(await enrollDuoPage.signoutLinkExists()).ok();
});

test('should render an iframe for duo without sign-out link', async t => {
  const enrollDuoPage = await setup(t);
  await checkA11y(t);
  await renderWidget({
    features: { hideSignOutLinkInMFA: true },
  });

  // Check title
  await t.expect(enrollDuoPage.getFormTitle()).eql('Set up Duo Security');

  // signout link is not visible
  await t.expect(await enrollDuoPage.signoutLinkExists()).notOk();
});

// TODO: TEST FAILED
test('enrolls successfully', async t => {
  const enrollDuoPage = await setup(t);
  await checkA11y(t);
  const successPage = new SuccessPageObject(t);

  await enrollDuoPage.clickDuoMockLink();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});
