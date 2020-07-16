import { Collection } from 'okta';
import FormInputFactory from 'v2/view-builder/internals/FormInputFactory';
import FactorEnrollOptions from 'v2/view-builder/components/FactorOptions';
import AuthenticatorVerifyOptions from 'v2/view-builder/components/AuthenticatorVerifyOptions';
import AuthenticatorEnrollOptions from 'v2/view-builder/components/AuthenticatorEnrollOptions';

describe('v2/view-builder/internals/FormInputFactory', function () {
  it('handles factorType type', function () {
    const opt = {
      type: 'factorSelect',
      options: [
        {
          'label': 'Okta Password',
          'value': 'password-id-123',
          'factorType': 'password'
        },
        {
          'label': 'Okta E-mail',
          'value': 'email-id-123',
          'factorType': 'email'
        }
      ],
      name: 'factorType'
    };
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: FactorEnrollOptions,
      options: {
        collection: jasmine.anything(),
        name: 'factorType'
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        'label': 'Okta Password',
        'value': 'password-id-123',
        'factorType': 'password',
        'iconClassName': 'mfa-okta-password',
        'description': 'Choose a password for your account'
      },
      {
        'label': 'Okta E-mail',
        'value': 'email-id-123',
        'factorType': 'email',
        'iconClassName': 'mfa-okta-email',
        'description': 'Verify with a link or code sent to your email'
      }
    ]);
    expect(opt).toEqual({
      type: 'factorSelect',
      options: [
        {
          'label': 'Okta Password',
          'value': 'password-id-123',
          'factorType': 'password'
        },
        {
          'label': 'Okta E-mail',
          'value': 'email-id-123',
          'factorType': 'email'
        }
      ],
      name: 'factorType'
    });
  });

  it('handles authenticatorVerify Select type', function () {
    const opt = {
      type: 'authenticatorVerifySelect',
      options: [
        {
          'label': 'Okta Password',
          'authenticatorType': 'password',
          'value': {
            id: 'autwa6eD9o02iBbtv0g3'
          }
        },
        {
          'label': 'Okta E-mail',
          'authenticatorType': 'email',
          'value': {
            id: 'autwa6eDxxx2iBbtv0g3'
          }
        }
      ],
      name: 'authenticator'
    };
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: AuthenticatorVerifyOptions,
      options: {
        collection: jasmine.anything(),
        name: 'authenticator'
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        'label': 'Okta Password',
        'authenticatorType': 'password',
        'value': {
          id: 'autwa6eD9o02iBbtv0g3'
        },
        'iconClassName': 'mfa-okta-password',
        'description': 'Choose a password for your account'
      },
      {
        'label': 'Okta E-mail',
        'authenticatorType': 'email',
        'value': {
          id: 'autwa6eDxxx2iBbtv0g3'
        },
        'iconClassName': 'mfa-okta-email',
        'description': 'Verify with a link or code sent to your email'
      }
    ]);
    // make sure input parameter is not mutated.
    expect(opt).toEqual({
      type: 'authenticatorVerifySelect',
      options: [
        {
          'label': 'Okta Password',
          'authenticatorType': 'password',
          'value': {
            id: 'autwa6eD9o02iBbtv0g3'
          }
        },
        {
          'label': 'Okta E-mail',
          'authenticatorType': 'email',
          'value': {
            id: 'autwa6eDxxx2iBbtv0g3'
          }
        }
      ],
      name: 'authenticator'
    });
  });

  it('filters additional webauthn enrollments for authenticatorVerify Select type', function () {
    const opt = {
      type: 'authenticatorVerifySelect',
      options: [
        {
          'label': 'Security Key or Biometric Authenticator',
          'authenticatorType': 'security_key',
          'value': {
            id: 'autwa6eDxxx2iBbtv0g3'
          }
        },{
          'label': 'Security Key or Biometric Authenticator',
          'authenticatorType': 'security_key',
          'value': {
            id: 'fwftheidkwh282hv8g3'
          }
        },{
          'label': 'Okta Password',
          'authenticatorType': 'password',
          'value': {
            id: 'autwa6eD9o02iBbtv0g3'
          }
        }
      ],
      name: 'authenticator'
    };
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: AuthenticatorVerifyOptions,
      options: {
        collection: jasmine.anything(),
        name: 'authenticator'
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        'label': 'Security Key or Biometric Authenticator',
        'authenticatorType': 'security_key',
        'value': {
          id: 'autwa6eDxxx2iBbtv0g3'
        },
        'iconClassName': 'mfa-webauthn',
        'description': 'Use a security key or a biometric authenticator to sign in'
      }, {
        'label': 'Okta Password',
        'authenticatorType': 'password',
        'value': {
          id: 'autwa6eD9o02iBbtv0g3'
        },
        'iconClassName': 'mfa-okta-password',
        'description': 'Choose a password for your account'
      }
    ]);
    // make sure input parameter is not mutated.
    expect(opt).toEqual({
      type: 'authenticatorVerifySelect',
      options: [
        {
          'label': 'Security Key or Biometric Authenticator',
          'authenticatorType': 'security_key',
          'value': {
            id: 'autwa6eDxxx2iBbtv0g3'
          }
        },{
          'label': 'Security Key or Biometric Authenticator',
          'authenticatorType': 'security_key',
          'value': {
            id: 'fwftheidkwh282hv8g3'
          }
        },  {
          'label': 'Okta Password',
          'authenticatorType': 'password',
          'value': {
            id: 'autwa6eD9o02iBbtv0g3'
          }
        }
      ],
      name: 'authenticator'
    });
  });

  it('handles authenticatorEnrollSelect type', function () {
    const opt = {
      type: 'authenticatorEnrollSelect',
      options: [
        {
          'label': 'Okta Password',
          'authenticatorType': 'password',
          'value': {
            id: 'autwa6eD9o02iBbtv0g3'
          }
        },
        {
          'label': 'Okta E-mail',
          'authenticatorType': 'email',
          'value': {
            id: 'autwa6eDxxx2iBbtv0g3'
          }
        }
      ],
      name: 'authenticator'
    };
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: AuthenticatorEnrollOptions,
      options: {
        collection: jasmine.anything(),
        name: 'authenticator'
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        'label': 'Okta Password',
        'authenticatorType': 'password',
        'value': {
          id: 'autwa6eD9o02iBbtv0g3'
        },
        'iconClassName': 'mfa-okta-password',
        'description': 'Choose a password for your account'
      },
      {
        'label': 'Okta E-mail',
        'authenticatorType': 'email',
        'value': {
          id: 'autwa6eDxxx2iBbtv0g3'
        },
        'iconClassName': 'mfa-okta-email',
        'description': 'Verify with a link or code sent to your email'
      }
    ]);
    // make sure input parameter is not mutated.
    expect(opt).toEqual({
      type: 'authenticatorEnrollSelect',
      options: [
        {
          'label': 'Okta Password',
          'authenticatorType': 'password',
          'value': {
            id: 'autwa6eD9o02iBbtv0g3'
          }
        },
        {
          'label': 'Okta E-mail',
          'authenticatorType': 'email',
          'value': {
            id: 'autwa6eDxxx2iBbtv0g3'
          }
        }
      ],
      name: 'authenticator'
    });
  });
});
