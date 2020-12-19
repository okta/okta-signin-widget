import { RequestMock, RequestLogger } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import EnrollOVViaSMSPageObject from '../framework/page-objects/EnrollOVViaSMSPageObject';

import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrSelectAuthenticatorEnroll from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator';
import xhrSafeModepolling from '../../../playground/mocks/data/idp/idx/safe-mode-polling';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-via-sms';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrSelectAuthenticatorEnroll)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrSafeModepolling)
  .onRequestTo('http://localhost:3000/idp/idx/poll')
  .respond(xhrSuccess);

// const identifyPollErrorMock = RequestMock()
//   .onRequestTo('http://localhost:3000/idp/idx/introspect')
//   .respond(xhrIdentifyWithPassword)
//   .onRequestTo('http://localhost:3000/idp/idx/identify')
//   .respond(xhrSelectAuthenticatorEnroll)
//   .onRequestTo('http://localhost:3000/idp/idx/poll')
//   .respond(xhrError);

const requestLogger = RequestLogger(/poll/);

fixture('Safemode Polling');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  const selectFactorPageObject = new SelectFactorPageObject(t);

  await identityPage.navigateToPage();  
  return [identityPage , selectFactorPageObject];
}  

test.requestHooks(requestLogger, identifyMock)('should poll', async t => {
  let [identityPage, selectFactorPage]  = await setup(t);

  await identityPage.fillIdentifierField('username');
  await identityPage.fillPasswordField('password');
  await identityPage.clickNextButton();

  selectFactorPage.selectFactorByIndex(0);

  await t.expect(requestLogger.count(() => true)).eql(1);

  const enrollViaSMSPageObject = new EnrollOVViaSMSPageObject(t);
  await t.expect(enrollViaSMSPageObject.getFormTitle()).eql('Set up Okta Verify via SMS');
});

// Test being flaky on bacon
// test.requestHooks(requestLogger, identifyPollErrorMock)('poll should end on error', async t => {
//   let [identityPage, selectFactorPage]  = await setup(t);
//   await identityPage.fillIdentifierField('username');
//   await identityPage.fillPasswordField('password');
//   await identityPage.clickNextButton();
//   selectFactorPage.selectFactorByIndex(0);
//   const terminalPageObject = new TerminalPageObject(t);
//   await t.expect(terminalPageObject.getErrorMessages().getTextContent()).eql('Something went wrong, Try again later.');
// });