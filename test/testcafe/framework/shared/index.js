import { t, ClientFunction } from 'testcafe';
import { RequestMock as TestCafeRequestMock } from 'testcafe';
import xhrInteract from '../../../../playground/mocks/data/oauth2/interact.json';
import xhrWellknownOpenidConfiguration from '../../../../playground/mocks/data/oauth2/well-known-openid-configuration.json';

const READY_MESSAGE = '===== playground widget ready event received =====';
const AFTER_RENDER_MESSAGE = '===== playground widget afterRender event received =====';

/**
 * Console messages matching these patterns are filtered out before checking
 * against context. Use this to exclude messages logged by dependencies and
 * devtools
 */
const LOG_IGNORE_PATTERNS = [
  /\[HMR\]/,
  /\[MSW-Wrapper\]/,
];

export const renderWidget = ClientFunction((settings) => {
  // @ts-ignore
  window.renderPlaygroundWidget(settings);
});

// Centralized console log assertion for verifying:
// 1. Widget is ready to accept user input for the first time (ready)
// 2. Widget transitions to a new page and animations have finished (afterRender)
// 3. Context object from the 'afterReady' event
export async function checkConsoleMessages(context = {}) {
  const ctx = !Array.isArray(context)
    ? ['ready', 'afterRender', context]
    : context;

  let { log } = await t.getBrowserConsoleMessages();
  log = log.filter((msg) => LOG_IGNORE_PATTERNS.every(rx => !rx.test(msg)));

  await t.expect(log.length).eql(ctx.length);

  for (let i = 0; i < ctx.length; i++) {
    switch (ctx[i]) {
    case 'ready':
      await t.expect(log[i]).eql(READY_MESSAGE);
      break;
    case 'afterRender':
      await t.expect(log[i]).eql(AFTER_RENDER_MESSAGE);
      break;
    default: {
      /* eslint max-depth: [2, 3] */
      const parsedLog = JSON.parse(log[i]);
      if (ctx[i].status === 'SUCCESS') {
        await t.expect(parsedLog.status).eql('SUCCESS');
        await t.expect(parsedLog.tokens.accessToken.accessToken).eql(ctx[i].accessToken);
        await t.expect(parsedLog.tokens.idToken.idToken).eql(ctx[i].idToken);
      } else {
        await t.expect(parsedLog).eql(ctx[i]);
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const JSON = require('@okta/okta-auth-js/package.json');
  return JSON.version;
}

export async function assertRequestMatches(loggedRequest, url, method, body) {
  const { request } = loggedRequest;
  await t.expect(request.url).eql(url);
  if (method) {
    await t.expect(request.method).eql(method);
  }
  if (body) {
    const requestBody = JSON.parse(request.body);

    await t.expect(requestBody).eql(body);
  }
}

/**
 * Provides mock responses for common endpoints. Use this export instead of
 * importing from "testcafe" directly to avoid falling back to dyson mock server
 */
export const RequestMock = () => TestCafeRequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteract)
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellknownOpenidConfiguration);
