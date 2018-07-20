/* eslint max-len: [2, 140] */
define(['util/Handlers'], function (Handlers) {

  function assertAuthParams (response, extras) {
    // Contains default key/value pairs
    var defaults = {
      display: 'page',
      responseMode: 'fragment',
      responseType: ['id_token']
    };

    expect(response.authParams).toEqual(jasmine.objectContaining(Object.assign(defaults, extras)));
  }

  describe('util/Handlers', function () {

    describe('filterOAuthRedirectParams', function () {
      it('returns top-level configuration if no overrides are provided', function () {
        var signInConfig = {
          baseUrl: 'foo'
        };
        var renderOptions = Handlers.filterOAuthRedirectParams({}, signInConfig);
        assertAuthParams(renderOptions);
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
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
        var renderOptions = Handlers.filterOAuthRedirectParams(options, signInConfig);
        assertAuthParams(renderOptions, { scopes: ['foo', 'openid'] });
        expect(renderOptions).toEqual(jasmine.objectContaining({ clientId: 'bar' }));
      });

      it('updates the responseType given getAccessToken key', function () {
        var signInConfig = {
          baseUrl: 'foo'
        };
        var options = {
          getAccessToken: true
        };
        var renderOptions = Handlers.filterOAuthRedirectParams(options, signInConfig);
        assertAuthParams(renderOptions, { responseType: ['id_token', 'token'], scopes: ['openid'] });
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
      });

      it('updates the responseType given getAccessToken is truthy and getIdToken is falsey', function () {
        var signInConfig = {
          baseUrl: 'foo'
        };
        var options = {
          getAccessToken: true,
          getIdToken: false
        };
        var renderOptions = Handlers.filterOAuthRedirectParams(options, signInConfig);
        assertAuthParams(renderOptions, { responseType: ['token'] });
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
      });

      it('maps the authorizationServerId key to issuer', function () {
        var signInConfig = {
          baseUrl: 'foo'
        };
        var options = {
          authorizationServerId: 'default'
        };
        var renderOptions = Handlers.filterOAuthRedirectParams(options, signInConfig);
        assertAuthParams(renderOptions, { issuer: 'default' });
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
      });

      it('returns a complex object, overriding the basic Widget configuration options', function () {
        var signInConfig = {
          baseUrl: 'foo',
          clientId: 'cid',
          authParams: {
            responseType: ['id_token'],
            scopes: ['openid']
          }
        };
        var options = {
          el: '#container',
          getAccessToken: true,
          scope: 'openid profile',
          clientId: 'bar'
        };
        var renderOptions = Handlers.filterOAuthRedirectParams(options, signInConfig);
        assertAuthParams(renderOptions, {
          responseType: ['id_token', 'token'],
          // 'openid' should always be last
          scopes: ['profile', 'openid']
        });
        expect(renderOptions).toEqual(jasmine.objectContaining({ baseUrl: 'foo' }));
        expect(renderOptions).toEqual(jasmine.objectContaining({ clientId: 'bar' }));
        expect(renderOptions).toEqual(jasmine.objectContaining({ el: '#container' }));
      });
    });

  });

});
