import { ClientFunction, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { checkConsoleMessages, RequestMock } from '../framework/shared';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrSuccessTokens from '../../../playground/mocks/data/oauth2/success-tokens';
import xhrSuccessWithInteractionCode from '../../../playground/mocks/data/idp/idx/success-with-interaction-code';
import xhrInternalServerError from '../../../playground/mocks/data/idp/idx/error-internal-server-error';
import xhrOAuthError from '../../../playground/mocks/data/idp/idx/error-feature-not-enabled';
import xhrTerminalRegistration from '../../../playground/mocks/data/idp/idx/terminal-registration';
import { oktaDashboardContent } from '../framework/shared';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword);

const identifySuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const identifySuccessWithInteractionCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrSuccessWithInteractionCode)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/token')
  .respond(xhrSuccessTokens);

const introspectErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrInternalServerError, 403);

const introspectOAuthErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrOAuthError, 400);

const introspectTerminal = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrTerminalRegistration);

const identifyErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrInternalServerError, 403);

const identifyTerminal = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrTerminalRegistration);

const identifyErrorUnsupportedResponse = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond('error-unsupported-idx-response', 403);


// Client functions
const hideWidget = ClientFunction(() => {
  // function `getWidgetInstance` is defined in playground/main.js
  window.getWidgetInstance().hide();
});

const showWidget = ClientFunction(() => {
  // function `getWidgetInstance` is defined in playground/main.js
  window.getWidgetInstance().show();
});

const renderHiddenWidget = ClientFunction(() => {
  // functions `renderPlaygroundWidget` and `getWidgetInstance` are defined in playground/main.js
  window.renderPlaygroundWidget();
  window.getWidgetInstance().on('ready', () => {
    window.getWidgetInstance().hide();
  });
});

const renderAndAddEventListeners = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);

  // Add 2 'ready' event listeners
  window.getWidgetInstance().on('ready', () => {
    window.console.log(JSON.stringify({ ready: 1 }));
  });
  window.getWidgetInstance().on('ready', () => {
    window.console.log(JSON.stringify({ ready: 2 }));
  });
  // Add 2 'afterRender' event listeners
  window.getWidgetInstance().on('afterRender', () => {
    window.console.log(JSON.stringify({ afterRender: 1 }));
  });
  window.getWidgetInstance().on('afterRender', () => {
    window.console.log(JSON.stringify({ afterRender: 2 }));
  });
});

const renderAndAddAfterReadyEventListener = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);

  // Add 'afterRender' event listener with argument
  window.getWidgetInstance().on('afterRender', (ctx) => {
    window.console.log(JSON.stringify({
      afterRender: 1,
      ctx,
    }));
  });
});

const renderAndRemoveAfterRenderEventListener = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);

  // Subscribe and unsubscribe from 'afterRender' event
  const handler = (ctx) => {
    window.console.log(JSON.stringify({ afterRender: 1, ctx }));
  };
  window.getWidgetInstance().on('afterRender', handler);
  window.getWidgetInstance().off('afterRender', handler);
});

const renderAndRemoveReadyEventListeners = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);

  // Remove all 'ready' event listeners
  window.getWidgetInstance().on('ready', () => {});
  window.getWidgetInstance().off('ready');
});

const renderAndRemoveAllEventListeners = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);

  // Remove all event listeners
  window.getWidgetInstance().off();
});

const renderAndAddEventListenerWithError = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);

  // Add 'afterRender' event listener which throws an error
  window.getWidgetInstance().on('ready', () => {
    throw new Error('TEST ERROR');
  });
});

const renderAndAddBeforeHook = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
  window.getWidgetInstance().before('identify', () => {
    window.console.log(JSON.stringify({ before: 'identify' }));
  });
});

const renderAndAddBeforeAndAfterHooksForTerminal = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
  window.getWidgetInstance().before('terminal', () => {
    window.console.log(JSON.stringify({ before: 'terminal' }));
  });
  window.getWidgetInstance().after('terminal', () => {
    window.console.log(JSON.stringify({ after: 'terminal' }));
  });
  window.getWidgetInstance().before('identify', () => {
    window.console.log(JSON.stringify({ before: 'identify' }));
  });
  window.getWidgetInstance().after('identify', () => {
    window.console.log(JSON.stringify({ after: 'identify' }));
  });
});

const renderAndAddBeforeAndAfterHooksForSuccess = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
  window.getWidgetInstance().before('identify', () => {
    window.console.log(JSON.stringify({ before: 'identify' }));
  });
  window.getWidgetInstance().after('identify', () => {
    window.console.log(JSON.stringify({ after: 'identify' }));
  });
  window.getWidgetInstance().before('success-redirect', () => {
    window.console.log(JSON.stringify({ before: 'success-redirect' }));
  });
  window.getWidgetInstance().after('success-redirect', () => {
    window.console.log(JSON.stringify({ after: 'success-redirect' }));
  });
  window.getWidgetInstance().before('cancel', () => {
    window.console.log(JSON.stringify({ before: 'cancel' }));
  });
  window.getWidgetInstance().after('cancel', () => {
    window.console.log(JSON.stringify({ after: 'cancel' }));
  });
});

