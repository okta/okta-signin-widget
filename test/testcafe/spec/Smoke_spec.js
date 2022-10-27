import { RequestMock, RequestLogger, Selector } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password.json';
import xhrInteract from '../../../playground/mocks/data/oauth2/interact.json';

const mocks = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteract)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword);

const logger = RequestLogger(/idx\/identify/, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

fixture('Smoke Test')
  .meta('v3', true); // NOTE: tells parity-v3 script to run this fixture

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await t.expect(Selector('form').exists).eql(true);
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
    authenticatorKey: 'okta_password',
    methodType: 'password',
  });
  return identityPage;
}

test.requestHooks(logger, mocks)('should have identifier and password fields', async t => {
  const identityPage = await setup(t);
  await renderWidget({});
  await identityPage.fillIdentifierField('myusername');
  await identityPage.fillPasswordField('mypassword');
});
