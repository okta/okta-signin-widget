import { RequestMock } from 'testcafe';
import UiDemoPageObject from '../framework/page-objects/UiDemoPageObject';
import uiDemoResponse from '../../../playground/mocks/data/idp/idx/_ui-demo.json';

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

fixture('UI demo').meta('gen3', false).meta('gen2', false);

test
  .requestHooks(uiDemoMock)('UI demo VRT', async t => {
    const pageObject = await setup(t);

    // freeze the spinner element so screenshots are consistent
    await pageObject.stopSpinnerAnimation();

    await compareScreenshot(t, '1', { fullPage: true, strictMode: true });
    // // this method scrolls down the height of the window to capture screenshots further down the page
    // await pageObject.scrollToNextPage();

    // // possible bug in testcafe where the animated progress bar at the bottom is displaying after scrolling
    // // causing inconsistent screenshots
    // await pageObject.hideProgressBar();

    // await compareScreenshot(t, '2');
    // await pageObject.scrollToNextPage();

    // await compareScreenshot(t, '3');
    // await pageObject.scrollToNextPage();

    // await compareScreenshot(t, '4');
  });
