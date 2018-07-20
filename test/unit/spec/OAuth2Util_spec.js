/* eslint max-len: [2, 140] */
define(['util/OAuth2Util'], function (Util) {

  describe('util/OAuth2Util', function () {

    describe('scrubScopes', function () {
      it('returns undefined if responseTypes are not provided', function () {
        expect(Util.scrubScopes({})).toBeUndefined();
      });
      it('converts a provided string of scopes to a list of scopes', function () {
        expect(Util.scrubScopes({
          responseType: ['id_token'],
          scopes: 'openid email'
        })).toEqual(['email', 'openid']);
      });
      it('returns an array containing "openid" when the responseType contains' +
         '"id_token" and an empty scopes array is provided', function () {
        expect(Util.scrubScopes({
          responseType: ['id_token'],
          scopes: []
        })).toEqual(['openid']);
      });
      it('returns an array containing "openid" when the responseType contains' +
         '"id_token"', function () {
        expect(Util.scrubScopes({
          responseType: ['id_token'],
          scopes: ['profile', 'email']
        })).toEqual(['profile', 'email', 'openid']);
      });
      it('returns an array without "openid" when the responseType does not contain' +
         '"id_token"', function () {
        expect(Util.scrubScopes({
          responseType: ['token'],
          scopes: ['groups']
        })).toEqual(['groups']);
      });
      it('returns an array without "openid" when the responseType does not contain' +
         '"id_token" and "openid" was given as a scope', function () {
        expect(Util.scrubScopes({
          responseType: ['token'],
          scopes: ['openid', 'groups']
        })).toEqual(['groups']);
      });
    });

    describe('getResponseType', function () {
      it('returns an array containing "id_token" when getIdToken is set to true', function () {
        expect(Util.getResponseType({
          getIdToken: true
        })).toEqual(['id_token']);
      });
      it('returns an array containing "id_token" by default', function () {
        expect(Util.getResponseType({})).toEqual(['id_token']);
      });
      it('returns an empty Array when getIdToken is set to false', function () {
        expect(Util.getResponseType({
          getIdToken: false
        })).toEqual([]);
      });
      it('returns an array containing "id_token" and "token" when getAccessToken is set to true', function () {
        expect(Util.getResponseType({
          getAccessToken: true
        })).toEqual(['id_token', 'token']);
      });
      it('returns an array containing "token" when getAccessToken is set to true and getIdToken is false', function () {
        expect(Util.getResponseType({
          getAccessToken: true,
          getIdToken: false
        })).toEqual(['token']);
      });
    });

  });

});
