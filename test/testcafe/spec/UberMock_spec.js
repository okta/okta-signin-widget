import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { checkConsoleMessages } from '../framework/shared';
import UiDemoPageObject from '../framework/page-objects/UiDemoPageObject';
import uiDemoResponse from '../../../playground/mocks/data/idp/idx/_ui-demo.json';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const uiDemoMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(uiDemoResponse);

async function setup(t) {
  const pageObject = new UiDemoPageObject(t);
  await pageObject.navigateToPage();

  return pageObject;
}

fixture('UI demo');

test
  .requestHooks(logger, uiDemoMock)('load ui demo response', async t => {
    const pageObject = await setup(t);
    const getClientHeight = ClientFunction(() => window.document.documentElement.clientHeight);

    // await checkA11y(t);
    await t.customActions.vrt('one');
    const windowheight = await getClientHeight();

    await t.scrollBy(0, windowheight);
    await t.customActions.vrt('two');

    await t.scrollBy(0, windowheight);
    await t.customActions.vrt('three');

    await t.scrollBy(0, windowheight);
    await t.customActions.vrt('four');

    // await t.expect(pageObject.getFormTitle()).eql('Set up YubiKey');
    // await t.expect(pageObject.getFormSubtitle()).eql('Use your YubiKey to insert a verification code.');

    // await t.expect(pageObject.getFormTitle()).eql('Set up YubiKey');
    // await t.expect(pageObject.getFormSubtitle()).eql('Use your YubiKey to insert a verification code.');
    
    // // Fill out form and submit
    // await pageObject.verifyFactor('credentials.passcode', '1234');
    // await pageObject.clickEnrollButton();

    // const pageUrl = await pageObject.getPageUrl();
    // await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });
