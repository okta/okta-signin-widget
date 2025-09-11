import { ClientFunction, RequestMock, userVariables } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import DebuggerObject from '../framework/page-objects/components/DebuggerObject';
import { LOG_IGNORE_PATTERNS, READY_MESSAGE, AFTER_RENDER_MESSAGE } from '../framework/shared';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrInternalServerError from '../../../playground/mocks/data/idp/idx/error-internal-server-error';
import xhrOAuthError from '../../../playground/mocks/data/idp/idx/error-feature-not-enabled';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword);

const introspectErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrInternalServerError, 403);

const introspectBadResponseMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond('not a json', 400);

const introspectOAuthErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrOAuthError, 400);

// Client functions
const initDebugger = ClientFunction(() => {
  window.OktaSignInDebug.init({
    cspNonce: 'playground'
  });
});
const destroyDebugger = ClientFunction(() => {
  window.OktaSignInDebug.destroy();
});
const renderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

async function setup(t, { debug } = {}) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage({ render: false });
  if (debug) {
    await initDebugger();
  }
  await renderWidget();
  await t.expect(identityPage.formExists()).ok();
  return identityPage;
}

fixture('OktaPluginDebugger');

test.requestHooks(identifyMock)('shows no debug button by default', async t => {
  await setup(t, { debug: false });
  const dbg = new DebuggerObject(t);
  await t.expect(dbg.buttonExists()).notOk();
  await t.expect(dbg.containerExists()).notOk();
});

test.requestHooks(identifyMock)('shows debug button after window.OktaSignInDebug.init()', async t => {
  await setup(t, { debug: false });
  const dbg = new DebuggerObject(t);
  await t.expect(dbg.buttonExists()).notOk();
  await t.expect(dbg.containerExists()).notOk();
  await initDebugger();
  await t.expect(dbg.buttonExists()).ok();
  await t.expect(dbg.containerExists()).ok();
});

test.requestHooks(identifyMock)('debug button should toggle debug container visibility', async t => {
  await setup(t, { debug: true });
  const dbg = new DebuggerObject(t);
  await t.expect(dbg.buttonExists()).ok();
  await t.expect(dbg.getButtonLabel()).eql('Console');
  await t.expect(dbg.containerExists()).ok();
  await t.expect(dbg.containerVisible()).notOk();
  await dbg.click();
  await t.expect(dbg.containerVisible()).ok();
  await dbg.click();
  await t.expect(dbg.containerVisible()).notOk();
});

test.requestHooks(identifyMock)('can destroy debugger', async t => {
  await setup(t, { debug: true });
  const dbg = new DebuggerObject(t);
  await t.expect(dbg.buttonExists()).ok();
  await t.expect(dbg.containerExists()).ok();
  await destroyDebugger();
  await t.expect(dbg.buttonExists()).notOk();
  await t.expect(dbg.containerExists()).notOk();
});

test.requestHooks(identifyMock)('should display console log messages', async t => {
  await setup(t, { debug: true });
  const dbg = new DebuggerObject(t);
  await dbg.click();
  await dbg.containerVisible();
  const messages = await dbg.getItemsContent();
  const logMessages = messages.filter(({ isFetch, type, title }) => (
    !isFetch && type === 'log' && LOG_IGNORE_PATTERNS.every(rx => !rx.test(title))
  ));
  await t.expect(logMessages.length).eql(3);
  await t.expect(logMessages[0].title).eql(READY_MESSAGE);
  await t.expect(logMessages[1].title).eql(AFTER_RENDER_MESSAGE);
  await t.expect(JSON.parse(logMessages[2].title)['controller']).eql('primary-auth');
});

test.requestHooks(identifyMock)('should display successful fetch requests', async t => {
  await setup(t, { debug: true });
  const dbg = new DebuggerObject(t);
  await dbg.click();
  await dbg.containerVisible();
  const messages = await dbg.getItemsContent();
  const fetchMessages = messages.filter(({ isFetch }) => isFetch);
  await t.expect(fetchMessages.length).eql(1);
  await t.expect(fetchMessages[0].title).contains('200 POST http://localhost:3000/idp/idx/introspect');
  // eslint-disable-next-line no-unused-vars
  const [_req, res, metaStr] = fetchMessages[0].contents;
  const meta = JSON.parse(metaStr);
  await t.expect(JSON.parse(res)).eql(xhrIdentifyWithPassword);
  await t.expect(meta['reqHeaders']['Accept']).contains('application/ion+json');
  await t.expect(meta['resHeaders']['content-type']).eql('application/json');
  await t.expect(meta['credentials']).eql('include');
});

