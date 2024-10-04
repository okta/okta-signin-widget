import BYOLPageObject from '../framework/page-objects/BYOLPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import xhrAuthenticatorEnrollDataPhone from '../../../playground/mocks/data/idp/idx/authenticator-enroll-data-phone.json';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify.json';
import { ClientFunction, RequestMock } from 'testcafe';

const mockIdentify = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/mocks/labels/json/login_foo.json')
  .respond((_req, res) => {
    // delay should be > 200 (see timeout in loadLanguage util)
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = '200';
      res.headers['content-type'] = 'application/json';
      res.setBody({ 'primaryauth.title': 'Signin', 'primaryauth.submit': 'Submit' });
      resolve(res);
    }, 500));
  });

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollDataPhone)
  .onRequestTo('http://localhost:3000/mocks/labels/json/login_foo.json')
  .respond({ 'oie.phone.enroll.title': 'Set up foo authentication' })
  .onRequestTo('http://localhost:3000/mocks/labels/json/country_foo.json')
  .respond({ 'US': 'Foonited States' })
  .onRequestTo('http://localhost:3000/labels/json/login_foo.json')
  .respond(null, 404)
  .onRequestTo('http://localhost:3000/labels/json/country_foo.json')
  .respond(null, 404)

  // Hostname is not set/available in node env, so requests to "/" are not
  // made relative to the location.href. This issue exists in tests only, i.e.,
  // it has no equivalent in prod. NOTE: Not providing these mocks cause the
  // test to hang indefinitely and time out when assertionTimeout is exceeded.
  .onRequestTo('http://labels/json/login_foo.json')
  .respond(null, 404)
  .onRequestTo('http://labels/json/country_foo.json')
  .respond(null, 404);

fixture('BYOL (Bring Your Own Language)');

// NOTE: not rendering by default to override navigation.languages
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
  const pageObject = new BYOLPageObject(t);
  await pageObject.navigateToPage({ render: false });

  if (options.navigatorLanguages) {
    await overrideNavigatorLanguages(options.navigatorLanguages);
  }

  // Render the widget for interaction code flow
  await pageObject.mockCrypto();
  await renderWidget({
    stateToken: 'abc',
    ...options,
  });
  await t.expect(pageObject.formExists()).eql(true);

  return pageObject;
}

async function setupIdentify(t, options = {}) {
  const pageObject = new IdentityPageObject(t);
  await pageObject.navigateToPage({ render: false });

  // Render the widget for interaction code flow
  await pageObject.mockCrypto();
  await renderWidget({
    stateToken: 'abc',
    features: {
      securityImage: false,
    },
    ...options,
  });
  await t.expect(pageObject.formExists()).eql(true);

  return pageObject;
}

test.requestHooks(mock)('unsupported language, set with "language" option, is not loaded by default', async t => {
  const pageObject = await setup(t, {
    language: 'foo'
  });

  // Check title (login_foo.json)
  await t.expect(pageObject.getFormTitle()).eql('Set up phone authentication');
  // Check country dropdown (country_foo.json)
  await t.expect(await pageObject.countryDropdownHasSelectedText('United States')).eql(true);
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
  await t.expect(await pageObject.countryDropdownHasSelectedText('Foonited States')).eql(true);
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
  await t.expect(await pageObject.countryDropdownHasSelectedText('United States')).eql(true);
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
  await t.expect(await pageObject.countryDropdownHasSelectedText('Foonited States')).eql(true);
});

test.requestHooks(mockIdentify)('shows spinner while translations are loading', async t => {
  const pageObject = await setupIdentify(t, {
    language: 'foo',
    assets: {
      baseUrl: '/mocks'
    }
  });

  // Check title (login_foo.json)
  await t.expect(pageObject.getFormTitle()).eql('Signin');

  // Check loading beacon
  await t.expect(pageObject.loadingBeaconExists()).eql(false);
});
