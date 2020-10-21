import { getClassNameMapping, getV1ClassName } from 'v2/ion/ViewClassNamesFactory';

describe('v1/ion/ViewClassNamesFactory', function () {
  describe('getClassNameMapping for v2 flow plus getV1ClassName', function () {
    it('for identify form with password', function () {
      const v2Class = getClassNameMapping('identify', 'password', null, false);
      expect(v2Class).toEqual(['identify--password', 'primary-auth']);

      const v1Class = getV1ClassName('identify', 'password', null, false);
      expect(v1Class).toEqual('primary-auth');
    });

    it('for identify form', function () {
      const v2Class = getClassNameMapping('identify', null, null);
      expect(v2Class).toEqual(['identify', 'primary-auth']);

      const v1Class = getV1ClassName('identify', null, null);
      expect(v1Class).toEqual('primary-auth');
    });

    it('for select-authenticator-authenticate form', function () {
      const v2Class = getClassNameMapping('select-authenticator-authenticate', null, null);
      expect(v2Class).toEqual(['select-authenticator-authenticate']);

      const v1Class = getV1ClassName('select-authenticator-authenticate', null, null);
      expect(v1Class).toEqual(null);
    });

    it('for select-authenticator-authenticate form with password', function () {
      const v2Class = getClassNameMapping('select-authenticator-authenticate', 'password', null);
      expect(v2Class).toEqual(['select-authenticator-authenticate--password', 'forgot-password']);

      const v1Class = getV1ClassName('select-authenticator-authenticate', 'password', null);
      expect(v1Class).toEqual('forgot-password');
    });

    it('for select-authenticator-enroll form', function () {
      const v2Class = getClassNameMapping('select-authenticator-enroll', null, null);
      expect(v2Class).toEqual(['select-authenticator-enroll', 'enroll-choices']);

      const v1Class = getV1ClassName('select-authenticator-enroll', null, null);
      expect(v1Class).toEqual('enroll-choices');
    });

    it('for challenge-authenticator form with email', function () {
      const v2Class = getClassNameMapping('challenge-authenticator', 'email', null);
      expect(v2Class).toEqual(['challenge-authenticator--email', 'mfa-verify-passcode']);

      const v1Class = getV1ClassName('challenge-authenticator', 'email', null);
      expect(v1Class).toEqual('mfa-verify-passcode');
    });

    it('for challenge-authenticator form with security_question', function () {
      const v2Class = getClassNameMapping('challenge-authenticator', 'security_question', null);
      expect(v2Class).toEqual(['challenge-authenticator--security_question', 'mfa-verify-question']);

      const v1Class = getV1ClassName('challenge-authenticator', 'security_question', null);
      expect(v1Class).toEqual('mfa-verify-question');
    });

    it('for enroll-authenticator form with security_question', function () {
      const v2Class = getClassNameMapping('enroll-authenticator', 'security_question', null);
      expect(v2Class).toEqual(['enroll-authenticator--security_question', 'enroll-question']);

      const v1Class = getV1ClassName('enroll-authenticator', 'security_question', null);
      expect(v1Class).toEqual('enroll-question');
    });

    it('for enroll-authenticator form with email', function () {
      const v2Class = getClassNameMapping('enroll-authenticator', 'email', null);
      expect(v2Class).toEqual(['enroll-authenticator--email', 'enroll-email']);

      const v1Class = getV1ClassName('enroll-authenticator', 'email', null);
      expect(v1Class).toEqual('enroll-email');
    });

    it('for enroll-authenticator form with password', function () {
      const v2Class = getClassNameMapping('enroll-authenticator', 'password', null);
      expect(v2Class).toEqual(['enroll-authenticator--password', 'enroll-password']);

      const v1Class = getV1ClassName('enroll-authenticator', 'password', null);
      expect(v1Class).toEqual('enroll-password');
    });

    it('for enroll-authenticator form with sms', function () {
      const v2Class = getClassNameMapping('enroll-authenticator', 'phone', 'sms', null);
      expect(v2Class).toEqual(['enroll-authenticator--phone--sms', 'enroll-sms']);

      const v1Class = getV1ClassName('enroll-authenticator', 'phone', 'sms', null);
      expect(v1Class).toEqual('enroll-sms');
    });

    it('for enroll-authenticator form with voice', function () {
      const v2Class = getClassNameMapping('enroll-authenticator', 'phone', 'voice', null);
      expect(v2Class).toEqual(['enroll-authenticator--phone--voice', 'enroll-call']);

      const v1Class = getV1ClassName('enroll-authenticator', 'phone', 'voice', null);
      expect(v1Class).toEqual('enroll-call');
    });

    it('for reenroll-authenticator form with voice', function () {
      const v2Class = getClassNameMapping('reenroll-authenticator', 'password', null);
      expect(v2Class).toEqual(['reenroll-authenticator--password', 'password-expired']);

      const v1Class = getV1ClassName('reenroll-authenticator', 'password', null);
      expect(v1Class).toEqual('password-expired');
    });

    it('for reset-authenticator form with voice', function () {
      const v2Class = getClassNameMapping('reset-authenticator', 'password', null);
      expect(v2Class).toEqual(['reset-authenticator--password', 'forgot-password']);

      const v1Class = getV1ClassName('reset-authenticator', 'password', null);
      expect(v1Class).toEqual('forgot-password');
    });

    it('for success form', function () {
      const v2Class = getClassNameMapping('success-redirect', null, null);
      expect(v2Class).toEqual(['success-redirect']);

      const v1Class = getV1ClassName('success-redirect', null, null);
      expect(v1Class).toEqual(null);
    });

    it('for terminal form', function () {
      const v2Class = getClassNameMapping('terminal', null, null);
      expect(v2Class).toEqual(['terminal']);

      const v1Class = getV1ClassName('terminal', null, null);
      expect(v1Class).toEqual(null);
    });

    it('for authenticator-verification-data form wih email method sms', function () {
      const v2Class = getClassNameMapping('authenticator-verification-data', 'phone', 'sms');
      expect(v2Class).toEqual(['authenticator-verification-data--phone--sms']);

      const v1Class = getV1ClassName('authenticator-verification-data', null, null);
      expect(v1Class).toEqual(null);
    });

    it('for authenticator-verification-data form wih email method voice', function () {
      const v2Class = getClassNameMapping('authenticator-verification-data', 'phone', 'voice');
      expect(v2Class).toEqual(['authenticator-verification-data--phone--voice']);

      const v1Class = getV1ClassName('authenticator-verification-data', null, null);
      expect(v1Class).toEqual(null);
    });
  });
});
