define([
  'helpers/util/Expect',
  'util/CryptoUtil'
],
function (Expect, CryptoUtil) {
  Expect.describe('CryptoUtil', function () {
    it('hash string to unique integer', function () {
      var original = {};
      var hashed = {};
      var name;
      for (var i = 0; i < 100; i++) {
        name = Math.random().toString(36).substr(2, 10);
        original[name] = true;
        hashed[CryptoUtil.getStringHash(name)] = true;
      }
      expect(Object.keys(original).length).toEqual(Object.keys(hashed).length);
    });
  });
});
