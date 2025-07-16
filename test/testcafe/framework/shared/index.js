import { t, ClientFunction } from 'testcafe';
import { RequestMock as TestCafeRequestMock } from 'testcafe';
import xhrInteract from '../../../../playground/mocks/data/oauth2/interact.json';
import xhrWellknownOpenidConfiguration from '../../../../playground/mocks/data/oauth2/well-known-openid-configuration.json';

export const READY_MESSAGE = '===== playground widget ready event received =====';
export const AFTER_RENDER_MESSAGE = '===== playground widget afterRender event received =====';
export const AFTER_ERROR_MESSAGE = '===== playground widget afterError event received =====';

/**
 * Console messages matching these patterns are filtered out before checking
 * against context. Use this to exclude messages logged by dependencies and
 * devtools
 */
export const LOG_IGNORE_PATTERNS = [
  // example: console.log('[DEBUG]', {foo: 'baz'});
  /\[DEBUG\]/,

  // log from webpack-dev-server
  /\[webpack-dev-server\]/,

  // log from webpack hot module reload
  /\[HMR\]/,

  // log from msw
  /\[MSW-Wrapper\]/,
];

/**
 * Use this function to generate the string to be injected using `clientScripts` in the
 * testcafe test configuration:
 *
 * test
 *   .clientScripts(overrideWidgetOptions({
*      // widget options to override
 *   }))
 *   .requestHooks(logger, mock)('test name', asynct t => {
 *     // test code
 *   });
 *
 * @param {Partial<WidgetOptions>} widgetOptionOverrides
 * @returns {string}
 */
export const overrideWidgetOptions = (widgetOptionOverrides) => ({
  content: `window.additionalOptions = ${JSON.stringify(widgetOptionOverrides)};`,
});

export const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

export const logI18nErrorsToConsole = ClientFunction(() => {
  document.addEventListener('okta-i18n-error', (ev) => {
    console.warn(JSON.stringify(ev.detail));
  });
});

export async function checkI18nErrors(expectedErrors = []) {
  const { warn } = await t.getBrowserConsoleMessages();
  const i18nErrors = warn
    .filter((msg) => msg.includes('l10n-error'))
    .map((msg) => JSON.parse(msg));
  console.assert(
    i18nErrors.length === expectedErrors.length,
    JSON.stringify({ i18nErrors, expectedErrors }, null, 2)
  );
  await t.expect(i18nErrors.length).eql(expectedErrors.length);
  for (let i = 0; i < expectedErrors.length; i++) {
    await t.expect(i18nErrors[i]).eql(expectedErrors[i]);
  }
}

// Centralized console log assertion for verifying:
// 1. Widget is ready to accept user input for the first time (ready)
// 2. Widget transitions to a new page and animations have finished (afterRender)
// 3. Context object from the 'afterReady' event
export async function checkConsoleMessages(context = {}) {
  if (!Array.isArray(context)) {
    context = ['ready', 'afterRender', context];
  }
  let { log } = await t.getBrowserConsoleMessages();
  log = log.filter((msg) => LOG_IGNORE_PATTERNS.every(rx => !rx.test(msg)));
  console.assert(log.length === context.length, JSON.stringify({ log, context }, null, 2));
  await t.expect(log.length).eql(context.length);

  for (let i = 0; i < context.length; i++) {
    switch (context[i]) {
    case 'ready':
      await t.expect(log[i]).eql(READY_MESSAGE);
      break;
    case 'afterRender':
      await t.expect(log[i]).eql(AFTER_RENDER_MESSAGE);
      break;
    case 'afterError':
      await t.expect(log[i]).eql(AFTER_ERROR_MESSAGE);
      break;
    default: {
      /* eslint max-depth: [2, 3] */
      const parsedLog = JSON.parse(log[i]);
      if (context[i].status === 'SUCCESS') {
        await t.expect(parsedLog.status).eql('SUCCESS');
        await t.expect(parsedLog.tokens.accessToken.accessToken).eql(context[i].accessToken);
        await t.expect(parsedLog.tokens.idToken.idToken).eql(context[i].idToken);
      } else {
        await t.expect(parsedLog).eql(context[i]);
      }
    }
    }
  }
}

export const Constants = {
  // https://devexpress.github.io/testcafe/documentation/guides/concepts/built-in-wait-mechanisms.html#wait-mechanism-for-xhr-and-fetch-requests
  TESTCAFE_DEFAULT_AJAX_WAIT: 3000, // 3seconds
};

export const getStateHandleFromSessionStorage = ClientFunction(() => {
  return window.sessionStorage.getItem('osw-oie-state-handle');
});

export function getAuthJSVersion() {
  const JSON = require('@okta/okta-auth-js/package.json');
  return JSON.version;
}

export async function assertRequestMatches(loggedRequest, url, method, body) {
  let { request } = loggedRequest;
  await t.expect(request.url).eql(url);
  if (method) {
    await t.expect(request.method).eql(method);
  }
  if (body) {
    const requestBody = JSON.parse(request.body);

    await t.expect(requestBody).eql(body);
  }
}

// eslint-disable-next-line @okta/okta/no-unlocalized-text-in-templates
export const oktaDashboardContent = `
  <h1 id="mock-user-dashboard-title">Mock User Dashboard</h1>
  <h2>Query parameters</h2>
  <a href="/">Back to Login</a>
`;

// eslint-disable-next-line @okta/okta/no-unlocalized-text-in-templates
export const mockDuoIframeHtml = `
  <html>
  <body style="border: 1px solid #62b245; padding: 20px; text-align: center;">
    <p>Duo Mock iFrame</p>
    <a href="#" id="duoVerifyLink">Continue</a>
  </body>
  </html>
`;

/**
 * Provides mock responses for common endpoints. Use this export instead of
 * importing from "testcafe" directly to avoid falling back to Express mock server
 * for these requests.
 */
export const RequestMock = (...args) => TestCafeRequestMock(...args)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteract)
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellknownOpenidConfiguration);
