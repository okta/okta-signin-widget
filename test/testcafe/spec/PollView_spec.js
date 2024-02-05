import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import PollingPageObject from '../framework/page-objects/PollingPageObject';

import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrSafeModepolling from '../../../playground/mocks/data/idp/idx/safe-mode-polling';
import xhrSafeModepollingWithRefreshedInterval from '../../../playground/mocks/data/idp/idx/safe-mode-polling-refreshed-interval';
import xhrError from '../../../playground/mocks/data/idp/idx/error-safe-mode-polling';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrSafeModepolling)
  .onRequestTo('http://localhost:3000/idp/idx/poll')
  .respond(xhrSafeModepollingWithRefreshedInterval);

const identifyPollErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrError);

const requestLogger = RequestLogger(/poll/);

fixture('Safemode Polling');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await t.expect(identityPage.formExists()).ok();
  return identityPage;
}

test.requestHooks(requestLogger, identifyMock)('should make request based on timer in response', async t => {
  let identityPage  = await setup(t);
  await checkA11y(t);

  await identityPage.fillIdentifierField('username');
  await identityPage.fillPasswordField('password');
  await identityPage.clickSignInButton();
  const pollingPageObject = new PollingPageObject();

  await t.wait(2000);
  await t.expect(requestLogger.count(() => true)).eql(1);

  await t.expect(pollingPageObject.getHeader()).eql('Unable to complete your request');
  await t.expect(pollingPageObject.getRetryMessage().exists).eql(true);
  await t.wait(3000);
  await t.expect(requestLogger.count(() => true)).eql(2);
});

test.requestHooks(requestLogger, identifyPollErrorMock)('not poll on error', async t => {
  let identityPage  = await setup(t);
  await checkA11y(t);
  await identityPage.fillIdentifierField('username');
  await identityPage.fillPasswordField('password');
  await identityPage.clickSignInButton();
  const pollingPageObject = new PollingPageObject();
  await t.expect(pollingPageObject.getErrorMessages().getTextContent()).eql('Server is unable to respond at the moment.');
  await t.expect(pollingPageObject.getRetryMessage().length).eql(0);
});
