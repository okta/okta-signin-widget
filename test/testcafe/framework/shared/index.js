import { t, ClientFunction } from 'testcafe';

export const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

// Centralized console log assertion for verifying:
// 1. Widget is ready to accept user input for the first time (ready)
// 2. Widget transitions to a new page and animations have finished (afterRender)
// 3. Context object from the 'afterReady' event 
export async function checkConsoleMessages(context = {}) {
  if (!Array.isArray(context)) {
    context = ['ready', 'afterRender', context];
  }

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(context.length);
  for (let i = 0; i < context.length; i++) {
    switch (context[i]) {
    case 'ready':
      await t.expect(log[i]).eql('===== playground widget ready event received =====');
      break;
    case 'afterRender':
      await t.expect(log[i]).eql('===== playground widget afterRender event received =====');
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
