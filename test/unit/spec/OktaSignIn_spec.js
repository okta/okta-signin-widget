/* eslint max-params:[0, 2] */
import { $ } from 'okta';
import PrimaryAuthForm from 'helpers/dom/PrimaryAuthForm';
import MockUtil from 'helpers/mocks/Util';
import Expect from 'helpers/util/Expect';
import v1Success from 'helpers/xhr/SUCCESS';
import 'jasmine-ajax';
import $sandbox from 'sandbox';
import Logger from 'util/Logger';
import Widget from 'widget/OktaSignIn';
import V1Router from 'v1/LoginRouter';
import V1AppState from 'v1/models/AppState';
import V2AppState from 'v2/models/AppState';
import Hooks from 'models/Hooks';

const url = 'https://foo.com';
const itp = Expect.itp;

Expect.describe('OktaSignIn initialization', function() {
  let signIn;

  /* eslint jasmine/no-global-setup:0 */
  beforeEach(function() {
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(/https:\/\/foo.com.*/).andReturn({
      status: 200,
      responseText: '',
    });
    spyOn(Logger, 'warn');
    signIn = new Widget({
      baseUrl: url,
    });
  });
  afterEach(function() {
    jasmine.Ajax.uninstall();
    $sandbox.empty();
  });

  Expect.describe('Debug Mode', function() {
    it('logs a warning message on page load', function() {
      const debugMessage =
        '\n' +
        'The Okta Sign-In Widget is running in development mode.\n' +
        'When you are ready to publish your app, embed the minified version to turn on production mode.\n' +
        'See: https://developer.okta.com/code/javascript/okta_sign-in_widget#cdn\n';

      expect(Logger.warn).toHaveBeenCalledWith(debugMessage);
    });
  });

  Expect.describe('At the root level', function() {
    it('has a renderEl method', function() {
      expect(signIn.renderEl).toBeDefined();
    });
    it('has a authClient method', function() {
      expect(signIn.authClient).toBeDefined();
    });
    it('has a showSignInToGetTokens method', function() {
      expect(signIn.showSignInToGetTokens).toBeDefined();
    });
    it('has a showSignInAndRedirect method', function() {
      expect(signIn.showSignInAndRedirect).toBeDefined();
    });
    it('has a hide method', function() {
      expect(signIn.hide).toBeDefined();
    });
    it('has a show method', function() {
      expect(signIn.show).toBeDefined();
    });
    it('has a remove method', function() {
      expect(signIn.remove).toBeDefined();
    });
    it('has a before method', function() {
      expect(signIn.before).toBeDefined();
    });
    it('has an after method', function() {
      expect(signIn.after).toBeDefined();
    });
    it('has a getUser method', function() {
      expect(signIn.getUser).toBeDefined();
    });
  });

  describe('Auth Client', function() {
    Expect.describe('authClient option', function() {
      it('accepts an authClient option', function() {
        const authClient = { 
          foo: 'bar', 
          options: {},
          _oktaUserAgent: {
            addEnvironment: jest.fn()
          } 
        };
        signIn = new Widget({
          baseUrl: url,
          authClient,
        });
        expect(signIn.authClient).toBe(authClient);
      });
      // TODO: https://oktainc.atlassian.net/browse/OKTA-433378
      // it('throws error if _oktaUserAgent field is not exist', function() {
      //   const authClient = { foo: 'bar' };
      //   const expectedError = new ConfigError('The passed in authClient should be version 5.4.0 or above.');
      //   expect(() => new Widget({
      //     baseUrl: url,
      //     authClient,
      //   })).toThrow(expectedError);
      // });
    });

    Expect.describe('Config', function() {
      it('has an options object', function() {
        expect(signIn.authClient.options).toBeDefined();
      });

      it('SIW passes all config within authParams to OktaAuth', function() {
        const authParams = {
          // known params
          issuer: 'https://my-issuer',
          authorizeUrl: 'fake-url',
          pkce: false,
        };
        signIn = new Widget({
          baseUrl: url,
          authParams,
        });

        Object.keys(authParams).forEach(function(key) {
          expect(signIn.authClient.options[key]).toBe(authParams[key]);
        });
      });

      it('"useInteractionCodeFlow" without PKCE throws a config error', function() {
        const fn = () => {
          signIn = new Widget({
            baseUrl: url,
            useInteractionCodeFlow: true,
            authParams: {
              pkce: false
            }
          });
        };
        expect(fn).toThrowError('The "useInteractionCodeFlow" option requires PKCE to be enabled on the authClient.');
      });
    });

    Expect.describe('Session', function() {
      it('has a session method', function() {
        expect(signIn.authClient.session).toBeDefined();
      });
      it('has a session.close method', function() {
        expect(signIn.authClient.session.close).toBeDefined();
      });
      it('has a session.exists method', function() {
        expect(signIn.authClient.session.exists).toBeDefined();
      });
      it('has a session.get method', function() {
        expect(signIn.authClient.session.get).toBeDefined();
      });
      it('has a session.refresh method', function() {
        expect(signIn.authClient.session.refresh).toBeDefined();
      });
    });

    Expect.describe('Token', function() {
      it('has a token method', function() {
        expect(signIn.authClient.token).toBeDefined();
      });
      it('has a token.getWithoutPrompt method', function() {
        expect(signIn.authClient.token.getWithoutPrompt).toBeDefined();
      });
      it('has a token.getWithPopup method', function() {
        expect(signIn.authClient.token.getWithPopup).toBeDefined();
      });
      it('has a token.getWithRedirect method', function() {
        expect(signIn.authClient.token.getWithRedirect).toBeDefined();
      });
      it('has a token.parseFromUrl method', function() {
        expect(signIn.authClient.token.parseFromUrl).toBeDefined();
      });
      it('has a token.decode method', function() {
        expect(signIn.authClient.token.decode).toBeDefined();
      });
      it('has a token.renew method', function() {
        expect(signIn.authClient.token.renew).toBeDefined();
      });
      it('has a token.getUserInfo method', function() {
        expect(signIn.authClient.token.getUserInfo).toBeDefined();
      });
      it('has a token.verify method', function() {
        expect(signIn.authClient.token.verify).toBeDefined();
      });
    });

    Expect.describe('TokenManager', function() {
      it('has a tokenManager method', function() {
        expect(signIn.authClient.tokenManager).toBeDefined();
      });
      it('has a tokenManager.add method', function() {
        expect(signIn.authClient.tokenManager.add).toBeDefined();
      });
      it('has a tokenManager.get method', function() {
        expect(signIn.authClient.tokenManager.get).toBeDefined();
      });
      it('has a tokenManager.remove method', function() {
        expect(signIn.authClient.tokenManager.remove).toBeDefined();
      });
      it('has a tokenManager.clear method', function() {
        expect(signIn.authClient.tokenManager.clear).toBeDefined();
      });
      it('has a tokenManager.renew method', function() {
        expect(signIn.authClient.tokenManager.renew).toBeDefined();
      });
      it('has a tokenManager.on method', function() {
        expect(signIn.authClient.tokenManager.on).toBeDefined();
      });
      it('has a tokenManager.off method', function() {
        expect(signIn.authClient.tokenManager.off).toBeDefined();
      });
    });
  });

  Expect.describe('events', function() {
    beforeEach(function() {
      spyOn(Logger, 'error');
    });
    afterEach(function() {
      signIn.remove();
      signIn.off();
    });
    it('triggers an afterRender event when the Widget renders a page', function(done) {
      signIn.renderEl({ el: $sandbox });
      signIn.on('afterRender', function(context) {
        expect(context).toEqual({ controller: 'primary-auth' });
        done();
      });
    });

    it('triggers a ready event when the Widget renders a page', function(done) {
      signIn.renderEl({ el: $sandbox });
      signIn.on('ready', function(context) {
        expect(context).toEqual({ controller: 'primary-auth' });
        done();
      });
    });

    it('triggers a ready event when the Widget is loaded with a recoveryToken', function(done) {
      signIn = new Widget({
        baseUrl: url,
        recoveryToken: 'foo',
      });
      signIn.renderEl({ el: $sandbox });
      signIn.on('ready', function(context) {
        expect(context).toEqual({ controller: 'recovery-loading' });
        done();
      });
    });
    it('triggers a ready event when the Widget is loaded with using idpDiscovery', function(done) {
      signIn = new Widget({
        baseUrl: url,
        features: { idpDiscovery: true },
      });
      signIn.renderEl({ el: $sandbox });
      signIn.on('ready', function(context) {
        expect(context).toEqual({ controller: 'idp-discovery' });
        done();
      });
    });
    it('does not trigger a ready event twice', function(done) {
      signIn.renderEl({ el: '#sandbox' });
      signIn.on('ready', function(context) {
        expect(context).toEqual({ controller: 'primary-auth' });
        // Navigate directly to forgot-password page
        const forgotPasswordLink = document.getElementsByClassName('link js-forgot-password');

        forgotPasswordLink[0].click();
      });
      signIn.on('afterRender', function(context) {
        if (context.controller === 'forgot-password') {
          done();
        }
      });
    });
    ['ready', 'afterError', 'afterRender'].forEach(event => {
      it(`traps third party errors (for ${event} event) in callbacks`, function() {
        const mockError = new Error('mockerror');
        const fn = function() {
          signIn.on(event, function() {
            throw mockError;
          });
          signIn.trigger(event);
        };
        expect(fn).not.toThrowError(mockError);
        expect(Logger.error).toHaveBeenCalledWith(`[okta-signin-widget] "${event}" event handler error:`, mockError);
      });
    });
    it('does not trap errors non-registered events', () => {
      const mockError = new Error('mockerror');
      const fn = function() {
        signIn.on('not-widget-event', function() {
          throw mockError;
        });
        signIn.trigger('not-widget-event');
      };
      expect(fn).toThrowError(mockError);
      expect(Logger.error).not.toHaveBeenCalled();
    });
  });
});

