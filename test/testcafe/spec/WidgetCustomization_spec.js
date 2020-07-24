import { ClientFunction, RequestMock } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrSelectAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator.json';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword);

  const xhrSelectAuthenticatorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticator);

const rerenderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

fixture(`Custom widget attributes`);
async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

async function setupSelectAuthenticator(t) {
  const selectAuthenticatorPageObject = new SelectFactorPageObject(t);
  await selectAuthenticatorPageObject.navigateToPage();
  return selectAuthenticatorPageObject;
}

test.requestHooks(identifyMock)(`should show custom footer links`, async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    "helpLinks": {
      "help": "https://google.com",
      "forgotPassword": "https://okta.okta.com/signin/forgot-password",
      "custom": [
        {
          "text": "What is Okta?",
          "href": "https://acme.com/what-is-okta"
        },
        {
          "text": "Acme Portal",
          "href": "https://acme.com",
          "target": "_blank"
        }
      ]
    },
    "signOutLink": "https://okta.okta.com/",
  });
  await t.expect(identityPage.getCustomForgotPasswordLink()).eql('https://okta.okta.com/signin/forgot-password');
  await t.expect(identityPage.getCustomHelpLink()).eql('https://google.com');
  await t.expect(identityPage.getCustomHelpLinks(0)).eql('https://acme.com/what-is-okta');
  await t.expect(identityPage.getCustomHelpLinks(1)).eql('https://acme.com');
  await t.expect(identityPage.getCustomHelpLinksLabel(0)).eql('What is Okta?');
  await t.expect(identityPage.getCustomHelpLinksLabel(1)).eql('Acme Portal');
});

test.requestHooks(xhrSelectAuthenticatorMock)(`should show custom signout link`, async t => {
  // setup selectAuthenticatorPageObject to see the signout link
  const selectAuthenticatorPageObject = await setupSelectAuthenticator(t);
  await rerenderWidget({
    "helpLinks": {
      "help": "https://google.com",
      "forgotPassword": "https://okta.okta.com/signin/forgot-password",
      "custom": [
        {
          "text": "What is Okta?",
          "href": "https://acme.com/what-is-okta"
        },
        {
          "text": "Acme Portal",
          "href": "https://acme.com",
          "target": "_blank"
        }
      ]
    },
    "signOutLink": "https://okta.okta.com/",
  });
  await t.expect(selectAuthenticatorPageObject.getCustomSignOutLink()).eql('https://okta.okta.com/');
});

test.requestHooks(identifyMock)(`should show custom buttons links`, async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    "customButtons" : [{
      'title': 'Custom Button 1',
      'className': 'btn-customAuth-1',
      'click': function () {
        window.location.href = 'http://www.example.com/';
      }
    },
    {
      'title': 'Custom Button 2',
      'className': 'btn-customAuth-1',
      'click': function () {
        window.location.href = 'http://www.example2.com/';
      }
    }]
  });
  await t.expect(identityPage.getCustomButtonText(0)).eql('Custom Button 1');
  await t.expect(identityPage.getCustomButtonText(1)).eql('Custom Button 2');

  await identityPage.clickCustomButtonLink(0);
  const pageUrl = await identityPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://www.example.com/');
});