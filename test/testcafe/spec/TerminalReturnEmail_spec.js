import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { RequestMock } from 'testcafe';
import terminalReturnEmail from '../../../playground/mocks/idp/idx/data/terminal-return-email';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnEmail)

fixture(`Return Email Terminal`)
  .requestHooks(mock)

async function setup(t) {
  const terminalPage = new TerminalPageObject(t);
  await terminalPage.navigateToPage();
  return terminalPage;
}

test
  (`show the correct content`, async t => {
    const terminalPageObject = await setup(t);
    await t.expect(terminalPageObject.getHeader()).eql('Email link (o*****m@abbott.dev)');
    await t.expect(terminalPageObject.getSubtitle()).eql('To finish signing in, return to the screen where you requested the email link.');
    await t.expect(terminalPageObject.getFooterBackLink().innerText).eql('Back to sign in');
    await t.expect(terminalPageObject.getFooterBackLink().getAttribute('href')).eql('/');
  });