describe('OktaSignIn object API', function() {
  let signIn;
  let router;
  beforeEach(function() {
    spyOn(Logger, 'warn');
    signIn = null;
    router = null;
  });

  afterEach(() => {
    signIn && signIn.remove();
    $sandbox.empty();
  });

  function createWidget(options = {}) {
    signIn = new Widget(Object.assign({
      baseUrl: url,
      features: {
        router: true,
      },
    }, options));
  }

  function submitPrimaryAuthForm() {
    const form = new PrimaryAuthForm($sandbox);
    form.setUsername('fake@fake.com');
    form.setPassword('FakePassword1');
    form.submit();
  }

  function mockRouter() {
    spyOn(V1Router.prototype, 'start').and.callFake(function() {
      router = this;
      router.controller = {
        remove: () => { }
      };
    });
  }

  describe('renderEl', () => {

    describe('router', () => {
      beforeEach(() => {
        mockRouter();
      });

      it('creates a router', () => {
        createWidget();
        signIn.renderEl({ el: $sandbox });
        return Expect.wait(() => {
          return !!router;
        });
      });
      it('throws if a router has already been created', () => {
        createWidget();
        signIn.renderEl({ el: $sandbox });
        return Expect.wait(() => {
          return !!router;
        }).then(() => {
          return signIn.renderEl();
        }).catch(e => {
          expect(e.message).toEqual('An instance of the widget has already been rendered. Call remove() first.');
        });
      });
      it('starts the router', () => {
        createWidget();
        signIn.renderEl({ el: $sandbox });
        expect(V1Router.prototype.start).toHaveBeenCalled();
      });
    });

    it('returns a Promise', () => {
      createWidget();
      const res = signIn.renderEl({ el: $sandbox });
      expect(typeof res.then).toBe('function');
      expect(typeof res.catch).toBe('function');
      expect(typeof res.finally).toBe('function');

      return Expect.wait(() => {
        return $('.primary-auth').length === 1;
      });
    });

    describe('success', () => {
      itp('fires success callback', () => {
        createWidget();
        MockUtil.mockAjax(v1Success);
        const successFn = jasmine.createSpy();
        signIn.renderEl({ el: $sandbox }, successFn);

        return Expect.wait(() => {
          return $('.primary-auth').length === 1;
        }).then(function() {
          submitPrimaryAuthForm();
          return Expect.wait(() => {
            return successFn.calls.count() > 0;
          });
        }).then(function() {
          expect(successFn).toHaveBeenCalledWith({
            user: v1Success.response._embedded.user,
            type: 'SESSION_SSO',
            status: 'SUCCESS',
            session: {
              token: v1Success.response.sessionToken,
              setCookieAndRedirect: jasmine.any(Function)
            }
          });
        });
      });
      itp('resolves Promise', () => {
        createWidget();
        MockUtil.mockAjax(v1Success);

        Expect.wait(() => {
          return $('.primary-auth').length === 1;
        }).then(function() {
          submitPrimaryAuthForm();
        });

        return signIn.renderEl({ el: $sandbox })
          .then(res => {
            expect(res).toEqual({
              user: v1Success.response._embedded.user,
              type: 'SESSION_SSO',
              status: 'SUCCESS',
              session: {
                token: v1Success.response.sessionToken,
                setCookieAndRedirect: jasmine.any(Function)
              }
            });
          });
      });
    });

    describe('error', () => {
      it('fires error callback', () => {
        createWidget();
        const errorFn = jasmine.createSpy();
        signIn.renderEl({ el: undefined }, undefined, errorFn).catch(() => { });
        return Expect.wait(() => {
          return errorFn.calls.count() > 0;
        })
          .then(function() {
            const error = errorFn.calls.argsFor(0)[0];
            expect(error.message).toEqual('"el" is a required widget parameter');
          });
      });
      it('rejects Promise', () => {
        mockRouter();
        createWidget();
        return signIn.renderEl({ el: undefined })
          .catch(error => {
            expect(error.message).toEqual('"el" is a required widget parameter');
          });
      });
    });

  });

  describe('showSignInToGetTokens', () => {
    it('calls renderEl', () => {
      const el = $sandbox;
      const clientId = 'fake';
      const redirectUri = 'http://fake';
      mockRouter();
      createWidget({ clientId, redirectUri });
      spyOn(signIn, 'renderEl').and.callThrough();
      signIn.showSignInToGetTokens({ el });
      expect(signIn.renderEl).toHaveBeenCalledWith({
        el,
        clientId,
        redirectUri,
        authParams: {},
        redirect: 'never'
      });
    });
    it('throws error for authorization_code flow', () => {
      const el = $sandbox;
      const clientId = 'fake';
      const redirectUri = 'http://fake';
      mockRouter();
      createWidget({
        el,
        clientId,
        redirectUri,
        authParams: {
          pkce: false,
          responseType: 'code'
        }
      });

      const fn = () => {
        signIn.showSignInToGetTokens();
      };
      expect(fn).toThrowError('"showSignInToGetTokens()" should not be used for authorization_code flow. ' +
        'Use "showSignInAndRedirect()" instead');
    });
    it('Can override el, clientId, redirectUri', () => {
      const el = $sandbox;
      const clientId = 'fake';
      const redirectUri = 'http://fake';
      mockRouter();
      createWidget({ el: 'orig', clientId: 'original', redirectUri: 'http://original' });
      spyOn(signIn, 'renderEl').and.callThrough();
      signIn.showSignInToGetTokens({ el, clientId, redirectUri });
      expect(signIn.renderEl).toHaveBeenCalledWith({
        el,
        clientId,
        redirectUri,
        authParams: {},
        redirect: 'never'
      });
    });
    it('Can pass additional authParams', () => {
      const el = $sandbox;
      const clientId = 'fake';
      const redirectUri = 'http://fake';
      const authParams = {
        state: 'fake-state',
        nonce: 'fake-nonce',
        scopes: ['a', 'b']
      };
      mockRouter();
      createWidget({ el, clientId, redirectUri });
      spyOn(signIn, 'renderEl').and.callThrough();
      signIn.showSignInToGetTokens(authParams);
      expect(signIn.renderEl).toHaveBeenCalledWith({
        el,
        clientId,
        redirectUri,
        authParams,
        redirect: 'never'
      });
    });
  });

  describe('showSignInAndRedirect', () => {
    it('calls renderEl', () => {
      const el = $sandbox;
      const clientId = 'fake';
      const redirectUri = 'http://fake';
      mockRouter();
      createWidget({ el, clientId, redirectUri });
      spyOn(signIn, 'renderEl').and.callThrough();
      signIn.showSignInAndRedirect();
      expect(signIn.renderEl).toHaveBeenCalledWith({
        el,
        clientId,
        redirectUri,
        authParams: {},
        redirect: 'always'
      });
    });
    it('Can override el, clientId, redirectUri', () => {
      const el = $sandbox;
      const clientId = 'fake';
      const redirectUri = 'http://fake';
      mockRouter();
      createWidget({ el: 'orig', clientId: 'original', redirectUri: 'http://original' });
      spyOn(signIn, 'renderEl').and.callThrough();
      signIn.showSignInAndRedirect({ el, clientId, redirectUri });
      expect(signIn.renderEl).toHaveBeenCalledWith({
        el,
        clientId,
        redirectUri,
        authParams: {},
        redirect: 'always'
      });
    });
    it('Can pass additional authParams', () => {
      const el = $sandbox;
      const clientId = 'fake';
      const redirectUri = 'http://fake';
      const authParams = {
        state: 'fake-state',
        nonce: 'fake-nonce',
        scopes: ['a', 'b']
      };
      mockRouter();
      createWidget({ el, clientId, redirectUri });
      spyOn(signIn, 'renderEl').and.callThrough();
      signIn.showSignInAndRedirect(authParams);
      expect(signIn.renderEl).toHaveBeenCalledWith({
        el,
        clientId,
        redirectUri,
        authParams,
        redirect: 'always'
      });
    });
  });

  describe('getUser', () => {

    describe('before render', () => {
      beforeEach(() => {
        createWidget();
      });
      it('returns undefined', () => {
        expect(signIn.getUser()).toBeUndefined();
      });
    });

    describe('after render', () => {
      beforeEach(() => {
        createWidget();
        signIn.renderEl({ el: $sandbox });
      });
      it('returns result from appState', () => {
        const mockUser = { fake: true };
        jest.spyOn(V1AppState.prototype, 'getUser').mockReturnValue(mockUser);
        expect(signIn.getUser()).toBe(mockUser);

      });
    });

    describe('after render v2', () => {
      beforeEach(() => {
        createWidget({ stateToken: 'fakeV2Token' });
        signIn.renderEl({ el: $sandbox });
      });
      it('returns result from appState', () => {
        const mockUser = { fake: true };
        jest.spyOn(V2AppState.prototype, 'getUser').mockReturnValue(mockUser);
        expect(signIn.getUser()).toBe(mockUser);

      });
    });
  });

  describe('Hooks API', () => {
    beforeEach(() => {
      jest.spyOn(Hooks.prototype, 'mergeHook');
      createWidget();
    });
    describe('before()', () => {
      it('calls mergeHook', () => {
        const fn = jest.fn();
        signIn.before('some-form', fn);
        expect(Hooks.prototype.mergeHook).toHaveBeenCalledWith('some-form', {
          before: [fn]
        });
      });
    });

    describe('after()', () => {
      it('calls mergeHook', () => {
        const fn = jest.fn();
        signIn.after('some-form', fn);
        expect(Hooks.prototype.mergeHook).toHaveBeenCalledWith('some-form', {
          after: [fn]
        });
      });
    });
  });
});
