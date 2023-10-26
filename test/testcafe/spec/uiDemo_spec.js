import { RequestMock } from 'testcafe';
import UiDemoPageObject from '../framework/page-objects/UiDemoPageObject';
import uiDemoResponse from '../../../playground/mocks/data/idp/idx/_ui-demo.json';

const uiDemoMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(uiDemoResponse);

async function setup(t) {
  const pageObject = new UiDemoPageObject(t);
  await pageObject.navigateToPage();
  await t.expect(pageObject.formExists()).eql(true);
  return pageObject;
}

fixture('UI demo');

test
  .requestHooks(uiDemoMock)('UI demo VRT', async t => {
    const pageObject = await setup(t);

    // freeze the spinner element so screenshots are consistent
    await pageObject.stopSpinnerAnimation();

    await t.customActions.vrt('one');
    await pageObject.scrollToNextPage();

    // possible bug in testcafe where the animated progress bar at the bottom is displaying after scrolling
    // causing inconsistent screenshots
    await pageObject.hideProgressBar();

    await t.customActions.vrt('two');
    await pageObject.scrollToNextPage();

    await t.customActions.vrt('three');
    await pageObject.scrollToNextPage();

    await t.customActions.vrt('four');
  });
