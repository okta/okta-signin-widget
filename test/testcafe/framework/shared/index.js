import {t, ClientFunction} from 'testcafe';
import {checkForViolations} from '@testcafe-community/axe';

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

export const a11yCheck = async (t) => {
  await checkForViolations(t,
    {
      include: [['#okta-login-container']]
    },
    {
      rules: {'document-title': {enabled: false}},
      runOnly: ['section508', 'wcag21a', 'wcag21aa'],
    },
  );
};