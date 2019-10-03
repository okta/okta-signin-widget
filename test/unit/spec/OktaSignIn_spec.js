/* eslint max-params:[0, 2] */
define([
  'widget/OktaSignIn',
  'helpers/util/Expect',
  'util/Logger',
  'sandbox',
  'jasmine-ajax',
],
function (Widget, Expect, Logger, $sandbox) {
  var url = 'https://foo.com';

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

    Expect.describe('Debug Mode', function () {
      it('logs a warning message on page load', function () {
        var debugMessage = '\n' +
          'The Okta Sign-In Widget is running in development mode.\n' +
          'When you are ready to publish your app, embed the minified version to turn on production mode.\n' +
          'See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn\n';

        expect(Logger.warn).toHaveBeenCalledWith(debugMessage);
      });
    });

    Expect.describe('At the root level', function () {
      it('has a renderEl method', function () {
        expect(signIn.renderEl).toBeDefined();
      });
      it('has a authClient method', function () {
        expect(signIn.authClient).toBeDefined();
      });
      it('has a showSignInToGetTokens method', function () {
        expect(signIn.showSignInToGetTokens).toBeDefined();
      });
      it('has a hasTokensInUrl method', function () {
        expect(signIn.hasTokensInUrl).toBeDefined();
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

    Expect.describe('Auth Client', function () {
      Expect.describe('Config', function () {
        it('has an options object', function () {
          expect(signIn.authClient.options).toBeDefined();
        });
        
        it('SIW passes all config within authParams to OktaAuth', function () {
          const authParams = {
            // known params
            issuer: 'my-issuer',
            authorizeUrl: 'fake-url',
            pkce: true,
          };
          signIn = new Widget({
            baseUrl: url,
            authParams,
          });

          Object.keys(authParams).forEach(function (key) {
            expect(signIn.authClient.options[key]).toBe(authParams[key]);
          });
        });
      });

      Expect.describe('Session', function () {
        it('has a session method', function () {
          expect(signIn.authClient.session).toBeDefined();
        });
        it('has a session.close method', function () {
          expect(signIn.authClient.session.close).toBeDefined();
        });
        it('has a session.exists method', function () {
          expect(signIn.authClient.session.exists).toBeDefined();
        });
        it('has a session.get method', function () {
          expect(signIn.authClient.session.get).toBeDefined();
        });
        it('has a session.refresh method', function () {
          expect(signIn.authClient.session.refresh).toBeDefined();
        });
      });

      Expect.describe('Token', function () {
        it('has a token method', function () {
          expect(signIn.authClient.token).toBeDefined();
        });
        it('has a token.getWithoutPrompt method', function () {
          expect(signIn.authClient.token.getWithoutPrompt).toBeDefined();
        });
        it('has a token.getWithPopup method', function () {
          expect(signIn.authClient.token.getWithPopup).toBeDefined();
        });
        it('has a token.getWithRedirect method', function () {
          expect(signIn.authClient.token.getWithRedirect).toBeDefined();
        });
        it('has a token.parseFromUrl method', function () {
          expect(signIn.authClient.token.parseFromUrl).toBeDefined();
        });
        it('has a token.decode method', function () {
          expect(signIn.authClient.token.decode).toBeDefined();
        });
        it('has a token.renew method', function () {
          expect(signIn.authClient.token.renew).toBeDefined();
        });
        it('has a token.getUserInfo method', function () {
          expect(signIn.authClient.token.getUserInfo).toBeDefined();
        });
        it('has a token.verify method', function () {
          expect(signIn.authClient.token.verify).toBeDefined();
        });
      });

      Expect.describe('TokenManager', function () {
        it('has a tokenManager method', function () {
          expect(signIn.authClient.tokenManager).toBeDefined();
        });
        it('has a tokenManager.add method', function () {
          expect(signIn.authClient.tokenManager.add).toBeDefined();
        });
        it('has a tokenManager.get method', function () {
          expect(signIn.authClient.tokenManager.get).toBeDefined();
        });
        it('has a tokenManager.remove method', function () {
          expect(signIn.authClient.tokenManager.remove).toBeDefined();
        });
        it('has a tokenManager.clear method', function () {
          expect(signIn.authClient.tokenManager.clear).toBeDefined();
        });
        it('has a tokenManager.renew method', function () {
          expect(signIn.authClient.tokenManager.renew).toBeDefined();
        });
        it('has a tokenManager.on method', function () {
          expect(signIn.authClient.tokenManager.on).toBeDefined();
        });
        it('has a tokenManager.off method', function () {
          expect(signIn.authClient.tokenManager.off).toBeDefined();
        });
      });
    });

    Expect.describe('events', function () {
      afterEach(function () {
        signIn.remove();
        signIn.off();
      });
      it('triggers an afterRender event when the Widget renders a page', function (done) {
        signIn.renderEl({ el: $sandbox });
        signIn.on('afterRender', function (context) {
          expect(context).toEqual({ controller: 'primary-auth' });
          done();
        });
      });

      it('triggers a ready event when the Widget renders a page', function (done) {
        signIn.renderEl({ el: $sandbox });
        signIn.on('ready', function (context) {
          expect(context).toEqual({ controller: 'primary-auth' });
          done();
        });
      });
      
      it('triggers a ready event when the Widget is loaded with a recoveryToken', function (done) {
        signIn = new Widget({
          baseUrl: url,
          recoveryToken: 'foo'
        });
        signIn.renderEl({ el: $sandbox });
        signIn.on('ready', function (context) {
          expect(context).toEqual({ controller: 'recovery-loading' });
          done();
        });
      });
      it('triggers a ready event when the Widget is loaded with using idpDiscovery', function (done) {
        signIn = new Widget({
          baseUrl: url,
          features: { idpDiscovery: true }
        });
        signIn.renderEl({ el: $sandbox });
        signIn.on('ready', function (context) {
          expect(context).toEqual({ controller: 'idp-discovery' });
          done();
        });
      });
      it('does not trigger a ready event twice', function (done) {
        signIn.renderEl({ el: '#sandbox' });
        signIn.on('ready', function (context) {
          expect(context).toEqual({ controller: 'primary-auth' });
          // Navigate directly to forgot-password page
          var forgotPasswordLink = document.getElementsByClassName('link js-forgot-password');
          forgotPasswordLink[0].click();
        });
        signIn.on('afterRender', function (context) {
          if (context.controller === 'forgot-password') {
            done();
          }
        });
      });
    });
  });
});
