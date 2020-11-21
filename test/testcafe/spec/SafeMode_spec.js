import { RequestMock } from 'testcafe';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import xhrSafeModeOptionalEnrollment from '../../../playground/mocks/data/idp/idx/safe-mode-optional-enrollment';
import xhrSafeModeRequiredEnrollment from '../../../playground/mocks/data/idp/idx/safe-mode-required-enrollment';
import xhrSafeModeCredentialEnrollmentIntent from '../../../playground/mocks/data/idp/idx/safe-mode-credential-enrollment-intent';

const safeModeOptionalMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSafeModeOptionalEnrollment, 200);

const safeModeRequiredMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSafeModeRequiredEnrollment, 200);

const safeModeCredentialEnrollmentIntent = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSafeModeCredentialEnrollmentIntent, 200);

fixture('Safe Mode during enrollment');

async function setup(t) {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: null,
    formName: 'terminal',
  });

  return terminalPage;
}

test.requestHooks(safeModeOptionalMock)('should display correct error and skip link when server is in safe mode during optional enrollment', async t => {
  const terminalPage = await setup(t);
  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('Set up is temporarily unavailable due to server maintenance. Click \'Skip set up\' to continue.');
  await t.expect(await terminalPage.skipSetUpLinkExists()).ok();
  await t.expect(await terminalPage.signoutLinkExists()).notOk();
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
  await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('Set up is temporarily unavailable due to server maintenance. Click \'Back to Settings\' to continue.');
  await t.expect(await terminalPage.skipSetUpLinkExists()).notOk();
  await t.expect(await terminalPage.signoutLinkExists()).notOk();
});
