import Expect from 'helpers/util/Expect';
import CryptoUtil from 'util/CryptoUtil';

Expect.describe('CryptoUtil', function() {
  it('hash string to unique integer', function() {
    const original = {};
    const hashed = {};
    let name;

    for (var i = 0; i < 100; i++) {
      name = Math.random().toString(36).substr(2, 10);
      original[name] = true;
      hashed[CryptoUtil.getStringHash(name)] = true;
    }
    expect(Object.keys(original).length).toEqual(Object.keys(hashed).length);
  });

  it('converts Base64 str to binary array', function() {
    expect(CryptoUtil.strToBin('WXVtaW5nIENhbw==')).toEqual(
      Uint8Array.from([89, 117, 109, 105, 110, 103, 32, 67, 97, 111])
    );
  });

  it('supports Base64UrlSafe str', function() {
    expect(CryptoUtil.strToBin('WXVtaW5_IE-hbw==')).toEqual(CryptoUtil.strToBin('WXVtaW5/IE+hbw=='));
  });

  it('converts binary array to Base64 str', function() {
    expect(CryptoUtil.binToStr([89, 117, 109, 105, 110, 103, 32, 67, 97, 111])).toEqual('WXVtaW5nIENhbw==');
  });
});
