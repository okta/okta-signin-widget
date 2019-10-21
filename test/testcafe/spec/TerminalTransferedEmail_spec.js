import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { RequestMock } from 'testcafe';
import terminalTransferedEmail from '../../../playground/mocks/idp/idx/data/terminal-transfered-email';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalTransferedEmail)

fixture(`Transfered Email Terminal`)
  .requestHooks(mock)

async function setup(t) {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage();
  return terminalPage;
}

test
  (`show the correct content`, async t => {
    const terminalPageObject = await setup(t);
    await t.expect(terminalPageObject.getHeader()).eql('Flow continued in a new tab.');
    await t.expect(terminalPageObject.getFooterBackLink().innerText).eql('Back to sign in');
    await t.expect(terminalPageObject.getFooterBackLink().getAttribute('href')).eql('/');
  });