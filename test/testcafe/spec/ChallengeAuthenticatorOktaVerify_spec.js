import { RequestMock, RequestLogger } from 'testcafe';
import { renderWidget } from '../framework/shared';
import SelectAuthenticatorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';

import xhrSelectMethodOktaVerify from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-select-method';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

const requestLogger = RequestLogger(/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mockChallengeOVSelectMethod = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectMethodOktaVerify)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrSuccess);

fixture('Select Method screen for Okta verify');

async function setup(t) {
  const selectAuthenticatorPageObject = new SelectAuthenticatorPageObject(t);
  await selectAuthenticatorPageObject.navigateToPage();
  return selectAuthenticatorPageObject;
}

test.requestHooks(mockChallengeOVSelectMethod)('should load select method list with okta verify options', async t => {
  const selectAuthenticatorPage = await setup(t);
  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  await t.expect(selectAuthenticatorPage.getFormSubtitle()).eql('Select from the following options');
  //await t.expect(selectAuthenticatorPage.getFactorsCount()).eql(3);
  await t.expect(selectAuthenticatorPage.getFactorLabelByIndex(0)).eql('Use Okta Verify on this device');
  await t.expect(await selectAuthenticatorPage.factorDescriptionExistsByIndex(0)).eql(false);
  await t.expect(selectAuthenticatorPage.getFactorIconClassByIndex(0)).contains('mfa-okta-verify');
  await t.expect(selectAuthenticatorPage.getFactorSelectButtonByIndex(0)).eql('Select');

  await t.expect(selectAuthenticatorPage.getFactorLabelByIndex(1)).eql('Get a push notification');
  await t.expect(await selectAuthenticatorPage.factorDescriptionExistsByIndex(1)).eql(false);
  await t.expect(selectAuthenticatorPage.getFactorIconClassByIndex(1)).contains('mfa-okta-verify');
  await t.expect(selectAuthenticatorPage.getFactorSelectButtonByIndex(1)).eql('Select');

  await t.expect(selectAuthenticatorPage.getFactorLabelByIndex(2)).eql('Enter a code');
  await t.expect(await selectAuthenticatorPage.factorDescriptionExistsByIndex(2)).eql(false);
  await t.expect(selectAuthenticatorPage.getFactorIconClassByIndex(2)).contains('mfa-okta-verify');
  await t.expect(selectAuthenticatorPage.getFactorSelectButtonByIndex(2)).eql('Select');

  // signout link at enroll page
  await t.expect(await selectAuthenticatorPage.signoutLinkExists()).ok();
  await t.expect(selectAuthenticatorPage.getSignoutLinkText()).eql('Back to sign in');
});

test.requestHooks(mockChallengeOVSelectMethod)('should load select method list with okta verify and no sign-out link', async t => {
  const selectAuthenticatorPage = await setup(t);
  await renderWidget({
    features: { hideSignOutLinkInMFA: true },
  });
  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');

  // signout link is not visible
  await t.expect(await selectAuthenticatorPage.signoutLinkExists()).notOk();
});

test.requestHooks(requestLogger, mockChallengeOVSelectMethod)('should send right methodType when fastpass is selected', async t => {
  const selectAuthenticatorPage = await setup(t);
  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  await t.expect(selectAuthenticatorPage.getFormSubtitle()).eql('Select from the following options');
  selectAuthenticatorPage.selectFactorByIndex(0);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  const req2 = requestLogger.requests[0].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'aut13qrZReYpIib7R0g4',
      'methodType': 'signed_nonce'
    },
    'stateHandle': '02ciZ1YTWakSanNu8GNNTnTXzhL5hoLzTlR0JewfG3'
  });
});

test.requestHooks(requestLogger, mockChallengeOVSelectMethod)('should send right methodType when push is selected', async t => {
  const selectAuthenticatorPage = await setup(t);
  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  await t.expect(selectAuthenticatorPage.getFormSubtitle()).eql('Select from the following options');
  selectAuthenticatorPage.selectFactorByIndex(1);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  const req2 = requestLogger.requests[0].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'aut13qrZReYpIib7R0g4',
      'methodType': 'push'
    },
    'stateHandle': '02ciZ1YTWakSanNu8GNNTnTXzhL5hoLzTlR0JewfG3'
  });
});

test.requestHooks(requestLogger, mockChallengeOVSelectMethod)('should send right methodType when totp is selected', async t => {
  const selectAuthenticatorPage = await setup(t);
  await t.expect(selectAuthenticatorPage.getFormTitle()).eql('Verify it\'s you with an authenticator');
  await t.expect(selectAuthenticatorPage.getFormSubtitle()).eql('Select from the following options');
  selectAuthenticatorPage.selectFactorByIndex(2);
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  const req2 = requestLogger.requests[0].request;
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
  await t.expect(req2.method).eql('post');
  await t.expect(JSON.parse(req2.body)).eql({
    'authenticator':
    {
      'id': 'aut13qrZReYpIib7R0g4',
      'methodType': 'totp'
    },
    'stateHandle': '02ciZ1YTWakSanNu8GNNTnTXzhL5hoLzTlR0JewfG3'
  });
});
