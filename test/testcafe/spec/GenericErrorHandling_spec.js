import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
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
  await t.expect(terminalPage.formExists()).ok();
  await terminalPage.waitForTerminalView();
  return terminalPage;
}

test.requestHooks(noMessagesErrorMock)('should be able generic error when request does not have messages', async t => {
  const terminalPage = await setup(t);
  await checkA11y(t);
  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorBoxText()).contains('There was an unexpected internal error. Please try again.');
});

test.requestHooks(securityAccessDeniedMock)('should be able display error when request failed ith 403 with no stateToken', async t => {
  const terminalPage = await setup(t);
  await checkA11y(t);
  await terminalPage.waitForErrorBox();
  await t.expect(terminalPage.getErrorBoxText()).contains('You do not have permission to perform the requested action');
});
