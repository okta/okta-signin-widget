import { ClientFunction, RequestMock, RequestLogger, Selector } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrErrorFeatureNotEnabled from '../../../playground/mocks/data/oauth2/error-feature-not-enabled';
import xhrErrorInvalidRecoveryToken from '../../../playground/mocks/data/oauth2/error-recovery-token-invalid';
import xhrWellKnownResponse from '../../../playground/mocks/data/oauth2/well-known-openid-configuration.json';
import xhrInteractResponse from '../../../playground/mocks/data/oauth2/interact.json';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrAuthenticatorResetPassword from '../../../playground/mocks/data/idp/idx/authenticator-reset-password';

const expectIdentifyView = {
  controller: 'primary-auth',
  formName: 'identify',
};

const expectTerminalView = {
  controller: null,
  formName: 'terminal'
};

const expectResetPasswordView = {
  controller: 'forgot-password',
  formName: 'reset-authenticator',
  authenticatorKey: 'okta_password',
  methodType:'password',
};

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const saveTransactionMeta = ClientFunction(meta => {
  const signIn = window.createWidgetInstance();
  const authClient = signIn.authClient;
  authClient.transactionManager.save(meta);
});

const interactMock = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellKnownResponse, 200)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteractResponse, 200)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify);

const errorOIENotEnabledMock = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellKnownResponse, 200)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrErrorFeatureNotEnabled, 400)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify);

const errorInvalidRecoveryTokenMock = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellKnownResponse, 200)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrErrorInvalidRecoveryToken, 400)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify);


const cancelResetPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellKnownResponse, 200)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteractResponse, 200)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorResetPassword)
  .onRequestTo('http://localhost:3000/idp/idx/cancel')
  .respond(xhrIdentify);

