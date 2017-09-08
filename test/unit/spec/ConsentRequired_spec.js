/* eslint max-params: [2, 13], max-len: [2, 160] */
define([
  'vendor/lib/q',
  'okta/underscore',
  'okta/jquery',
  '@okta/okta-auth-js/jquery',
  'util/Util',
  'shared/util/Util',
  'helpers/mocks/Util',
  'helpers/dom/ConsentRequiredForm',
  'helpers/util/Expect',
  'LoginRouter',
  'sandbox',
  'helpers/xhr/CONSENT_REQUIRED',
  'helpers/xhr/SUCCESS'
],
function (Q, _, $, OktaAuth, LoginUtil, SharedUtil, Util, ConsentRequiredForm, Expect, Router,
          $sandbox, resConsentRequired, resSuccess) {

  var itp = Expect.itp;
  var tick = Expect.tick;

  function setup(settings, res) {
    settings || (settings = {});
    var successSpy = jasmine.createSpy('successSpy');
    var setNextResponse = Util.mockAjax();
    var baseUrl = 'https://example.okta.com';
    var logoUrl = 'https://logo.com';
    var authClient = new OktaAuth({url: baseUrl, transformErrorXHR: LoginUtil.transformErrorXHR});
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

  Expect.describe('ConsentRequired', function () {

    Expect.describe('ConsentBeacon', function () {
      itp('has the correct user logo', function () {
        return setup().then(function (test) {
          expect(test.form.userLogo()).toHaveClass('person-16-gray');
        });
      });
      itp('has the correct client logo', function () {
        return setup().then(function (test) {
          expect(test.form.clientLogo()).toHaveAttr('src', 'https://example.com/logo.png');
        });
      });
    });

    Expect.describe('ScopeList', function () {
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
        });
      });
      itp('scope item does not have a tooltip if description is not available', function () {
        return setup().then(function (test) {
          expect(test.form.scopeList().children()[1]).not.toContainElement('span.scope-item-tooltip');
        });
      });
    });

    Expect.describe('ConsentForm', function () {
      itp('has the correct app name in the title', function () {
        return setup().then(function (test) {
          expect(test.form.consentTitle().text()).toContain('Janky App');
        });
      });
      itp('has the correct consent name in the title', function () {
        return setup().then(function (test) {
          expect(test.form.consentTitle().text()).toContain('Add-Min O.');
        });
      });
      itp('has the correct term of services link', function () {
        return setup().then(function (test) {
          expect(test.form.termsOfService()).toHaveAttr('href', 'https://example.com/tos.html');
        });
      });
      itp('has the correct privacy policy link', function () {
        return setup().then(function (test) {
          expect(test.form.privacyPolicy()).toHaveAttr('href', 'https://example.com/policy.html');
        });
      });
      itp('has the consent button', function () {
        return setup().then(function (test) {
          expect(test.form.consentButton()).toExist();
        });
      });
      itp('consent button click makes the correct consent post', function () {
        return setup().then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          test.form.consentButton().click();
          return tick();
        })
        .then(function() {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
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
        });
      });
      itp('cancel button click cancels the current stateToken and calls the cancel function', function () {
        var cancel = jasmine.createSpy('cancel');
        return setup({ consent: { cancel } }).then(function (test) {
          $.ajax.calls.reset();
          test.setNextResponse(resSuccess);
          test.form.cancelButton().click();
          return tick();
        })
        .then(function () {
          expect($.ajax.calls.count()).toBe(1);
          Expect.isJsonPost($.ajax.calls.argsFor(0), {
            url: 'https://example.okta.com/api/v1/authn/cancel',
            data: {
              stateToken: 'testStateToken'
            }
          });
          expect(cancel).toHaveBeenCalled();
        });
      });
    });

  });
});
