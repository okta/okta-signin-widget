import { RequestMock } from 'testcafe';
import terminalReturnEmail from '../../../playground/mocks/data/idp/idx/terminal-return-email';

const emailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnEmail);

fixture('Terminal view');

async function setup (t) {
  const terminalPageObject = new TerminalPageObject(t);
  await terminalPageObject.navigateToPage();
  return terminalPageObject;
}

test
  .requestHooks(emailMock)('shows the correct beacon', async t => {
  const terminalViewPage = await setup(t);
  await t.expect(terminalViewPage.getBeaconClass()).contains('mfa-okta-email');
});