const renderAndAddAsyncBeforeHooks = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);

  function createAsyncHook(callbackBeforeTimeout, callbackAfterTimeout, waitTimeMs = 10) {
    return () => {
      callbackBeforeTimeout?.();
      return new Promise(resolve => {
        setTimeout(() => {
          callbackAfterTimeout?.();
          resolve(true);
        }, waitTimeMs);
      });
    };
  }

  window.getWidgetInstance().before('identify', createAsyncHook(() => {
    window.console.log(JSON.stringify({ before: 'identify', timer: 'before', no: 1 }));
  }, () => {
    window.console.log(JSON.stringify({ before: 'identify', timer: 'after', no: 1 }));
  }));

  window.getWidgetInstance().before('identify', createAsyncHook(() => {
    window.console.log(JSON.stringify({ before: 'identify', timer: 'before', no: 2 }));
  }, () => {
    window.console.log(JSON.stringify({ before: 'identify', timer: 'after', no: 2 }));
  }));
});


fixture('OktaSignIn');

async function setup(t, options) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options);
  if (options?.render !== false) {
    await t.expect(identityPage.formExists()).ok();
  }
  return identityPage;
}

// hide, show
test.requestHooks(identifyMock)('should hide and show with corresponding methods', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await t.expect(identityPage.isVisible()).eql(true);
  await hideWidget();
  await t.expect(identityPage.isVisible()).eql(false);
  await showWidget();
  await t.expect(identityPage.formExists()).ok();
  await t.expect(identityPage.isVisible()).eql(true);
});

test.requestHooks(identifyMock)('can render initially hidden widget', async t => {
  const identityPage = await setup(t, { render: false });
  await renderHiddenWidget(userVariables);
  await t.expect(identityPage.isVisible()).eql(false);
  await showWidget();
  await t.expect(identityPage.formExists()).ok();
  await checkA11y(t);
  await t.expect(identityPage.isVisible()).eql(true);
});

// on, off
test.requestHooks(identifyMock)('can add 2+ event listeners with .on(), should be executed in the subscribe order', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddEventListeners();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    'ready',
    // order should be preserved
    { ready: 1 },
    { ready: 2 },
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
      authenticatorKey: 'okta_password',
      methodType: 'password',
    },
    { afterRender: 1 },
    { afterRender: 2 },
  ], t);
});

test.requestHooks(identifyMock)('event listeners should receive arguments', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddAfterReadyEventListener();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
      authenticatorKey: 'okta_password',
      methodType: 'password',
    },
    {
      afterRender: 1,
      // argument
      ctx: {
        controller: 'primary-auth',
        formName: 'identify',
        authenticatorKey: 'okta_password',
        methodType: 'password',
      }
    },
  ], t);
});

test.requestHooks(identifyMock)('can remove event listeners by event name and handler with .off(event, handler)', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndRemoveAfterRenderEventListener();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    'ready',
    // no other 'ready' events
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
      authenticatorKey: 'okta_password',
      methodType: 'password',
    },
  ], t);
});

test.requestHooks(identifyMock)('can remove event listeners by event name with .off(event)', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndRemoveReadyEventListeners();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    // no 'ready' events
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
      authenticatorKey: 'okta_password',
      methodType: 'password',
    },
  ], t);
});

test.requestHooks(identifyMock)('can remove all event listeners with .off()', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndRemoveAllEventListeners();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    // no events
  ], t);
});

test.requestHooks(identifyMock)('should trap error thrown by event listener', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddEventListenerWithError();
  await t.expect(identityPage.formExists()).eql(true);
  const { error } = await t.getBrowserConsoleMessages();
  await t.expect(error.includes('[okta-signin-widget] "ready" event handler error: Error: TEST ERROR')).ok();
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
      authenticatorKey: 'okta_password',
      methodType: 'password',
    },
  ], t);
});

// before, after hooks
test.requestHooks(identifyMock)('should execute "before" hook before "afterRender" event', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddBeforeHook();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
      authenticatorKey: 'okta_password',
      methodType: 'password',
    },
  ], t);
});

test.requestHooks(identifyMock)('should execute async "before" hooks sequentially before "afterRender" event', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddAsyncBeforeHooks();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    {
      before: 'identify',
      timer: 'before',
      no: 1,
    },
    {
      before: 'identify',
      timer: 'after',
      no: 1,
    },
    {
      before: 'identify',
      timer: 'before',
      no: 2,
    },
    {
      before: 'identify',
      timer: 'after',
      no: 2,
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
      authenticatorKey: 'okta_password',
      methodType: 'password',
    },
  ], t);
});

