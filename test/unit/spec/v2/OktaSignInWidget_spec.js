/* eslint max-params:[0, 2] */
define([
  'q',
  'okta',
  'widget/OktaSignIn',
  'helpers/util/Expect',
  'util/Logger',
  'sandbox',
  'jasmine-ajax'
],
function (Q, Okta, Widget, Expect, Logger, $sandbox) {
  var url = 'https://foo.com';
  var { $ } = Okta;

  Expect.describe('OktaSignIn initialization', function () {
    var signIn;
    beforeEach(function () {
      jasmine.Ajax.install();
      jasmine.Ajax.stubRequest(
        /https:\/\/foo.com.*/
      ).andReturn({
        status: 200,
        responseText: ''
      });
      spyOn(Logger, 'warn');
      signIn = new Widget({
        baseUrl: url
      });
    });
    afterEach(function () {
      jasmine.Ajax.uninstall();
    });

    function setupIntrospect (options) {
      signIn = new Widget({
        baseUrl: url,
        stateToken: '01stateToken',
        features: {
          router: true
        }
      });
      spyOn(signIn.authClient.tx, 'evaluate').and.callFake(function () {
        return options.response;
      });
      spyOn($, 'ajax');
      signIn.renderEl({ el: $sandbox });
      return Q({});
    }
    Expect.describe('Introspects token on load', function () {
      it('calls introspect API on page load', function () {
        return setupIntrospect({
          response: {
            version: '1.0.0'
          }
        }).then(function () {
          expect(signIn.authClient.tx.evaluate).toHaveBeenCalledWith({ stateToken: '01stateToken', introspect: true });
        });
      });
    });
  });
});
