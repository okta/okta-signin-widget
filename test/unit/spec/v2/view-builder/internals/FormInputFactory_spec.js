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
    const input = {
      'name':'authenticator',
      'type':'authenticatorVerifySelect',
      'options':[
        {
          'label':'Okta Password',
          'value':{
            'id':'aidwboITrg4b4yAYd0g3'
          },
          'relatesTo':{
            'displayName':'Okta Password',
            'type':'password',
            'id':'autwa6eD9o02iBbtv0g1',
            'authenticatorId':'aidwboITrg4b4yAYd0g3'
          },
          'authenticatorType':'password'
        },
        {
          'label':'Security Key or Biometric Authenticator',
          'value':{
            'id':'fwftheidkwh282hv8g3'
          },
          'relatesTo':{
            'displayName':'FIDO2 (WebAuthn)',
            'type':'security_key',
            'id':'autwa6eD9o02iBbtv0g2',
            'authenticatorId':'aidtheidkwh282hv8g3'
          },
          'authenticatorType':'security_key'
        },
        {
          'label':'Security Key or Biometric Authenticator',
          'value':{
            'id':'aidtheidkwh282hv8g3'
          },
          'relatesTo':{
            'displayName':'FIDO2 (WebAuthn)',
            'type':'security_key',
            'id':'autwa6eD9o02iBbtv0g2',
            'authenticatorId':'fwftheidkwh282hv8g3'
          },
          'authenticatorType':'security_key'
        },
        {
          'label':'Okta Email',
          'value':{
            'id':'aidtm56L8gXXHI1SD0g3'
          },
          'relatesTo':{
            'displayName':'Okta Email',
            'type':'email',
            'authenticatorId':'aidtm56L8gXXHI1SD0g3',
            'id':'autwa6eD9o02iBbtv0g3',
            'methods':[
              {
                'methodType':'email'
              }
            ]
          },
          'authenticatorType':'email'
        },
        {
          'label':'Phone',
          'value':{
            'id':'aut5v31Tb789KuCGY0g4',
            'enrollmentId':'pae5ykx4eIvfslkO90g4'
          },
          'relatesTo':{
            'profile':{
              'phoneNumber':'+1 XXX-XXX-5309'
            },
            'type':'phone',
            'id':'pae5ykx4eIvfslkO90g4',
            'displayName':'Phone Number',
            'methods':[
              {
                'type':'sms'
              },
              {
                'type':'voice'
              }
            ]
          },
          'authenticatorType':'phone'
        },
        {
          'label':'Phone',
          'value':{
            'id':'aut5v31Tb789KuCGY0g4',
            'enrollmentId':'pae5ykzcnhmdfSMuQ0g4'
          },
          'relatesTo':{
            'profile':{
              'phoneNumber':'+1 XXX-XXX-5310'
            },
            'type':'phone',
            'id':'pae5ykzcnhmdfSMuQ0g4',
            'displayName':'Phone Number',
            'methods':[
              {
                'type':'sms'
              },
              {
                'type':'voice'
              }
            ]
          },
          'authenticatorType':'phone'
        },
        {
          'label':'Okta Security Question',
          'value':{
            'id':'aid568g3mXgtID0HHSLH'
          },
          'relatesTo':{
            'displayName':'Okta Security Question',
            'type':'security_question',
            'authenticatorId':'aid568g3mXgtID0HHSLH',
            'id':'autwa6eD9o02iBbaaa82'
          },
          'authenticatorType':'security_question'
        },
        {
          'label':'Okta Verify',
          'value':{
            'id':'auttheidkwh282hv8g3',
            'methodType':'signed_nonce'
          },
          'relatesTo':{
            'displayName':'Okta Verify Device 1',
            'type':'app',
            'id':'aen1mz5J4cuNoaR3l0g4',
            'authenticatorId':'auttheidkwh282hv8g3',
            'methods':[
              {
                'type':'signed_nonce'
              }
            ]
          },
          'authenticatorType':'app'
        }
      ],
    };
    // Create a copy of input object.
    const opt = JSON.parse(JSON.stringify(input));
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
        'label':'Okta Password',
        'value':{
          'id':'aidwboITrg4b4yAYd0g3'
        },
        'relatesTo':{
          'displayName':'Okta Password',
          'type':'password',
          'id':'autwa6eD9o02iBbtv0g1',
          'authenticatorId':'aidwboITrg4b4yAYd0g3'
        },
        'authenticatorType':'password',
        'description':'',
        'iconClassName':'mfa-okta-password'
      },
      {
        'label':'Security Key or Biometric Authenticator',
        'value':{
          'id':'fwftheidkwh282hv8g3'
        },
        'relatesTo':{
          'displayName':'FIDO2 (WebAuthn)',
          'type':'security_key',
          'id':'autwa6eD9o02iBbtv0g2',
          'authenticatorId':'aidtheidkwh282hv8g3'
        },
        'authenticatorType':'security_key',
        'description':'',
        'iconClassName':'mfa-webauthn'
      },
      {
        'label':'Okta Email',
        'value':{
          'id':'aidtm56L8gXXHI1SD0g3'
        },
        'relatesTo':{
          'displayName':'Okta Email',
          'type':'email',
          'authenticatorId':'aidtm56L8gXXHI1SD0g3',
          'id':'autwa6eD9o02iBbtv0g3',
          'methods':[
            {
              'methodType':'email'
            }
          ]
        },
        'authenticatorType':'email',
        'description':'',
        'iconClassName':'mfa-okta-email'
      },
      {
        'label':'Phone',
        'value':{
          'id':'aut5v31Tb789KuCGY0g4',
          'enrollmentId':'pae5ykx4eIvfslkO90g4'
        },
        'relatesTo':{
          'profile':{
            'phoneNumber':'+1 XXX-XXX-5309'
          },
          'type':'phone',
          'id':'pae5ykx4eIvfslkO90g4',
          'displayName':'Phone Number',
          'methods':[
            {
              'type':'sms'
            },
            {
              'type':'voice'
            }
          ]
        },
        'authenticatorType':'phone',
        'description':'+1 XXX-XXX-5309',
        'iconClassName':'mfa-okta-phone'
      },
      {
        'label':'Phone',
        'value':{
          'id':'aut5v31Tb789KuCGY0g4',
          'enrollmentId':'pae5ykzcnhmdfSMuQ0g4'
        },
        'relatesTo':{
          'profile':{
            'phoneNumber':'+1 XXX-XXX-5310'
          },
          'type':'phone',
          'id':'pae5ykzcnhmdfSMuQ0g4',
          'displayName':'Phone Number',
          'methods':[
            {
              'type':'sms'
            },
            {
              'type':'voice'
            }
          ]
        },
        'authenticatorType':'phone',
        'description':'+1 XXX-XXX-5310',
        'iconClassName':'mfa-okta-phone'
      },
      {
        'label':'Okta Security Question',
        'value':{
          'id':'aid568g3mXgtID0HHSLH'
        },
        'relatesTo':{
          'displayName':'Okta Security Question',
          'type':'security_question',
          'authenticatorId':'aid568g3mXgtID0HHSLH',
          'id':'autwa6eD9o02iBbaaa82'
        },
        'authenticatorType':'security_question',
        'description':'',
        'iconClassName':'mfa-okta-security-question'
      },
      {
        'label':'Okta Verify',
        'value':{
          'id':'auttheidkwh282hv8g3',
          'methodType':'signed_nonce'
        },
        'relatesTo':{
          'displayName':'Okta Verify Device 1',
          'type':'app',
          'id':'aen1mz5J4cuNoaR3l0g4',
          'authenticatorId':'auttheidkwh282hv8g3',
          'methods':[
            {
              'type':'signed_nonce'
            }
          ]
        },
        'authenticatorType':'app',
        'description': '',
        'iconClassName':'mfa-okta-verify'
      }
    ]);
    // make sure input parameter is not mutated.
    expect(opt).toEqual(input);
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
        'description': ''
      }, {
        'label': 'Okta Password',
        'authenticatorType': 'password',
        'value': {
          id: 'autwa6eD9o02iBbtv0g3'
        },
        'iconClassName': 'mfa-okta-password',
        'description': ''
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
    // Create a copy of input object.
    const input = {
      'name': 'authenticator',
      'required': true,
      'type': 'authenticatorEnrollSelect',
      'options': [
        {
          'label': 'Okta Password',
          'value': {
            'id': 'autwa6eD9o02iBbtv0g3'
          },
          'relatesTo': {
            'displayName': 'Okta Password',
            'type': 'password',
            'authenticatorId': 'autwa6eD9o02iBbtv0g3',
            'id': 'password-enroll-id-123'
          },
          'authenticatorType': 'password'
        },
        {
          'label': 'Okta Phone',
          'value': {
            'id': 'aid568g3mXgtID0X1SLH'
          },
          'relatesTo': {
            'displayName': 'Okta Phone',
            'type': 'phone',
            'authenticatorId': 'aid568g3mXgtID0X1SLH',
            'id': 'phone-enroll-id-123'
          },
          'authenticatorType': 'phone'
        },
        {
          'label':'Okta Email',
          'value':{
            'id':'aidtm56L8gXXHI1SD0g3'
          },
          'relatesTo':{
            'displayName':'Okta Email',
            'type':'email',
            'authenticatorId':'aidtm56L8gXXHI1SD0g3',
            'id':'autwa6eD9o02iBbtv0g3',
            'methods':[
              {
                'methodType':'email'
              }
            ]
          },
          'authenticatorType':'email'
        },
        {
          'label': 'Security Key or Biometric Authenticator',
          'value': {
            'id': 'aidtheidkwh282hv8g3'
          },
          'relatesTo': {
            'displayName': 'Security Key or Biometric Authenticator (FIDO2)',
            'type': 'security_key',
            'authenticatorid': 'aidtheidkwh282hv8g3',
            'id': 'webauthn-enroll-id-123'
          },
          'authenticatorType': 'security_key'
        },
        {
          'label': 'Okta Security Question',
          'value': {
            'id': 'aid568g3mXgtID0X1GGG'
          },
          'relatesTo': {
            'displayName': 'Okta Security Question',
            'type': 'security_question',
            'authenticatorId': 'aid568g3mXgtID0X1GGG',
            'id': 'security-question-enroll-id-123'
          },
          'authenticatorType': 'security_question'
        },
        {
          'label':'Okta Verify',
          'value':{
            'id':'auttheidkwh282hv8g3',
            'methodType':'signed_nonce'
          },
          'relatesTo':{
            'displayName':'Okta Verify Device 1',
            'type':'app',
            'id':'aen1mz5J4cuNoaR3l0g4',
            'authenticatorId':'auttheidkwh282hv8g3',
            'methods':[
              {
                'type':'signed_nonce'
              }
            ]
          },
          'authenticatorType':'app'
        }
      ],
      'label-top': true
    };
    const opt = JSON.parse(JSON.stringify(input));
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
        'label':'Okta Password',
        'value':{
          'id':'autwa6eD9o02iBbtv0g3'
        },
        'relatesTo':{
          'displayName':'Okta Password',
          'type':'password',
          'authenticatorId':'autwa6eD9o02iBbtv0g3',
          'id':'password-enroll-id-123'
        },
        'authenticatorType':'password',
        'description':'Choose a password for your account',
        'iconClassName':'mfa-okta-password'
      },
      {
        'label':'Okta Phone',
        'value':{
          'id':'aid568g3mXgtID0X1SLH'
        },
        'relatesTo':{
          'displayName':'Okta Phone',
          'type':'phone',
          'authenticatorId':'aid568g3mXgtID0X1SLH',
          'id':'phone-enroll-id-123'
        },
        'authenticatorType':'phone',
        'description':'Verify with a code sent to your phone',
        'iconClassName':'mfa-okta-phone'
      },
      {
        'label':'Okta Email',
        'value':{
          'id':'aidtm56L8gXXHI1SD0g3'
        },
        'relatesTo':{
          'displayName':'Okta Email',
          'type':'email',
          'authenticatorId':'aidtm56L8gXXHI1SD0g3',
          'id':'autwa6eD9o02iBbtv0g3',
          'methods':[
            {
              'methodType':'email'
            }
          ]
        },
        'authenticatorType':'email',
        'description':'Verify with a link or code sent to your email',
        'iconClassName':'mfa-okta-email'
      },
      {
        'label':'Security Key or Biometric Authenticator',
        'value':{
          'id':'aidtheidkwh282hv8g3'
        },
        'relatesTo':{
          'displayName':'Security Key or Biometric Authenticator (FIDO2)',
          'type':'security_key',
          'authenticatorid':'aidtheidkwh282hv8g3',
          'id':'webauthn-enroll-id-123'
        },
        'authenticatorType':'security_key',
        'description':'Use a security key or a biometric authenticator to sign in',
        'iconClassName':'mfa-webauthn'
      },
      {
        'label':'Okta Security Question',
        'value':{
          'id':'aid568g3mXgtID0X1GGG'
        },
        'relatesTo':{
          'displayName':'Okta Security Question',
          'type':'security_question',
          'authenticatorId':'aid568g3mXgtID0X1GGG',
          'id':'security-question-enroll-id-123'
        },
        'authenticatorType':'security_question',
        'description':'Choose a security question and answer that will be used for signing in',
        'iconClassName':'mfa-okta-security-question'
      },
      {
        'label':'Okta Verify',
        'value':{
          'id':'auttheidkwh282hv8g3',
          'methodType':'signed_nonce'
        },
        'relatesTo':{
          'displayName':'Okta Verify Device 1',
          'type':'app',
          'id':'aen1mz5J4cuNoaR3l0g4',
          'authenticatorId':'auttheidkwh282hv8g3',
          'methods':[
            {
              'type':'signed_nonce'
            }
          ]
        },
        'authenticatorType':'app',
        'description':'Okta Verify is an authenticator app, installed on your phone or computer, used to prove your identity',
        'iconClassName':'mfa-okta-verify'
      }
    ]);
    // make sure input parameter is not mutated.
    expect(opt).toEqual(input);
  });
});
