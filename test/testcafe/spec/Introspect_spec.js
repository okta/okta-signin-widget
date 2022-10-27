import { RequestMock, RequestLogger, Selector } from 'testcafe';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrInternalServerError from '../../../playground/mocks/data/idp/idx/error-internal-server-error';

const introspectMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrInternalServerError, 403);


const introspectRequestLogger = RequestLogger(
  /idx\/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Introspect')
  .meta('v3', true);

async function setup(t) {
  const terminalPageObject = new TerminalPageObject(t);
  await terminalPageObject.navigateToPage();
  await t.expect(Selector('form').exists).eql(true);
  await checkConsoleMessages({
    controller: null,
    formName: 'terminal',
  });

  return terminalPageObject;
}

test.requestHooks(introspectRequestLogger, introspectMock)('shall display error in terminal page', async t => {
  const terminalPageObject = await setup(t);

  const errors = terminalPageObject.getErrorMessages();

  await t.expect(errors.isError()).ok();
  await t.expect(errors.getTextContent()).eql('Internal Server Error');

  await t.expect(introspectRequestLogger.count(() => true)).eql(1);
  const req = introspectRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    stateToken: 'dummy-state-token-wrc',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/introspect');
});
