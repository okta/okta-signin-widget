/* eslint max-len: [2, 140] */
define(['util/OAuth2Util'], function (Util) {

  function assertAuthParams (response, extras) {
    // Contains default key/value pairs
    var defaults = {
      display: 'page',
      responseType: ['id_token', 'token'],
      scopes: ['email', 'openid']
    };

    expect(response.authParams).toEqual(jasmine.objectContaining(Object.assign(defaults, extras)));
  }

  describe('util/OAuth2Util', function () {

    describe('addOrRemoveOpenIdScope', function () {
      it('returns undefined if responseTypes are not provided', function () {
        expect(Util.addOrRemoveOpenIdScope({})).toBeUndefined();
      });
      it('converts a provided string of scopes to a list of scopes', function () {
        expect(Util.addOrRemoveOpenIdScope({
          responseType: ['id_token'],
          scopes: 'openid email'
        })).toEqual(['email', 'openid']);
      });
      it('returns an array containing "openid" when the responseType contains' +
         '"id_token" and an empty scopes array is provided', function () {
        expect(Util.addOrRemoveOpenIdScope({
          responseType: ['id_token'],
          scopes: []
        })).toEqual(['openid']);
      });
      it('returns an array containing "openid" when the responseType contains' +
         '"id_token"', function () {
        expect(Util.addOrRemoveOpenIdScope({
          responseType: ['id_token'],
          scopes: ['profile', 'email']
        })).toEqual(['profile', 'email', 'openid']);
      });
      it('returns an array without "openid" when the responseType does not contain' +
         '"id_token"', function () {
        expect(Util.addOrRemoveOpenIdScope({
          responseType: ['token'],
          scopes: ['groups']
        })).toEqual(['groups']);
      });
      it('returns an array without "openid" when the responseType does not contain' +
         '"id_token" and "openid" was given as a scope', function () {
        expect(Util.addOrRemoveOpenIdScope({
          responseType: ['token'],
          scopes: ['openid', 'groups']
        })).toEqual(['groups']);
      });
    });

    describe('getResponseType', function () {
      it('returns an array containing "id_token" and "token" by deault', function () {
        expect(Util.getResponseType({
        })).toEqual(['id_token', 'token']);
      });
      it('returns an array containing "token" when getIdToken is set to false', function () {
        expect(Util.getResponseType({
          getIdToken: false
        })).toEqual(['token']);
      });
      it('returns an array containing "id_token" when getAccessToken is set to false', function () {
        expect(Util.getResponseType({
          getAccessToken: false
        })).toEqual(['id_token']);
      });
      it('returns an empty array when getAccessToken is set to false and getIdToken is false', function () {
        expect(Util.getResponseType({
          getAccessToken: false,
          getIdToken: false
        })).toEqual([]);
      });
    });

    describe('transformShowSignInToGetTokensOptions', function () {
      it('throws a CONFIG error when no clientId property is provided in the args or default config', function () {
        var fn = function () { Util.transformShowSignInToGetTokensOptions({}); };
        expect(fn).toThrowError('showSignInToGetTokens() requires a "clientId" property.');
      });

      it('does not throw a CONFIG error when a clientId property is provided in the Widget constructor', function () {
        var fn = function () { Util.transformShowSignInToGetTokensOptions({}, {clientId: 'foo'}); };
        expect(fn).not.toThrow();
      });

      it('does not throw a CONFIG error when a clientId property is provided in the render options', function () {
        var fn = function () { Util.transformShowSignInToGetTokensOptions({clientId: 'foo'}, {}); };
        expect(fn).not.toThrow();
      });

      it('returns default authParams if no overrides are provided', function () {
        var renderOptions = Util.transformShowSignInToGetTokensOptions({clientId: 'foo'});
        assertAuthParams(renderOptions);
      });

      it('overrides signIn configuration when overrides are provided', function () {
        var signInConfig = {
          clientId: 'foo',
          authParams: {
            scopes: 'bazz'
          }
        };
        var options = {
          clientId: 'bar',
          scope: 'foo'
        };
        var renderOptions = Util.transformShowSignInToGetTokensOptions(options, signInConfig);
        assertAuthParams(renderOptions, { scopes: ['foo', 'openid'] });
      });

      it('updates the responseType if getAccessToken=false', function () {
        var options = {
          clientId: 'foo',
          getAccessToken: false
        };
        var renderOptions = Util.transformShowSignInToGetTokensOptions(options);
        assertAuthParams(renderOptions, { responseType: ['id_token'] });
      });

      it('updates the responseType and scope if getIdToken is falsey', function () {
        var options = {
          clientId: 'foo',
          getIdToken: false
        };
        var renderOptions = Util.transformShowSignInToGetTokensOptions(options);
        assertAuthParams(renderOptions, { responseType: ['token'], scopes: ['email'] });
      });

      it('returns a complex object, overriding the basic Widget configuration options', function () {
        var signInConfig = {
          clientId: 'cid',
          authParams: {
            responseType: ['id_token'],
            scopes: ['openid']
          }
        };
        var options = {
          getAccessToken: true,
          scope: 'openid profile',
          clientId: 'bar'
        };
        var renderOptions = Util.transformShowSignInToGetTokensOptions(options, signInConfig);
        assertAuthParams(renderOptions, {
          responseType: ['id_token', 'token'],
          // 'openid' should always be last
          scopes: ['profile', 'openid']
        });
        expect(renderOptions).toEqual(jasmine.objectContaining({ clientId: 'bar' }));
      });
    });
  });
});
