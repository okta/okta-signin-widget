import { ClientFunction, RequestMock, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
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

fixture('OktaSignIn')
  .meta('v3', true);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
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
