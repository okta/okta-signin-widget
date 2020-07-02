import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { RequestMock } from 'testcafe';
import terminalReturnEmail from '../../../playground/mocks/data/idp/idx/terminal-return-email';
import terminalTransferedEmail from '../../../playground/mocks/data/idp/idx/terminal-transfered-email';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnEmail);

const mockTransfer = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalTransferedEmail);

fixture(`Return Terminals`);

async function setup(t) {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage();
  return terminalPage;
}

test
  .requestHooks(mock)(`show the correct content when return email`, async t => {
    const terminalPageObject = await setup(t);
    await t.expect(terminalPageObject.getHeader()).eql('Verify with your email');
    await t.expect(terminalPageObject.getFormSubtitle()).eql('To finish signing in, return to the screen where you requested the email link.');
  });

test
  .requestHooks(mockTransfer)(`show the correct content when transferred email`, async t => {
    const terminalPageObject = await setup(t);
    await t.expect(terminalPageObject.getHeader()).eql('Flow continued in a new tab.');
  });
