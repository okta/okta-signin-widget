import { t, ClientFunction, Selector } from 'testcafe';
import { HtmlValidate } from 'html-validate';
import HtmlValidateConfig from '../../../../.htmlvalidate.json';

const LOG_HTML_VALIDATE_MESSAGES = true;

export async function getInnerHTML(selector) {
  const sel = Selector(selector).addCustomDOMProperties({
    innerHTML: el => el.innerHTML
  });
  const html = await sel.innerHTML;
  return html;
}

export async function assertValidHTML() {
  const widgetHTML = await getInnerHTML('#okta-login-container');
  const htmlvalidate = new HtmlValidate(HtmlValidateConfig);
  const report = htmlvalidate.validateString(widgetHTML);
  const messages = report.results.reduce((msgs, cur) => {
    return msgs.concat(cur.messages);
  }, []);
  let message;
  for (let i = 0; i < messages.length; i++) {
    message = messages[i];
    if (LOG_HTML_VALIDATE_MESSAGES) {
      console.log('HTML validate message: ', message);
    }
    if (message.severity >=2) { // error
      throw new Error(`HTML validate error: ${message.message} ${message.ruleId} ${message.ruleUrl}`);
    }

  }
}

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
