import { RequestMock } from 'testcafe';
import UiDemoPageObject from '../framework/page-objects/UiDemoPageObject';
import uiDemoResponse from '../../../playground/mocks/data/idp/idx/_ui-demo.json';
import { renderWidget } from '../framework/shared';

import compareScreenshot from '../../../vrtUtil/vrtUtil';

const uiDemoMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(uiDemoResponse);

async function setup(t) {
  const pageObject = new UiDemoPageObject(t);
  await pageObject.navigateToPage();
  await t.expect(pageObject.formExists()).eql(true);
  return pageObject;
}

async function setupRtl(t) {
  const pageObject = new UiDemoPageObject(t);
  await pageObject.navigateToPage();
  await renderWidget({
    language: 'ar',
  });
  await t.expect(pageObject.formExists()).eql(true, 'form loaded', { timeout: 20000 });
  return pageObject;
}

fixture('UI demo').meta('gen3', false).meta('gen2', false);

test.requestHooks(uiDemoMock)('UI demo VRT', async t => {
  const pageObject = await setup(t);

  // freeze the spinner element so screenshots are consistent
  await pageObject.stopSpinnerAnimation();

  await compareScreenshot(t, { fullPage: true, strictMode: true });
});

test.requestHooks(uiDemoMock)('UI demo RTL VRT', async t => {
  const pageObject = await setupRtl(t);
  // freeze the spinner element so screenshots are consistent
  await pageObject.stopSpinnerAnimation();

  await compareScreenshot(t, { fullPage: true, strictMode: true });
});
