import { RequestMock } from 'testcafe';
import terminalReturnEmail from '../../../playground/mocks/data/idp/idx/terminal-return-email';
import terminalTransferEmail from '../../../playground/mocks/data/idp/idx/terminal-transfered-email';
import terminalReturnExpiredEmail from '../../../playground/mocks/data/idp/idx/terminal-return-expired-email';
import terminalRegistrationEmail from '../../../playground/mocks/data/idp/idx/terminal-registration';
import terminalReturnEmailConsentDenied from '../../../playground/mocks/data/idp/idx/terminal-enduser-email-consent-denied';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { a11yCheck } from '../framework/shared';

const terminalTransferredEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalTransferEmail);

const terminalReturnEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnEmail);

const terminalReturnExpiredEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnExpiredEmail);

const terminalRegistrationEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalRegistrationEmail);

const terminalReturnEmailConsentDeniedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnEmailConsentDenied);

fixture('Terminal view');

async function setup(t) {
  const terminalPageObject = new TerminalPageObject(t);
  await terminalPageObject.navigateToPage();
  await a11yCheck(t);

  return terminalPageObject;
}

[
  [ 'Shows the correct beacon for trasferred to new tab scenario for email terminalview',
    terminalTransferredEmailMock ],
  [ 'Shows the correct beacon for return to original tab scenario for email terminalview',
    terminalReturnEmailMock ],
  [ 'Shows the correct beacon for expired email terminalview',
    terminalReturnExpiredEmailMock ],
  [ 'Shows the correct beacon for email sent terminalview',
    terminalRegistrationEmailMock ],
  [ 'Shows the correct beacon for terminal email consent denied screen in first device',
    terminalReturnEmailConsentDeniedMock ],
].forEach(([ testTitle, mock ]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      await t.expect(terminalViewPage.getBeaconClass()).contains('mfa-okta-email');
    });
});
