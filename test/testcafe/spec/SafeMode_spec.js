import { RequestLogger, RequestMock } from 'testcafe';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrSafeModeOptionalEnrollment from '../../../playground/mocks/data/idp/idx/safe-mode-optional-enrollment';
import xhrSafeModeRequiredEnrollment from '../../../playground/mocks/data/idp/idx/safe-mode-required-enrollment';
import xhrSafeModeCredentialEnrollmentIntent from '../../../playground/mocks/data/idp/idx/safe-mode-credential-enrollment-intent';
import success from '../../../playground/mocks/data/idp/idx/success';

const safeModeOptionalMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSafeModeOptionalEnrollment, 200)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(success, 200);

const safeModeRequiredMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSafeModeRequiredEnrollment, 200);

const safeModeCredentialEnrollmentIntent = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSafeModeCredentialEnrollmentIntent, 200);

const skipRequestLogger = RequestLogger(
  /idp\/idx\/skip/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Safe Mode during enrollment');

async function setup(t) {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage();
  await checkConsoleMessages({
    controller: null,
    formName: 'terminal',
  });

  return terminalPage;
}

test.requestHooks(skipRequestLogger, safeModeOptionalMock)('should display correct error and skip link when server is in safe mode during optional enrollment', async t => {
  const terminalPage = await setup(t);

  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('Set up is temporarily unavailable due to server maintenance. Try again later.');
  await t.expect(await terminalPage.skipSetUpLinkExists()).ok();
  await t.expect(await terminalPage.signoutLinkExists()).notOk();

  // click skip link and ensure it goes to skip endpoint
  await terminalPage.clickSetUpSkipLink();
  await t.expect(skipRequestLogger.count(() => true)).eql(1);
  const req = skipRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    stateHandle: '02-20rHvS_j-Wq-odoJpMO33YcBwaL50217Nm9hysZ',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/skip');
});

test.requestHooks(safeModeRequiredMock)('should display correct error and sign out link when server is in safe mode during required enrollment', async t => {
  const terminalPage = await setup(t);
  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('Set up is temporarily unavailable due to server maintenance. Try again later.');
  await t.expect(await terminalPage.skipSetUpLinkExists()).notOk();
  await t.expect(await terminalPage.signoutLinkExists()).ok();
});

test.requestHooks(safeModeCredentialEnrollmentIntent)('should display correct error and no links when server is in safe mode during credential enrollment intent', async t => {
  const terminalPage = await setup(t);
  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('Set up is temporarily unavailable due to server maintenance. Try again later.');
  await t.expect(await terminalPage.skipSetUpLinkExists()).notOk();
  await t.expect(await terminalPage.signoutLinkExists()).notOk();
});
