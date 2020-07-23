import { getClassNameMapping, getV1ClassName } from 'v2/ion/ViewClassNamesFactory';

describe('Adds the right classname', function () {

  it('for identify form with password', function () {
    const result = getClassNameMapping('identify', 'password', null);
    expect(result).toEqual(['identify--password', 'primary-auth']);
  });

  it('for identify form', function () {
    const result = getClassNameMapping('identify', null , null);
    expect(result).toEqual(['identify', 'primary-auth']);
  });

  it('for select-authenticator-authenticate form', function () {
    const result = getClassNameMapping('select-authenticator-authenticate', null , null);
    expect(result).toEqual(['select-authenticator-authenticate']);
  });
  it('for select-authenticator-authenticate form with password ', function () {
    const result = getClassNameMapping('select-authenticator-authenticate', 'password' , null);
    expect(result).toEqual(['select-authenticator-authenticate--password', 'forgot-password']);
  });

  it('for select-authenticator-enroll form', function () {
    const result = getClassNameMapping('select-authenticator-enroll', null , null);
    expect(result).toEqual(['select-authenticator-enroll', 'enroll-choices']);
  });

  it('for challenge-authenticator form with email ', function () {
    const result = getClassNameMapping('challenge-authenticator', 'email' , null);
    expect(result).toEqual(['challenge-authenticator--email', 'mfa-verify-passcode']);
  });

  it('for challenge-authenticator form with security_question ', function () {
    const result = getClassNameMapping('challenge-authenticator', 'security_question' , null);
    expect(result).toEqual(['challenge-authenticator--security_question', 'mfa-verify-question']);
  });

  it('for enroll-authenticator form with security_question ', function () {
    const result = getClassNameMapping('enroll-authenticator', 'security_question' , null);
    expect(result).toEqual(['enroll-authenticator--security_question', 'enroll-question']);
  });

  it('for enroll-authenticator form with email ', function () {
    const result = getClassNameMapping('enroll-authenticator', 'email' , null);
    expect(result).toEqual(['enroll-authenticator--email', 'enroll-email']);
  });

  it('for enroll-authenticator form with password ', function () {
    const result = getClassNameMapping('enroll-authenticator', 'password' , null);
    expect(result).toEqual(['enroll-authenticator--password', 'enroll-password']);
  });

  it('for enroll-authenticator form with sms ', function () {
    const result = getClassNameMapping('enroll-authenticator', 'sms' , null);
    expect(result).toEqual(['enroll-authenticator--sms', 'enroll-sms']);
  });

  it('for enroll-authenticator form with voice ', function () {
    const result = getClassNameMapping('enroll-authenticator', 'voice' , null);
    expect(result).toEqual(['enroll-authenticator--voice', 'enroll-call']);
  });


  it('for reenroll-authenticator form with voice ', function () {
    const result = getClassNameMapping('reenroll-authenticator', 'password' , null);
    expect(result).toEqual(['reenroll-authenticator--password', 'password-expired']);
  });

  it('for reset-authenticator form with voice ', function () {
    const result = getClassNameMapping('reset-authenticator', 'password' , null);
    expect(result).toEqual(['reset-authenticator--password', 'forgot-password']);
  });

  it('for success form', function () {
    const result = getClassNameMapping('success-redirect', null , null);
    expect(result).toEqual(['success-redirect']);
  });

  it('for terminal form ', function () {
    const result = getClassNameMapping('terminal', null , null);
    expect(result).toEqual(['terminal']);
  });

  it('for authenticator-verification-data form wih email method sms', function () {
    const result = getClassNameMapping('authenticator-verification-data', 'phone' , 'sms');
    expect(result).toEqual(['authenticator-verification-data--sms']);
  });

  it('for authenticator-verification-data form wih email method voice', function () {
    const result = getClassNameMapping('authenticator-verification-data', 'phone' , 'voice');
    expect(result).toEqual(['authenticator-verification-data--voice']);
  });

});

describe('getV1ClassName returns the right V1 classname', function () {
  it('for identify with recovery', function () {
    const result = getV1ClassName('identify', null, true);
    expect(result).toEqual(['forgot-password']);
  });

  it('for identify without recovery with password', function () {
    const result = getV1ClassName('identify', 'password', false);
    expect(result).toEqual(['primary-auth']);
  });
  
  it('for identify without recovery without password', function () {
    const result = getV1ClassName('identify', 'identify', false);
    expect(result).toEqual(['primary-auth']);
  });

  it('for enroll-profile without recovery', function () {
    const result = getV1ClassName('enroll-profile', 'enroll-profile', false);
    expect(result).toEqual(['registration']);
  });
});