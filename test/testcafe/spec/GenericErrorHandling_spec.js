import { RequestMock } from 'testcafe';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import xhr403SecurityAccessDenied from '../../../playground/mocks/data/idp/idx/error-403-security-access-denied';

const securityAccessDeniedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhr403SecurityAccessDenied, 403);

const noMessageResponse = {};
const noMessagesErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(noMessageResponse, 403);

fixture('GenericErrors');

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

test.requestHooks(noMessagesErrorMock)('should be able generic error when request does not have messages', async t => {
  const terminalPage = await setup(t);
  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('There was an unexpected internal error. Please try again.');
});

test.requestHooks(securityAccessDeniedMock)('should be able display error when request failed ith 403 with no stateToken', async t => {
  const terminalPage = await setup(t);
  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorMessages().getTextContent()).eql('You do not have permission to perform the requested action.');
});
