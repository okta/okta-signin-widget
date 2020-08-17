/* eslint max-params: [2, 13], max-len: [2, 160] */
define([
  'okta',
  '@okta/okta-auth-js',
  'util/Util',
  'helpers/mocks/Util',
  'helpers/dom/ConsentRequiredForm',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/CONSENT_REQUIRED',
  'helpers/xhr/SUCCESS',
  'helpers/xhr/CANCEL'
],
function (Okta, OktaAuth, LoginUtil, Util, ConsentRequiredForm, Expect, Router,
  $sandbox, resConsentRequired, resSuccess, resCancel) {

  var { _ } = Okta;
  var itp = Expect.itp;

  function deepClone (res) {
    return JSON.parse(JSON.stringify(res));
  }

  function setup (settings, res) {
    settings || (settings = {});
    var successSpy = jasmine.createSpy('successSpy');
    var setNextResponse = Util.mockAjax();
    var baseUrl = window.location.origin;
    var logoUrl = '/img/logos/default.png';
    var authClient = new OktaAuth({issuer: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: baseUrl,
      features: { consent: true },
      logo: logoUrl,
      authClient: authClient,
      globalSuccessFn: successSpy
    }, settings));
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    Util.mockJqueryCss();
    setNextResponse(res || resConsentRequired);
    router.refreshAuthState('dummy-token');
    settings = {
      router: router,
      successSpy: successSpy,
      form: new ConsentRequiredForm($sandbox),
      ac: authClient,
      setNextResponse: setNextResponse
    };
    return Expect.waitForConsentRequired(settings);
  }

  function setupClientLogo () {
    var resConsentRequiredClientLogo = deepClone(resConsentRequired);
    var customLogo = {
      href: '/base/test/unit/assets/logo.svg',
      type: 'image/png'
    };
    resConsentRequiredClientLogo.response._embedded.target._links.logo = customLogo;
    return setup(undefined, resConsentRequiredClientLogo);
  }

  function setupClientUri () {
    var resConsentRequiredClientUri = deepClone(resConsentRequired);
    resConsentRequiredClientUri.response._embedded.target._links['client-uri'] = {
      href: `${window.location.origin}/client-uri.html`,
      type: 'text/html'
    };
    return setup(undefined, resConsentRequiredClientUri);
  }

  Expect.describe('ConsentRequired', function () {

    describe('ScopeList', function () {
      itp('has the correct number of scopes', function () {
        return setup().then(function (test) {
          expect(test.form.scopeList().children()).toHaveLength(2);
        });
      });
      itp('scope item show displayName instead of name if the first is available', function () {
        return setup().then(function (test) {
          expect(test.form.scopeList().children()[0]).toContainText('Ability to read protected data');
          expect(test.form.scopeList().children()[0]).not.toContainText('api:read');
        });
      });
      itp('scope item show name if displayName is not available', function () {
        return setup().then(function (test) {
          expect(test.form.scopeList().children()[1]).toContainText('api:write');
        });
      });
      itp('scope item has a tooltip if description is available', function () {
        return setup().then(function (test) {
          expect(test.form.scopeList().children()[0]).toContainElement('span.scope-item-tooltip');
          expect(test.form.scopeList().html()).toMatch(new RegExp(
            '<div class="scope-item"><div class="scope-item-text"><p>Ability to read protected data</p></div>' + 
            '<span class="scope-item-tooltip icon form-help-16" data-hasqtip="\\d+"></span></div>' + 
            '<div class="scope-item"><div class="scope-item-text"><p>api:write</p></div></div>'
          ));
        });
      });
      itp('scope item does not have a tooltip if description is not available', function () {
        return setup().then(function (test) {
          expect(test.form.scopeList().children()[1]).not.toContainElement('span.scope-item-tooltip');
        });
      });
    });

    describe('ConsentForm', function () {
      itp('has the default logo if client logo is not provided', function () {
        return setup().then(function (test) {
          expect(test.form.clientLogoLink())
            .toHaveLength(0);
          expect(test.form.clientLogo())
            .toHaveAttr('src', `${window.location.origin}/img/logos/default.png`);
        });
      });
      itp('has the client uri', function () {
        return setupClientUri()
          .then(function (test) {
            expect(test.form.clientLogoLink())
              .toHaveAttr('href', `${window.location.origin}/client-uri.html`);
            expect(test.form.clientLogo())
              .toHaveAttr('src', `${window.location.origin}/img/logos/default.png`);
          });
      });
      itp('has the correct client logo', function () {
        return setupClientLogo().then(function (test) {
          expect(test.form.clientLogo()).toHaveAttr('src', '/base/test/unit/assets/logo.svg');
        });
      });
      itp('has the correct app name in the title', function () {
        return setup().then(function (test) {
          expect(test.form.consentTitle().text().trim()).toBe('Janky App would like to access:');
        });
      });
      itp('has the correct consent description', function () {
        return setup().then(function (test) {
          expect(test.form.consentDescription().text().trim())
            .toBe('By clicking Allow Access, you allow the actions listed above.');
        });
      });
      itp('has the correct term of services link', function () {
        return setup().then(function (test) {
          expect(test.form.termsOfService()).toHaveAttr('href', 'https://example.okta.com/tos.html');
        });
      });
      itp('has the correct privacy policy link', function () {
        return setup().then(function (test) {
          expect(test.form.privacyPolicy()).toHaveAttr('href', 'https://example.okta.com/policy.html');
        });
      });
      itp('has the consent button', function () {
        return setup().then(function (test) {
          expect(test.form.consentButton()).toExist();
          expect(test.form.consentButton().attr('value')).toBe('Allow Access');
          expect(test.form.consentButton().attr('class')).toBe('button');
        });
      });
      itp('consent button click makes the correct consent post', function () {
        return setup().then(function (test) {
          Util.resetAjaxRequests();
          test.setNextResponse(resSuccess);
          test.form.consentButton().click();
          return Expect.waitForAjaxRequest();
        })
          .then(function () {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.lastAjaxRequest(), {
              url: 'https://example.okta.com/api/v1/authn/consent',
              data: {
                consent: {
                  expiresAt: '2017-07-20T00:06:25.000Z',
                  scopes: [ 'api:read', 'api:write' ]
                },
                stateToken: 'testStateToken'
              }
            });
          });
      });
      itp('has the cancel button', function () {
        return setup().then(function (test) {
          expect(test.form.cancelButton()).toExist();
          expect(test.form.cancelButton().attr('value')).toBe('Don\'t Allow');
          expect(test.form.cancelButton().attr('class')).toBe('button');
        });
      });
      itp('cancel button click cancels the current stateToken and calls the cancel function', function () {
        var cancel = jasmine.createSpy('cancel');
        return setup({ consent: { cancel } }).then(function (test) {
          spyOn(test.router.controller.options.appState, 'clearLastAuthResponse').and.callThrough();
          Util.resetAjaxRequests();
          test.setNextResponse(resCancel);
          test.form.cancelButton().click();
          return Expect.waitForAjaxRequest(test);
        })
          .then(function (test) {
            expect(Util.numAjaxRequests()).toBe(1);
            Expect.isJsonPost(Util.lastAjaxRequest(), {
              url: 'https://example.okta.com/api/v1/authn/cancel',
              data: {
                stateToken: 'testStateToken'
              }
            });
            return Expect.wait(function () {
              return test.router.controller.options.appState.clearLastAuthResponse.calls.count() > 0;
            }, test);
          })
          .then(function (test) {
            expect(test.router.controller.options.appState.clearLastAuthResponse).toHaveBeenCalled();
            expect(cancel).toHaveBeenCalled();
          });
      });
    });

  });
});
