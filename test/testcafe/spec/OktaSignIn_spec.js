import { ClientFunction, RequestMock, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { checkConsoleMessages } from '../framework/shared';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword);

const hideWidget = ClientFunction(() => {
  // function `getWidgetInstance` is defined in playground/main.js
  window.getWidgetInstance().hide();
});

const showWidget = ClientFunction(() => {
  // function `getWidgetInstance` is defined in playground/main.js
  window.getWidgetInstance().show();
});

const renderHiddenWidget = ClientFunction(({v3}) => {
  // functions `renderPlaygroundWidget` and `getWidgetInstance` are defined in playground/main.js
  window.renderPlaygroundWidget();
  if (v3) {
    // TODO: call `hide()` on `ready` event after OKTA-637702
    window.getWidgetInstance().hide();
  } else {
    window.getWidgetInstance().on('ready', () => {
      window.getWidgetInstance().hide();
    });
  }
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
  window.getWidgetInstance().on('afterRender', (ctx) => {
    window.console.log(JSON.stringify({ afterRender: 2 }));
  });
});

const renderAndAddAfterReadyEventListener = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);

  // Add 'afterRender' event listeners with argument
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

fixture('OktaSignIn')
  .meta('v3', true);

async function setup(t, options) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options);
  return identityPage;
}

test.requestHooks(identifyMock)('should hide and show with corresponding methods', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await t.expect(identityPage.isVisible()).eql(true);
  await hideWidget();
  await t.expect(identityPage.isVisible()).eql(false);
  await showWidget();
  await t.expect(identityPage.isVisible()).eql(true);
});

test.requestHooks(identifyMock)('can render initially hidden widget', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await renderHiddenWidget(userVariables);
  await t.expect(identityPage.isVisible()).eql(false);
  await showWidget();
  await t.expect(identityPage.isVisible()).eql(true);
});

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
