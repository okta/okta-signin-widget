import { RequestMock } from 'testcafe';
import UiDemoPageObject from '../framework/page-objects/UiDemoPageObject';
import uiDemoResponse from '../../../playground/mocks/data/idp/idx/_ui-demo.json';
import { renderWidget } from '../framework/shared';

import compareScreenshot from '../../../vrtUtil/vrtUtil';

const uiDemoMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(uiDemoResponse)
  // .onRequestTo('http://localhost:3000/mocks/labels/json/login_ar.json')
  // .respond({ 'oie.phone.enroll.title': 'Set up foo authentication' })
  // .onRequestTo('http://localhost:3000/mocks/labels/json/country_ar.json')
  // .respond({ 'US': 'Foonited States' })
  // .onRequestTo('http://localhost:3000/labels/json/login_ar.json')
  // .respond(null, 404)
  // .onRequestTo('http://localhost:3000/labels/json/country_ar.json')
  // .respond(null, 404)

  // // Hostname is not set/available in node env, so requests to "/" are not
  // // made relative to the location.href. This issue exists in tests only, i.e.,
  // // it has no equivalent in prod. NOTE: Not providing these mocks cause the
  // // test to hang indefinitely and time out when assertionTimeout is exceeded.
  .onRequestTo('http://labels/json/login_ar.json')
  .respond(null, 404)
  .onRequestTo('http://labels/json/country_ar.json')
  .respond(null, 404);

async function setup(t) {
  const pageObject = new UiDemoPageObject(t);
  await pageObject.navigateToPage();
  await t.expect(pageObject.formExists()).eql(true);
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
  const pageObject = await setup(t);
  await renderWidget({
    language: 'ar',
  });
  await t.expect(pageObject.formExists()).eql(true);

  // freeze the spinner element so screenshots are consistent
  await pageObject.stopSpinnerAnimation();

  await compareScreenshot(t, { fullPage: true, strictMode: true });
});