test.requestHooks(identifySuccessMock)('should execute "before" and "after" hooks on form change', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddBeforeAndAfterHooksForSuccess();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
  ], t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
    {
      before: 'success-redirect',
    },
    'afterRender',
    {
      controller: null,
      formName: 'success-redirect',
    },
    {
      after: 'success-redirect',
    },
  ].filter(Boolean), t);
});

test.requestHooks(introspectTerminal)('should execute hooks for "terminal" form', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddBeforeAndAfterHooksForTerminal();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    {
      before: 'terminal',
    },
    {
      after: 'terminal',
    },
    'ready',
    'afterRender',
    {
      controller: null,
      formName: 'terminal',
    },
  ], t);
});

test.requestHooks(introspectErrorMock)('should execute hooks for "terminal" form (and not send "afterError" event) on initial error', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddBeforeAndAfterHooksForTerminal();
  await t.expect(identityPage.formExists()).eql(true);
  await identityPage.waitForErrorBox();
  await checkConsoleMessages([
    {
      before: 'terminal',
    },
    {
      after: 'terminal',
    },
    'ready',
    'afterRender',
    {
      controller: null,
      formName: 'terminal',
    },
  ], t);
});

test.requestHooks(introspectOAuthErrorMock)('should execute hooks for "terminal" form (and not send "afterError" event) on initial OAuth error', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddBeforeAndAfterHooksForTerminal();
  await t.expect(identityPage.formExists()).eql(true);
  await identityPage.waitForErrorBox();
  await checkConsoleMessages([
    {
      before: 'terminal',
    },
    {
      after: 'terminal',
    },
    'ready',
    'afterRender',
    {
      controller: null,
      formName: 'terminal',
    },
  ].filter(Boolean), t);
});

test.requestHooks(identifyErrorMock)('should send "afterError" event (and not execute hooks for "terminal" form) if submit results with error', async t => {
  const { gen3 } = userVariables;
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddBeforeAndAfterHooksForTerminal();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
  ], t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();
  await t.expect(identityPage.getErrorBoxText()).contains('Internal Server Error');
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
    'afterError',
    // gen2 and gen3 have different contexts
    gen3 ? {
      controller: null,
      formName: 'terminal',
    } : {
      controller: 'primary-auth',
      formName: 'identify',
    },
    {
      errorSummary: 'Internal Server Error',
      xhr: {
        responseJSON: {
          errorCauses: [],
          errorIntent: 'LOGIN',
          errorSummary: 'Internal Server Error',
          errorSummaryKeys: ['E0000009'],
        }
      }
    }
  ].filter(Boolean), t);
});

test.requestHooks(identifyErrorUnsupportedResponse)('should send "afterError" event (and not execute hooks for "terminal" form) if submit results with unsupported response', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddBeforeAndAfterHooksForTerminal();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
  ], t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
    'afterError',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
    {
      errorSummary: 'There was an unsupported response from server.',
      xhr: {
        responseJSON: {
          errorSummary: 'There was an unsupported response from server.',
        }
      }
    }
  ].filter(Boolean), t);
});

test.requestHooks(identifyTerminal)('should execute hooks for "terminal" form after submit', async t => {
  const identityPage = await setup(t, {render: false});
  await checkA11y(t);
  await renderAndAddBeforeAndAfterHooksForTerminal();
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
  ], t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  await t.expect(identityPage.getIdentifier()).contains('testUser@okta.com');
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
    {
      before: 'terminal',
    },
    'afterRender',
    {
      controller: null,
      formName: 'terminal',
    },
    {
      after: 'terminal',
    },
  ].filter(Boolean), t);
});

test.requestHooks(identifySuccessWithInteractionCodeMock)('should not execute "before" and "after" hooks in the end of interaction code flow', async t => {
  const optionsForInteractionCodeFlow = {
    clientId: 'fake',
    authParams: {
      ignoreSignature: true,
      pkce: true,
    },
    stateToken: undefined,
    authScheme: 'oauth2'
  };
  const identityPage = await setup(t, {render: false});
  await identityPage.mockCrypto();
  await t.setNativeDialogHandler(() => true);
  await checkA11y(t);
  await renderAndAddBeforeAndAfterHooksForSuccess(optionsForInteractionCodeFlow);
  await t.expect(identityPage.formExists()).eql(true);
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
  ], t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  await checkConsoleMessages([
    {
      before: 'identify',
    },
    {
      after: 'identify',
    },
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify',
    },
    {
      status: 'SUCCESS',
      accessToken: xhrSuccessTokens.access_token,
      idToken: xhrSuccessTokens.id_token
    }
  ].filter(Boolean), t);
});