const requestLogger = RequestLogger(
  [
    /v1\/interact/,
    /idx\/introspect/
  ],
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Interact')
.only
  .meta('v3', true);

function decodeUrlEncodedRequestBody(body) {
  const params = {};
  const pairs = body.split('&');
  pairs.forEach(pair => {
    const split = pair.split('=');
    const key = split[0];
    const val = decodeURIComponent(split[1]);
    params[key] = val;
  });
  return params;
}

async function setup(t, options = {}) {
  const pageObject = new BasePageObject(t);
  await pageObject.navigateToPage({ render: false });

  // Set saved transaction meta?
  if (options.transactionMeta) {
    await saveTransactionMeta(options.transactionMeta);
  }

  // Render the widget for interaction code flow
  await pageObject.mockCrypto();
  await renderWidget({
    stateToken: undefined,
    recoveryToken: options.recoveryToken,
    clientId: 'fake',
    redirectUri: 'http://doesnot-matter',
    useInteractionCodeFlow: true,
    authParams: {
      pkce: true,
      state: 'mock-state'
    }
  });
  await t.expect(Selector('form').exists).eql(true);
  return pageObject;
}

test.requestHooks(requestLogger, errorOIENotEnabledMock)('shows an error when feature is not enabled', async t => {
  await setup(t);

  const terminalPageObject = new TerminalPageObject(t);
  const errors = terminalPageObject.getErrorMessages();
  await t.expect(errors.isError()).ok();
  await t.expect(errors.getTextContent()).eql('The requested feature is not enabled in this environment.');

  await checkConsoleMessages([
    'ready',
    'afterRender',
    expectTerminalView
  ]);
});

test.requestHooks(requestLogger, interactMock)('receives interaction_handle from interact endpoint', async t => {
  await setup(t);

  await t.expect(requestLogger.count(() => true)).eql(2); // interact, introspect
  let req = requestLogger.requests[0].request; // interact
  const params = decodeUrlEncodedRequestBody(req.body);
  await t.expect(params['state']).eql('mock-state');
  await t.expect(params['client_id']).eql('fake');
  await t.expect(params['scope']).eql('openid email');
  await t.expect(params['redirect_uri']).eql('http://doesnot-matter');
  await t.expect(params['code_challenge_method']).eql('S256');
  await t.expect(typeof params['code_challenge']).eql('string');
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/oauth2/default/v1/interact');

  await checkConsoleMessages([
    'ready',
    'afterRender',
    expectIdentifyView
  ]);
});

test.requestHooks(requestLogger, interactMock)('passes interaction handle to introspect endpoint', async t => {
  await setup(t);

  await t.expect(requestLogger.count(() => true)).eql(2); // interact, introspect
  const req = requestLogger.requests[1].request; // introspect
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    interactionHandle: 'fake_interaction_handle',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/introspect');

  await checkConsoleMessages([
    'ready',
    'afterRender',
    expectIdentifyView
  ]);
});

test.requestHooks(requestLogger, interactMock)('passes saved interaction handle to introspect endpoint', async t => {
  await setup(t, {
    transactionMeta: {
      interactionHandle: 'my_very_fake_handle',
      codeVerifier: 'fake',
      codeChallenge: 'totally_fake',
      codeChallengeMethod: 'S256',

      // These properties must match config. See `isTransactionMetaValid` https://github.com/okta/okta-auth-js/blob/master/lib/idx/transactionMeta.ts
      issuer: 'http://localhost:3000/oauth2/default',
      clientId: 'fake',
      redirectUri: 'http://doesnot-matter',
      state: 'mock-state'
    }
  });

  await t.expect(requestLogger.count(() => true)).eql(1); // only introspect, no interact
  const req = requestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    interactionHandle: 'my_very_fake_handle',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/introspect');

  await checkConsoleMessages([
    'ready',
    'afterRender',
    expectIdentifyView
  ]);
});

test.requestHooks(requestLogger, interactMock)('passes recovery_token to interact endpoint', async t => {
  const recoveryToken = 'abcdef';
  await setup(t, {
    recoveryToken
  });

  await t.expect(requestLogger.count(() => true)).eql(2); // interact, introspect
  let req = requestLogger.requests[0].request; // interact
  const params = decodeUrlEncodedRequestBody(req.body);
  await t.expect(req.url).eql('http://localhost:3000/oauth2/default/v1/interact');
  await t.expect(params['recovery_token']).eql(recoveryToken);
  await checkConsoleMessages([
    'ready',
    'afterRender',
    expectIdentifyView
  ]);
});

test.meta('v3', false).requestHooks(requestLogger, cancelResetPasswordMock)('clears recovery_token and does not pass it to interact after clicking "back to signin"', async t => {
  const recoveryToken = 'abcdef';
  const pageObject = await setup(t, {
    recoveryToken
  });

  await t.expect(requestLogger.count(() => true)).eql(2); // interact, introspect
  let req = requestLogger.requests[0].request; // interact
  let params = decodeUrlEncodedRequestBody(req.body);
  await t.expect(req.url).eql('http://localhost:3000/oauth2/default/v1/interact');
  await t.expect(params['recovery_token']).eql(recoveryToken);
  await checkConsoleMessages([
    'ready',
    'afterRender',
    expectResetPasswordView
  ]);
  requestLogger.clear();
  await pageObject.clickSignOutLink();
  // TODO this is calling /cancel but not also /interact in v3. Might be good but
  // not sure if it _should_ call interact actually when there is
  // a recovery token
  req = requestLogger.requests[0].request; // interact
  params = decodeUrlEncodedRequestBody(req.body);
  await t.expect(req.url).eql('http://localhost:3000/oauth2/default/v1/interact');
  await t.expect(params['recovery_token']).eql(undefined);
});

// TODO: afterRender being called too early
test.meta('v3', false).requestHooks(requestLogger, errorInvalidRecoveryTokenMock)('shows an error when recovery token is invalid', async t => {
  await setup(t);

  const terminalPageObject = new TerminalPageObject(t);
  const errors = terminalPageObject.getErrorMessages();
  await t.expect(errors.isError()).ok();
  await t.expect(errors.getTextContent()).eql('The recovery token is invalid.');

  await checkConsoleMessages([
    'ready',
    'afterRender',
    expectTerminalView
  ]);
});