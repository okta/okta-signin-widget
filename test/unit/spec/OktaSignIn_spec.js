/* eslint max-params:[0, 2], max-len:[2, 180] */
define([
  'widget/OktaSignIn',
  'helpers/util/Expect',
  'util/Logger'
],
function (Widget, Expect, Logger) {
  var signIn;
  var url = 'https://foo.com';

  beforeEach(function(){
    spyOn(Logger, 'warn');
    signIn = new Widget({
      baseUrl: url
    });
  });

  Expect.describe('Debug Mode', function () {
    it('logs a warning message on page load', function () {
      var debugMessage =
      `
        The Okta Sign-In Widget is running in development mode.
        When you are ready to publish your app, embed the minified version to turn on production mode.
        See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn
      `;

      expect(Logger.warn).toHaveBeenCalledWith(debugMessage);
    });
  });

  Expect.describe('OktaSignIn initialization', function () {
    Expect.describe('At the root level', function () {
      it('has a renderEl method', function () {
        expect(signIn.renderEl).toBeDefined();
      });
      it('has a signOut method', function () {
        expect(signIn.signOut).toBeDefined();
      });
      it('has an authClient object', function () {
        expect(signIn.authClient).toBeDefined();
        expect(signIn.authClient.options.url).toEqual(url);
      });
      it('has a tokenManager method', function () {
        expect(signIn.tokenManager).toBeDefined();
      });
      it('has a hide method', function () {
        expect(signIn.hide).toBeDefined();
      });
      it('has a show method', function () {
        expect(signIn.show).toBeDefined();
      });
      it('has a remove method', function () {
        expect(signIn.remove).toBeDefined();
      });
    });

    Expect.describe('IdToken', function () {
      it('has an idToken method', function () {
        expect(signIn.idToken).toBeDefined();
      });
      it('has an idToken.refresh method', function () {
        expect(signIn.idToken.refresh).toBeDefined();
      });
    });

    Expect.describe('Session', function () {
      it('has a session method', function () {
        expect(signIn.session).toBeDefined();
      });
      it('has a session.close method', function () {
        expect(signIn.session.close).toBeDefined();
      });
      it('has a session.exists method', function () {
        expect(signIn.session.exists).toBeDefined();
      });
      it('has a session.get method', function () {
        expect(signIn.session.get).toBeDefined();
      });
      it('has a session.refresh method', function () {
        expect(signIn.session.refresh).toBeDefined();
      });
    });

    Expect.describe('Token', function () {
      it('has a token method', function () {
        expect(signIn.token).toBeDefined();
      });
      it('has a token.hasTokensInUrl method', function () {
        expect(signIn.token.hasTokensInUrl).toBeDefined();
      });
      it('has a token.parseTokensFromUrl method', function () {
        expect(signIn.token.parseTokensFromUrl).toBeDefined();
      });
    });
  });
});