test.requestHooks(introspectErrorMock)('should display failed fetch requests', async t => {
  await setup(t, { debug: true });
  const dbg = new DebuggerObject(t);
  await dbg.click();
  await dbg.containerVisible();
  const messages = await dbg.getItemsContent();
  const fetchMessages = messages.filter(({ isFetch }) => isFetch);
  await t.expect(fetchMessages.length).eql(1);
  await t.expect(fetchMessages[0].title).contains('403 POST http://localhost:3000/idp/idx/introspect');
  // eslint-disable-next-line no-unused-vars
  const [_req, res, metaStr] = fetchMessages[0].contents;
  const meta = JSON.parse(metaStr);
  await t.expect(JSON.parse(res)).eql(xhrInternalServerError);
  await t.expect(meta['reqHeaders']['Accept']).contains('application/ion+json');
  await t.expect(meta['resHeaders']['content-type']).eql('application/json');
  await t.expect(meta['credentials']).eql('include');
});

// TODO: odyssey upgrade introduces extra error log in dev mode, temp skip this test
test.skip.requestHooks(introspectBadResponseMock)('should display errors of type AuthApiError', async t => {
  await setup(t, { debug: true });
  const dbg = new DebuggerObject(t);
  await dbg.click();
  await dbg.containerVisible();
  const messages = await dbg.getItemsContent();
  const fetchMessages = messages.filter(({ isFetch }) => isFetch);
  await t.expect(fetchMessages.length).eql(1);
  await t.expect(fetchMessages[0].title).contains('400 POST http://localhost:3000/idp/idx/introspect');
  // eslint-disable-next-line no-unused-vars
  const [_req, res] = fetchMessages[0].contents;
  await t.expect(res).eql('not a json');
  const errorMessages = messages.filter(({ isFetch, type }) => !isFetch && type === 'error');
  await t.expect(errorMessages.length).eql(1);
  let errorStr, errorDescription, globalErrorTitle;
  if (userVariables.gen3) {
    errorDescription = errorMessages[0].title;
    [errorStr] = errorMessages[0].contents;
  } else {
    globalErrorTitle = errorMessages[0].title;
    [errorDescription, errorStr] = errorMessages[0].contents;
    await t.expect(globalErrorTitle).contains('global error handler');
  }
  await t.expect(errorDescription).contains('AuthApiError: Unknown error');
  // has stacktrace
  await t.expect(errorDescription).contains(' at ');
  const error = JSON.parse(errorStr);
  // has AuthApiError properties
  await t.expect(error['name']).eql('AuthApiError');
  await t.expect(error['message']).eql('Unknown error');
  await t.expect(error['xhr']['responseText']).eql('not a json');
});

// TODO: odyssey upgrade introduces extra error log in dev mode, temp skip this test
test.skip.requestHooks(introspectOAuthErrorMock)('should display errors of type OAuthError', async t => {
  await setup(t, { debug: true });
  const dbg = new DebuggerObject(t);
  await dbg.click();
  await dbg.containerVisible();
  const messages = await dbg.getItemsContent();
  const fetchMessages = messages.filter(({ isFetch }) => isFetch);
  await t.expect(fetchMessages.length).eql(1);
  await t.expect(fetchMessages[0].title).contains('400 POST http://localhost:3000/idp/idx/introspect');
  // eslint-disable-next-line no-unused-vars
  const [_req, res] = fetchMessages[0].contents;
  await t.expect(JSON.parse(res)).eql(xhrOAuthError);
  const errorMessages = messages.filter(({ isFetch, type }) => !isFetch && type === 'error');
  await t.expect(errorMessages.length).eql(1);
  let errorStr, errorDescription, globalErrorTitle;
  if (userVariables.gen3) {
    errorDescription = errorMessages[0].title;
    [errorStr] = errorMessages[0].contents;
  } else {
    globalErrorTitle = errorMessages[0].title;
    [errorDescription, errorStr] = errorMessages[0].contents;
    await t.expect(globalErrorTitle).contains('global error handler');
  }
  await t.expect(errorDescription).contains('OAuthError: The requested feature is not enabled in this environment');
  // has stacktrace
  await t.expect(errorDescription).contains(' at ');
  const error = JSON.parse(errorStr);
  // has OAuthError properties
  await t.expect(error['name']).eql('OAuthError');
  await t.expect(error['errorCode']).eql('access_denied');
  await t.expect(error['errorSummary']).eql('The requested feature is not enabled in this environment.');
});
