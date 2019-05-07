/* eslint max-params: [2, 18], max-statements: 0 */
define([
  'q',
  'okta',
  'helpers/mocks/Util',
  'helpers/dom/Form',
  'LoginRouter',
  'sandbox',
  'helpers/util/Expect'
],
function (Q, Okta, Util, Form, Router, $sandbox, Expect) {

  var {_} = Okta;
  var itp = Expect.itp;

  function setup (settings) {
    var router = new Router(_.extend({
      el: $sandbox,
      baseUrl: 'https://foo.com'
    }, settings));
    var form = new Form($sandbox);
    Util.registerRouter(router);
    Util.mockRouterNavigate(router);
    router.recoveryEmailSent();
    return Expect.waitForPwdResetEmailSent({
      router: router,
      form: form
    });
  }

  Expect.describe('check back link', function () {
    itp('does not show back link if hideBackToSignInForReset is true', function () {
      return setup({'features.hideBackToSignInForReset': true})
        .then(function (test) {
          var $link = test.form.el('back-button');
          expect($link.length).toBe(0);
        });
    });
    itp('shows back link if hideBackToSignInForReset is false', function () {
      return setup({'features.hideBackToSignInForReset': false})
        .then(function (test) {
          var $link = test.form.el('back-button');
          expect($link.length).toBe(1);
        });
    });
  });
});
