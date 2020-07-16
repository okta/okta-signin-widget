import { ClientFunction, RequestMock, RequestLogger } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify);

const rerenderWidget = ClientFunction(() => {
  // function `renderPlaygroundWidget` is defined at playground/main.js
  window.renderPlaygroundWidget({
    'helpLinks': {
      custom: [
        {
          text: 'What is Okta?',
          href: 'https://acme.com/what-is-okta'
        },
        {
          text: 'Acme Portal',
          href: 'https://acme.com',
          target: '_blank'
        }
      ]
    }
  });

});

fixture(`Identify Form - customized widget`);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

test.requestHooks(identifyMock)(`should show errors if required fields are empty`, async t => {
  const identityPage = await setup(t);
  await rerenderWidget();

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasIdentifierError()).eql(true);
  await t.expect(identityPage.hasIdentifierErrorMessage()).eql(true);
});
