import Expect from 'helpers/util/Expect';
import FidoUtil from 'util/FidoUtil';

Expect.describe('FidoUtil', function() {
  it('Gets U2F version', function() {
    expect(FidoUtil.getU2fVersion()).toEqual('U2F_V2');
  });

  it('Returns u2f enroll error message key', function() {
    expect(FidoUtil.getU2fEnrollErrorMessageKeyByCode(1)).toEqual('u2f.error.other');
    expect(FidoUtil.getU2fEnrollErrorMessageKeyByCode(2)).toEqual('u2f.error.badRequest');
    expect(FidoUtil.getU2fEnrollErrorMessageKeyByCode(3)).toEqual('u2f.error.badRequest');
    expect(FidoUtil.getU2fEnrollErrorMessageKeyByCode(4)).toEqual('u2f.error.unsupported');
    expect(FidoUtil.getU2fEnrollErrorMessageKeyByCode(5)).toEqual('u2f.error.timeout');
  });

  it('Returns u2f verify error message key', function() {
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(1, true)).toEqual('u2f.error.other.oneFactor');
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(2, true)).toEqual('u2f.error.badRequest.oneFactor');
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(3, true)).toEqual('u2f.error.badRequest.oneFactor');
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(4, true)).toEqual('u2f.error.unsupported.oneFactor');
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(5, true)).toEqual('u2f.error.timeout');

    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(1, false)).toEqual('u2f.error.other');
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(2, false)).toEqual('u2f.error.badRequest');
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(3, false)).toEqual('u2f.error.badRequest');
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(4, false)).toEqual('u2f.error.unsupported');
    expect(FidoUtil.getU2fVerifyErrorMessageKeyByCode(5, false)).toEqual('u2f.error.timeout');
  });

  it('Returns u2f enroll error message', function() {
    expect(FidoUtil.getU2fEnrollErrorMessageByCode(1)).toEqual(
      'An unknown error has occured. Try again or select another factor.'
    );
  });

  it('Returns u2f verify error message', function() {
    expect(FidoUtil.getU2fVerifyErrorMessageByCode(1, true)).toEqual(
      'An unknown error has occured. Try again or contact your admin for assistance.'
    );
    expect(FidoUtil.getU2fVerifyErrorMessageByCode(1, false)).toEqual(
      'An unknown error has occured. Try again or select another factor.'
    );
  });
});
