import { ClientFunction, RequestMock } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import xhrAuthenticatorEnrollDataPhone from '../../../playground/mocks/data/idp/idx/authenticator-enroll-data-phone';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollDataPhone);


fixture('BYOL (Bring Your Own Language)');

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const overrideNavigatorLanguages = ClientFunction(languages => {
  delete window.navigator;
  window.navigator = {
    languages
  };
});

async function setup(t, options = {}) {
  const pageObject = new BasePageObject(t);
  await pageObject.navigateToPage({ render: false });

  if (options.navigatorLanguages) {
    await overrideNavigatorLanguages(options.navigatorLanguages);
  }

  // Render the widget for interaction code flow
  await pageObject.mockCrypto();
  await renderWidget({
    stateToken: 'abc',
    ...options
  });

  return pageObject;
}

test.requestHooks(mock)('unsupported language, set with "language" option, is not loaded by default', async t => {
  const pageObject = await setup(t, {
    language: 'foo'
  });

  // Check title (login_foo.json)
  await t.expect(pageObject.getFormTitle()).eql('Set up phone authentication');

  // Check country dropdown (country_foo.json)
  const selectOption = await pageObject.form.findFormFieldInput('country')
    .find('.chzn-container > .chzn-single > span');

  await t.expect(pageObject.getTextContent(selectOption))
    .eql('United States');

});

test.requestHooks(mock)('unsupported language, set with "language" option, can be loaded when assets.baseUrl is set to a path containing the language assets', async t => {
  const pageObject = await setup(t, {
    language: 'foo',
    assets: {
      baseUrl: '/mocks'
    }
  });

  // Check title (login_foo.json)
  await t.expect(pageObject.getFormTitle()).eql('Set up foo authentication');

  // Check country dropdown (country_foo.json)
  const selectOption = await pageObject.form.findFormFieldInput('country')
    .find('.chzn-container > .chzn-single > span');

  await t.expect(pageObject.getTextContent(selectOption))
    .eql('Foonited States');

});


test.requestHooks(mock)('unsupported language from navigator.languages will not load by default, even with assets.baseUrl set to a path containing the language assets', async t => {
  const pageObject = await setup(t, {
    navigatorLanguages: ['foo'],
    assets: {
      baseUrl: '/mocks'
    }
  });

  // Check title (login_foo.json)
  await t.expect(pageObject.getFormTitle()).eql('Set up phone authentication');

  // Check country dropdown (country_foo.json)
  const selectOption = await pageObject.form.findFormFieldInput('country')
    .find('.chzn-container > .chzn-single > span');

  await t.expect(pageObject.getTextContent(selectOption))
    .eql('United States');

});

test.requestHooks(mock)('unsupported language from navigator.languages will load with assets.baseUrl and assets.languages set', async t => {
  const pageObject = await setup(t, {
    navigatorLanguages: ['foo'],
    assets: {
      baseUrl: '/mocks',
      languages: [
        'foo'
      ]
    }
  });

  // Check title (login_foo.json)
  await t.expect(pageObject.getFormTitle()).eql('Set up foo authentication');

  // Check country dropdown (country_foo.json)
  const selectOption = await pageObject.form.findFormFieldInput('country')
    .find('.chzn-container > .chzn-single > span');

  await t.expect(pageObject.getTextContent(selectOption))
    .eql('Foonited States');

});
