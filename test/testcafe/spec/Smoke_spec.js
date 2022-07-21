import { RequestMock, RequestLogger } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password.json';

const identifyWithPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword);

const identifyRequestLogger = RequestLogger(/idx\/identify/, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

fixture('Smoke Test')
  .meta('v3', true);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
    authenticatorKey: 'okta_password',
    methodType: 'password',
  });
  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should have identifier and password fields', async t => {
  const identityPage = await setup(t);
  await renderWidget({});
  await identityPage.fillIdentifierField('myusername');
  await identityPage.fillPasswordField('mypassword');
});
