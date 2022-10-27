import { RequestMock } from 'testcafe';

import RequestActivationEmailPageObject from '../framework/page-objects/RequestActivationEmailPageObject';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';

import { checkConsoleMessages } from '../framework/shared';

import xhrRequestActivationEmail from '../../../playground/mocks/data/idp/idx/request-activation-email';
import xhrRequestActivationEmailSuccess from '../../../playground/mocks/data/idp/idx/terminal-request-activation-email-submitted';
import xhrInvalidToken from '../../../playground/mocks/data/idp/idx/error-request-activation-email-invalid';
import xhrExpiredToken from '../../../playground/mocks/data/idp/idx/error-request-activation-email-expired-token';
import xhrUserSuspended from '../../../playground/mocks/data/idp/idx/error-request-activation-email-suspended';


const requestActivationEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrRequestActivationEmail)
  .onRequestTo('http://localhost:3000/idp/idx/request-activation')
  .respond(xhrRequestActivationEmailSuccess);

const activationEmailInvalidTokenMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrInvalidToken);

const activationEmailExpiredTokenMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrExpiredToken);

const activationEmailUserSuspendedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrUserSuspended);

fixture('Activation Email').meta('v3', true);

async function setup(t) {
  const requestActivaitonEmailPage = new RequestActivationEmailPageObject(t);
  await requestActivaitonEmailPage.navigateToPage();
  return requestActivaitonEmailPage;
}

async function setupTerminal(t) {
  const terminalPageObject = new TerminalPageObject(t);
  await terminalPageObject.navigateToPage();
  await checkConsoleMessages({
    controller: null,
    formName: 'terminal',
  });
  return terminalPageObject;
}

test.requestHooks(requestActivationEmailMock)('should render error with action button', async t => {
  const requestActivationEmailPage  = await setup(t);
  await t.expect(requestActivationEmailPage.getFormTitle()).eql('Activation link has expired');
  await t.expect(requestActivationEmailPage.getErrorBoxText()).eql('Your account activation link is no longer valid. Request a new activation email below.');
  await t.expect(requestActivationEmailPage.getSaveButtonLabel()).eql('Request activation email');

  await requestActivationEmailPage.clickRequestActivationEmailButton();
  await t.expect(requestActivationEmailPage.getFormTitle()).eql('Request submitted');
  await t.expect(requestActivationEmailPage.hasText('New activation link requested. If your information matches our records, you will receive a new activation link in your inbox soon.')).eql(true);
});

test.requestHooks(activationEmailInvalidTokenMock)('should render error if activation is link invalid', async t => {
  const terminalPage = await setupTerminal(t);
  await t.expect(terminalPage.getFormTitle()).eql('Activation link no longer valid');
  await t.expect(terminalPage.getErrorBoxText()).eql('This can happen if you have already activated your account, or if the URL you are trying to use is invalid. Contact your administrator for further assistance.');
});

test.requestHooks(activationEmailExpiredTokenMock)('should render error if activation link has expired', async t => {
  const terminalPage = await setupTerminal(t);
  await t.expect(terminalPage.getFormTitle()).eql('Activation link has expired');
  await t.expect(terminalPage.getErrorBoxText()).eql('Your account activation link is no longer valid. Request a new activation email below.');
});

test.requestHooks(activationEmailUserSuspendedMock)('should render error if user is suspended', async t => {
  const terminalPage = await setupTerminal(t);
  await t.expect(terminalPage.getFormTitle()).eql('Account suspended');
  await t.expect(terminalPage.getErrorBoxText()).eql('Your account has been temporarily suspended. Contact your administrator for further assistance.');
});