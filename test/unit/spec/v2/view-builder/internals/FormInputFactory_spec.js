import { Collection } from 'okta';
import * as FormInputFactory from 'v2/view-builder/internals/FormInputFactory';
import AuthenticatorVerifyOptions from 'v2/view-builder/components/AuthenticatorVerifyOptions';
import AuthenticatorEnrollOptions from 'v2/view-builder/components/AuthenticatorEnrollOptions';

describe('v2/view-builder/internals/FormInputFactory', function() {
  it('handles authenticatorVerify Select type', function() {
    const input = {
      name: 'authenticator',
      type: 'authenticatorVerifySelect',
      options: [
        {
          label: 'Okta Password',
          value: {
            id: 'aidwboITrg4b4yAYd0g3',
          },
          relatesTo: {
            displayName: 'Okta Password',
            type: 'password',
            key: 'okta_password',
            id: 'autwa6eD9o02iBbtv0g1',
            authenticatorId: 'aidwboITrg4b4yAYd0g3',
          },
          authenticatorKey: 'okta_password',
        },
        {
          label: 'Security Key or Biometric Authenticator',
          value: {
            id: 'fwftheidkwh282hv8g3',
          },
          relatesTo: {
            displayName: 'FIDO2 (WebAuthn)',
            type: 'security_key',
            key: 'webauthn',
            id: 'autwa6eD9o02iBbtv0g2',
            authenticatorId: 'aidtheidkwh282hv8g3',
          },
          authenticatorKey: 'webauthn',
        },
        {
          label: 'Security Key or Biometric Authenticator',
          value: {
            id: 'aidtheidkwh282hv8g3',
          },
          relatesTo: {
            displayName: 'FIDO2 (WebAuthn)',
            type: 'security_key',
            key: 'webauthn',
            id: 'autwa6eD9o02iBbtv0g2',
            authenticatorId: 'fwftheidkwh282hv8g3',
          },
          authenticatorKey: 'webauthn',
        },
        {
          label: 'Okta Email',
          value: {
            id: 'aidtm56L8gXXHI1SD0g3',
          },
          relatesTo: {
            displayName: 'Okta Email',
            type: 'email',
            key: 'okta_email',
            authenticatorId: 'aidtm56L8gXXHI1SD0g3',
            id: 'autwa6eD9o02iBbtv0g3',
            methods: [
              {
                methodType: 'email',
              },
            ],
          },
          authenticatorKey: 'okta_email',
        },
        {
          label: 'Phone',
          value: {
            id: 'aut5v31Tb789KuCGY0g4',
            enrollmentId: 'pae5ykx4eIvfslkO90g4',
          },
          relatesTo: {
            profile: {
              phoneNumber: '+1 XXX-XXX-5309',
            },
            type: 'phone',
            key: 'phone_number',
            id: 'pae5ykx4eIvfslkO90g4',
            displayName: 'Phone Number',
            methods: [
              {
                type: 'sms',
              },
              {
                type: 'voice',
              },
            ],
          },
          authenticatorKey: 'phone_number',
        },
        {
          label: 'Phone',
          value: {
            id: 'aut5v31Tb789KuCGY0g4',
            enrollmentId: 'pae5ykzcnhmdfSMuQ0g4',
          },
          relatesTo: {
            profile: {
              phoneNumber: '+1 XXX-XXX-5310',
            },
            type: 'phone',
            key: 'phone_number',
            id: 'pae5ykzcnhmdfSMuQ0g4',
            displayName: 'Phone Number',
            methods: [
              {
                type: 'sms',
              },
              {
                type: 'voice',
              },
            ],
          },
          authenticatorKey: 'phone_number',
        },
        {
          label: 'Okta Security Question',
          value: {
            id: 'aid568g3mXgtID0HHSLH',
          },
          relatesTo: {
            displayName: 'Okta Security Question',
            type: 'security_question',
            key: 'security_question',
            authenticatorId: 'aid568g3mXgtID0HHSLH',
            id: 'autwa6eD9o02iBbaaa82',
          },
          authenticatorKey: 'security_question',
        },
        {
          label: 'Enter a code',
          value: {
            id: 'auttheidkwh282hv8g3',
            methodType: 'totp',
          },
          relatesTo: {
            profile: {
              deviceName: 'iPhone',
            },
            type: 'app',
            key: 'okta_verify',
            id: 'pfd4992vzbDhG7FO60g7',
            displayName: 'Okta Verify',
            methods: [
              {
                type: 'push',
              },
              {
                type: 'totp',
              },
            ],
          },
          authenticatorKey: 'okta_verify',
        },
        {
          label: 'Get a push notification',
          value: {
            id: 'auttheidkwh282hv8g3',
            methodType: 'push',
          },
          relatesTo: {
            profile: {
              deviceName: 'iPhone',
            },
            type: 'app',
            key: 'okta_verify',
            id: 'pfd4992vzbDhG7FO60g7',
            displayName: 'Okta Verify',
            methods: [
              {
                type: 'push',
              },
              {
                type: 'totp',
              },
            ],
          },
          authenticatorKey: 'okta_verify',
        },
        {
          label: 'Use Okta FastPass',
          value: {
            id: 'auttheidkwh282hv8g3',
            methodType: 'signed_nonce',
          },
          relatesTo: {
            profile: {
              deviceName: 'iPhone',
            },
            type: 'app',
            key: 'okta_verify',
            id: 'pfd4992vzbDhG7FO60g7',
            displayName: 'Okta Verify',
            methods: [
              {
                type: 'push',
              },
              {
                type: 'totp',
              },
            ],
          },
          authenticatorKey: 'okta_verify',
        },
        {
          label: 'Google Authenticator',
          value: {
            id: 'auttheidkwh482hv8g3',
          },
          relatesTo: {
            displayName: 'Google Authenticator',
            type: 'app',
            key: 'google_otp',
            authenticatorId: 'aut1erh5wK1M8wA3g0g3',
            id: 'okta-verify-enroll-id-124',
            methods: [
              {
                type: 'otp'
              }
            ]
          },
          authenticatorKey:'google_otp',
        },
        {
          label: 'Get a push notification',
          value: {
            id: 'aut198w4v0f8dr8gT0g4',
          },
          relatesTo: {
            profile: {
              deviceName: 'Todd’s iPhone',
            },
            type: 'app',
            key: 'custom_app',
            id: 'pfd1bmoy4nH6heq2v0g4',
            displayName: 'Custom Push App',
            logoUri:
              'https://cdn.okta1.com/bc/globalFileStoreRecord?id=gfs3sti6DQ7A9vS3h0g4',
            methods: [
              {
                type: 'push',
              },
            ],
          },
          authenticatorKey: 'custom_app',
        },
      ],
    };
    // Create a copy of input object.
    const opt = JSON.parse(JSON.stringify(input));
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: AuthenticatorVerifyOptions,
      options: {
        collection: jasmine.anything(),
        name: 'authenticator',
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        label: 'Okta Password',
        value: {
          id: 'aidwboITrg4b4yAYd0g3',
        },
        relatesTo: {
          displayName: 'Okta Password',
          type: 'password',
          key: 'okta_password',
          id: 'autwa6eD9o02iBbtv0g1',
          authenticatorId: 'aidwboITrg4b4yAYd0g3',
        },
        authenticatorKey: 'okta_password',
        description: '',
        iconClassName: 'mfa-okta-password',
        buttonDataSeAttr: 'okta_password',
      },
      {
        label: 'Security Key or Biometric Authenticator',
        value: {
          id: 'fwftheidkwh282hv8g3',
        },
        relatesTo: {
          displayName: 'FIDO2 (WebAuthn)',
          type: 'security_key',
          key: 'webauthn',
          id: 'autwa6eD9o02iBbtv0g2',
          authenticatorId: 'aidtheidkwh282hv8g3',
        },
        authenticatorKey: 'webauthn',
        description: '',
        iconClassName: 'mfa-webauthn',
        buttonDataSeAttr: 'webauthn',
      },
      {
        label: 'Okta Email',
        value: {
          id: 'aidtm56L8gXXHI1SD0g3',
        },
        relatesTo: {
          displayName: 'Okta Email',
          type: 'email',
          key: 'okta_email',
          authenticatorId: 'aidtm56L8gXXHI1SD0g3',
          id: 'autwa6eD9o02iBbtv0g3',
          methods: [
            {
              methodType: 'email',
            },
          ],
        },
        authenticatorKey: 'okta_email',
        description: '',
        iconClassName: 'mfa-okta-email',
        buttonDataSeAttr: 'okta_email',
      },
      {
        label: 'Phone',
        noTranslateClassName: 'no-translate',
        value: {
          id: 'aut5v31Tb789KuCGY0g4',
          enrollmentId: 'pae5ykx4eIvfslkO90g4',
        },
        relatesTo: {
          profile: {
            phoneNumber: '+1 XXX-XXX-5309',
          },
          type: 'phone',
          key: 'phone_number',
          id: 'pae5ykx4eIvfslkO90g4',
          displayName: 'Phone Number',
          methods: [
            {
              type: 'sms',
            },
            {
              type: 'voice',
            },
          ],
        },
        authenticatorKey: 'phone_number',
        description: '+1 XXX-XXX-5309',
        iconClassName: 'mfa-okta-phone',
        buttonDataSeAttr: 'phone_number',
      },
      {
        label: 'Phone',
        noTranslateClassName: 'no-translate',
        value: {
          id: 'aut5v31Tb789KuCGY0g4',
          enrollmentId: 'pae5ykzcnhmdfSMuQ0g4',
        },
        relatesTo: {
          profile: {
            phoneNumber: '+1 XXX-XXX-5310',
          },
          type: 'phone',
          key: 'phone_number',
          id: 'pae5ykzcnhmdfSMuQ0g4',
          displayName: 'Phone Number',
          methods: [
            {
              type: 'sms',
            },
            {
              type: 'voice',
            },
          ],
        },
        authenticatorKey: 'phone_number',
        description: '+1 XXX-XXX-5310',
        iconClassName: 'mfa-okta-phone',
        buttonDataSeAttr: 'phone_number',
      },
      {
        label: 'Okta Security Question',
        value: {
          id: 'aid568g3mXgtID0HHSLH',
        },
        relatesTo: {
          displayName: 'Okta Security Question',
          type: 'security_question',
          key: 'security_question',
          authenticatorId: 'aid568g3mXgtID0HHSLH',
          id: 'autwa6eD9o02iBbaaa82',
        },
        authenticatorKey: 'security_question',
        description: '',
        iconClassName: 'mfa-okta-security-question',
        buttonDataSeAttr: 'security_question',
      },
      {
        label: 'Enter a code',
        value: {
          id: 'auttheidkwh282hv8g3',
          methodType: 'totp',
        },
        relatesTo: {
          profile: {
            deviceName: 'iPhone',
          },
          type: 'app',
          key: 'okta_verify',
          id: 'pfd4992vzbDhG7FO60g7',
          displayName: 'Okta Verify',
          methods: [
            {
              type: 'push',
            },
            {
              type: 'totp',
            },
          ],
        },
        authenticatorKey: 'okta_verify',
        description: 'Okta Verify',
        iconClassName: 'mfa-okta-verify',
        buttonDataSeAttr: 'okta_verify-totp',
      },
      {
        label: 'Get a push notification',
        value: {
          id: 'auttheidkwh282hv8g3',
          methodType: 'push',
        },
        relatesTo: {
          profile: {
            deviceName: 'iPhone',
          },
          type: 'app',
          key: 'okta_verify',
          id: 'pfd4992vzbDhG7FO60g7',
          displayName: 'Okta Verify',
          methods: [
            {
              type: 'push',
            },
            {
              type: 'totp',
            },
          ],
        },
        authenticatorKey: 'okta_verify',
        description: 'Okta Verify',
        iconClassName: 'mfa-okta-verify',
        buttonDataSeAttr: 'okta_verify-push',
      },
      {
        label: 'Use Okta FastPass',
        value: {
          id: 'auttheidkwh282hv8g3',
          methodType: 'signed_nonce',
        },
        relatesTo: {
          profile: {
            deviceName: 'iPhone',
          },
          type: 'app',
          key: 'okta_verify',
          id: 'pfd4992vzbDhG7FO60g7',
          displayName: 'Okta Verify',
          methods: [
            {
              type: 'push',
            },
            {
              type: 'totp',
            },
          ],
        },
        authenticatorKey: 'okta_verify',
        description: 'Okta Verify',
        iconClassName: 'mfa-okta-verify',
        buttonDataSeAttr: 'okta_verify-signed_nonce',
      },
      {
        label: 'Google Authenticator',
        value: {
          id: 'auttheidkwh482hv8g3',
        },
        relatesTo: {
          displayName: 'Google Authenticator',
          type: 'app',
          key: 'google_otp',
          authenticatorId: 'aut1erh5wK1M8wA3g0g3',
          id: 'okta-verify-enroll-id-124',
          methods: [
            {
              type: 'otp'
            }
          ]
        },
        authenticatorKey:'google_otp',
        description:'',
        iconClassName:'mfa-google-auth',
        buttonDataSeAttr: 'google_otp',
      },
      {
        label: 'Get a push notification',
        value: {
          id: 'aut198w4v0f8dr8gT0g4',
        },
        relatesTo: {
          profile: {
            deviceName: 'Todd’s iPhone',
          },
          type: 'app',
          key: 'custom_app',
          id: 'pfd1bmoy4nH6heq2v0g4',
          displayName: 'Custom Push App',
          logoUri: 'https://cdn.okta1.com/bc/globalFileStoreRecord?id=gfs3sti6DQ7A9vS3h0g4',
          methods: [
            {
              type: 'push',
            },
          ],
        },
        authenticatorKey: 'custom_app',
        iconClassName: 'mfa-custom-app-logo',
        description: 'Custom Push App',
        buttonDataSeAttr: 'custom_app',
        logoUri: 'https://cdn.okta1.com/bc/globalFileStoreRecord?id=gfs3sti6DQ7A9vS3h0g4',
        noTranslateClassName: 'no-translate',
      },
    ]);
    // make sure input parameter is not mutated.
    expect(opt).toEqual(input);
  });

  it('filters additional webauthn enrollments for authenticatorVerify Select type', function() {
    const opt = {
      type: 'authenticatorVerifySelect',
      options: [
        {
          label: 'Security Key or Biometric Authenticator',
          authenticatorKey: 'webauthn',
          value: {
            id: 'autwa6eDxxx2iBbtv0g3',
          },
        },
        {
          label: 'Security Key or Biometric Authenticator',
          authenticatorKey: 'webauthn',
          value: {
            id: 'fwftheidkwh282hv8g3',
          },
        },
        {
          label: 'Okta Password',
          authenticatorKey: 'okta_password',
          value: {
            id: 'autwa6eD9o02iBbtv0g3',
          },
        },
      ],
      name: 'authenticator',
    };
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: AuthenticatorVerifyOptions,
      options: {
        collection: jasmine.anything(),
        name: 'authenticator',
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        label: 'Security Key or Biometric Authenticator',
        authenticatorKey: 'webauthn',
        value: {
          id: 'autwa6eDxxx2iBbtv0g3',
        },
        iconClassName: 'mfa-webauthn',
        description: '',
        buttonDataSeAttr: 'webauthn',
      },
      {
        label: 'Okta Password',
        authenticatorKey: 'okta_password',
        value: {
          id: 'autwa6eD9o02iBbtv0g3',
        },
        iconClassName: 'mfa-okta-password',
        description: '',
        buttonDataSeAttr: 'okta_password',
      },
    ]);
    // make sure input parameter is not mutated.
    expect(opt).toEqual({
      type: 'authenticatorVerifySelect',
      options: [
        {
          label: 'Security Key or Biometric Authenticator',
          authenticatorKey: 'webauthn',
          value: {
            id: 'autwa6eDxxx2iBbtv0g3',
          },
        },
        {
          label: 'Security Key or Biometric Authenticator',
          authenticatorKey: 'webauthn',
          value: {
            id: 'fwftheidkwh282hv8g3',
          },
        },
        {
          label: 'Okta Password',
          authenticatorKey: 'okta_password',
          value: {
            id: 'autwa6eD9o02iBbtv0g3',
          },
        },
      ],
      name: 'authenticator',
    });
  });

  it('filters custom app with same id for authenticatorVerify Select type', function() {
    const opt = {
      type: 'authenticatorVerifySelect',
      options: [
        {
          label: 'Get a push notification',
          value: {
            id: 'aut12xcv427OZQ38l0g6',
          },
          relatesTo: {
            profile: {
              deviceName: 'sdk_gphone_x86',
            },
            type: 'app',
            key: 'custom_app',
            id: 'pfd16kscouwDK87V20g6',
            displayName: 'Atko Corp Authenticator',
            methods: [
              {
                type: 'push',
              },
            ],
          },
          authenticatorKey: 'custom_app',
        },
        {
          label: 'Get a push notification',
          value: {
            id: 'aut12nog8HmlqOJ8U0g6',
          },
          relatesTo: {
            profile: {
              deviceName: 'iPhone 1',
            },
            type: 'app',
            key: 'custom_app',
            id: 'pfd16z8437KOYzzZ30g6',
            displayName: 'Custom Push Authenticator 1',
            methods: [
              {
                type: 'push',
              },
            ],
          },
          authenticatorKey: 'custom_app',
        },
        {
          label: 'Get a push notification',
          value: {
            id: 'aut12nog8HmlqOJ8U0g6',
          },
          relatesTo: {
            profile: {
              deviceName: 'iPhone 2',
            },
            type: 'app',
            key: 'custom_app',
            id: 'pfd16z6k8ICPIJUO50g6',
            displayName: 'Custom Push Authenticator 1',
            methods: [
              {
                type: 'push',
              },
            ],
          },
          authenticatorKey: 'custom_app',
        }
      ],
      name: 'authenticator',
    };
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: AuthenticatorVerifyOptions,
      options: {
        collection: jasmine.anything(),
        name: 'authenticator',
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        label: 'Get a push notification',
        value: {
          id: 'aut12xcv427OZQ38l0g6',
        },
        relatesTo: {
          profile: {
            deviceName: 'sdk_gphone_x86',
          },
          type: 'app',
          key: 'custom_app',
          id: 'pfd16kscouwDK87V20g6',
          displayName: 'Atko Corp Authenticator',
          methods: [
            {
              type: 'push',
            },
          ],
        },
        authenticatorKey: 'custom_app',
        description: 'Atko Corp Authenticator',
        buttonDataSeAttr: 'custom_app',
        iconClassName: 'mfa-custom-app-logo',
        logoUri: '',
      },
      {
        label: 'Get a push notification',
        value: {
          id: 'aut12nog8HmlqOJ8U0g6',
        },
        relatesTo: {
          profile: {
            deviceName: 'iPhone 1',
          },
          type: 'app',
          key: 'custom_app',
          id: 'pfd16z8437KOYzzZ30g6',
          displayName: 'Custom Push Authenticator 1',
          methods: [
            {
              type: 'push',
            },
          ],
        },
        authenticatorKey: 'custom_app',
        description: 'Custom Push Authenticator 1',
        buttonDataSeAttr: 'custom_app',
        iconClassName: 'mfa-custom-app-logo',
        logoUri: '',
      },
    ]);
  });

  it('handles authenticatorEnrollSelect type', function() {
    // Create a copy of input object.
    const input = {
      name: 'authenticator',
      required: true,
      type: 'authenticatorEnrollSelect',
      options: [
        {
          label: 'Okta Password',
          value: {
            id: 'autwa6eD9o02iBbtv0g3',
          },
          relatesTo: {
            displayName: 'Okta Password',
            type: 'password',
            key: 'okta_password',
            authenticatorId: 'autwa6eD9o02iBbtv0g3',
            id: 'password-enroll-id-123',
          },
          authenticatorKey: 'okta_password',
        },
        {
          label: 'Okta Phone',
          value: {
            id: 'aid568g3mXgtID0X1SLH',
          },
          relatesTo: {
            displayName: 'Okta Phone',
            type: 'phone',
            key: 'phone_number',
            authenticatorId: 'aid568g3mXgtID0X1SLH',
            id: 'phone-enroll-id-123',
          },
          authenticatorKey: 'phone_number',
        },
        {
          label: 'Okta Email',
          value: {
            id: 'aidtm56L8gXXHI1SD0g3',
          },
          relatesTo: {
            displayName: 'Okta Email',
            type: 'email',
            key: 'okta_email',
            authenticatorId: 'aidtm56L8gXXHI1SD0g3',
            id: 'autwa6eD9o02iBbtv0g3',
            methods: [
              {
                methodType: 'email',
              },
            ],
          },
          authenticatorKey: 'okta_email',
        },
        {
          label: 'Security Key or Biometric Authenticator',
          value: {
            id: 'aidtheidkwh282hv8g3',
          },
          relatesTo: {
            displayName: 'Security Key or Biometric Authenticator (FIDO2)',
            type: 'security_key',
            key: 'webauthn',
            authenticatorid: 'aidtheidkwh282hv8g3',
            id: 'webauthn-enroll-id-123',
          },
          authenticatorKey: 'webauthn',
        },
        {
          label: 'Okta Security Question',
          value: {
            id: 'aid568g3mXgtID0X1GGG',
          },
          relatesTo: {
            displayName: 'Okta Security Question',
            type: 'security_question',
            key: 'security_question',
            authenticatorId: 'aid568g3mXgtID0X1GGG',
            id: 'security-question-enroll-id-123',
          },
          authenticatorKey: 'security_question',
        },
        {
          label: 'Okta Verify',
          value: {
            id: 'auttheidkwh282hv8g3',
            methodType: 'signed_nonce',
          },
          relatesTo: {
            displayName: 'Okta Verify Device 1',
            type: 'app',
            key: 'okta_verify',
            id: 'aen1mz5J4cuNoaR3l0g4',
            authenticatorId: 'auttheidkwh282hv8g3',
            methods: [
              {
                type: 'signed_nonce',
              },
            ],
          },
          authenticatorKey: 'okta_verify'
        },
        {
          label: 'Google Authenticator',
          value: {
            id: 'auttheidkwh482hv8g3',
          },
          relatesTo: {
            displayName: 'Google Authenticator',
            type: 'app',
            key: 'google_otp',
            authenticatorId: 'aut1erh5wK1M8wA3g0g3',
            id: 'okta-verify-enroll-id-124',
            methods: [
              {
                type: 'otp'
              }
            ]
          },
          authenticatorKey:'google_otp',
        }
      ],
      'label-top': true,
    };
    const opt = JSON.parse(JSON.stringify(input));
    const result = FormInputFactory.create(opt);
    expect(result).toEqual({
      View: AuthenticatorEnrollOptions,
      options: {
        collection: jasmine.anything(),
        name: 'authenticator',
      },
    });
    expect(result.options.collection instanceof Collection).toBe(true);
    expect(result.options.collection.toJSON()).toEqual([
      {
        label: 'Okta Password',
        value: {
          id: 'autwa6eD9o02iBbtv0g3',
        },
        relatesTo: {
          displayName: 'Okta Password',
          type: 'password',
          key: 'okta_password',
          authenticatorId: 'autwa6eD9o02iBbtv0g3',
          id: 'password-enroll-id-123',
        },
        authenticatorKey: 'okta_password',
        description: 'Choose a password for your account',
        iconClassName: 'mfa-okta-password',
        buttonDataSeAttr: 'okta_password',
      },
      {
        label: 'Okta Phone',
        noTranslateClassName: '',
        value: {
          id: 'aid568g3mXgtID0X1SLH',
        },
        relatesTo: {
          displayName: 'Okta Phone',
          type: 'phone',
          key: 'phone_number',
          authenticatorId: 'aid568g3mXgtID0X1SLH',
          id: 'phone-enroll-id-123',
        },
        authenticatorKey: 'phone_number',
        description: 'Verify with a code sent to your phone',
        iconClassName: 'mfa-okta-phone',
        buttonDataSeAttr: 'phone_number',
      },
      {
        label: 'Okta Email',
        value: {
          id: 'aidtm56L8gXXHI1SD0g3',
        },
        relatesTo: {
          displayName: 'Okta Email',
          type: 'email',
          key: 'okta_email',
          authenticatorId: 'aidtm56L8gXXHI1SD0g3',
          id: 'autwa6eD9o02iBbtv0g3',
          methods: [
            {
              methodType: 'email',
            },
          ],
        },
        authenticatorKey: 'okta_email',
        description: 'Verify with a link or code sent to your email',
        iconClassName: 'mfa-okta-email',
        buttonDataSeAttr: 'okta_email',
      },
      {
        label: 'Security Key or Biometric Authenticator',
        value: {
          id: 'aidtheidkwh282hv8g3',
        },
        relatesTo: {
          displayName: 'Security Key or Biometric Authenticator (FIDO2)',
          type: 'security_key',
          key: 'webauthn',
          authenticatorid: 'aidtheidkwh282hv8g3',
          id: 'webauthn-enroll-id-123',
        },
        authenticatorKey: 'webauthn',
        description: 'Use a security key or a biometric authenticator to sign in',
        iconClassName: 'mfa-webauthn',
        buttonDataSeAttr: 'webauthn',
      },
      {
        label: 'Okta Security Question',
        value: {
          id: 'aid568g3mXgtID0X1GGG',
        },
        relatesTo: {
          displayName: 'Okta Security Question',
          type: 'security_question',
          key: 'security_question',
          authenticatorId: 'aid568g3mXgtID0X1GGG',
          id: 'security-question-enroll-id-123',
        },
        authenticatorKey: 'security_question',
        description: 'Choose a security question and answer that will be used for signing in',
        iconClassName: 'mfa-okta-security-question',
        buttonDataSeAttr: 'security_question',
      },
      {
        label: 'Okta Verify',
        value: {
          id: 'auttheidkwh282hv8g3',
          methodType: 'signed_nonce',
        },
        relatesTo: {
          displayName: 'Okta Verify Device 1',
          type: 'app',
          key: 'okta_verify',
          id: 'aen1mz5J4cuNoaR3l0g4',
          authenticatorId: 'auttheidkwh282hv8g3',
          methods: [
            {
              'type':'signed_nonce'
            }
          ]
        },
        'authenticatorKey':'okta_verify',
        'description':'Okta Verify is an authenticator app, installed on your phone, used to prove your identity',
        'iconClassName':'mfa-okta-verify',
        buttonDataSeAttr: 'okta_verify-signed_nonce',
      },
      {
        label: 'Google Authenticator',
        value: {
          id: 'auttheidkwh482hv8g3',
        },
        relatesTo: {
          displayName: 'Google Authenticator',
          type: 'app',
          key: 'google_otp',
          authenticatorId: 'aut1erh5wK1M8wA3g0g3',
          id: 'okta-verify-enroll-id-124',
          methods: [
            {
              type: 'otp'
            }
          ]
        },
        authenticatorKey:'google_otp',
        description:'Enter a temporary code generated from the Google Authenticator app.',
        iconClassName:'mfa-google-auth',
        buttonDataSeAttr: 'google_otp',
      }
    ]);
    // make sure input parameter is not mutated.
    expect(opt).toEqual(input);
  });
});
