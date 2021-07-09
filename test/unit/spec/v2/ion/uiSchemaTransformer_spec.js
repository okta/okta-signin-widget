import { _ } from 'okta';
import Settings from 'models/Settings';
import responseTransformer from 'v2/ion/responseTransformer';
import uiSchemaTransformer from 'v2/ion/uiSchemaTransformer';
import MockUtil from '../../../helpers/v2/MockUtil';

import XHREnrollProfile from '../../../../../playground/mocks/data/idp/idx/enroll-profile.json';
import XHRAuthenticatorRequiredEmail  from '../../../../../playground/mocks/data/idp/idx/authenticator-verification-email.json';
import XHRAuthenticatorEnrollSelectAuthenticators  from '../../../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator.json';
import XHRAuthenticatorEnrollDataPhone  from '../../../../../playground/mocks/data/idp/idx/authenticator-enroll-data-phone.json';
import XHRAuthenticatorEnrollSecurityQuestion  from '../../../../../playground/mocks/data/idp/idx/authenticator-enroll-security-question.json';
import XHRAuthenticatorEnrollOktaVerifyQr from '../../../../../playground/mocks/data/idp/idx/authenticator-enroll-ov-qr';
import XHRIdentifyResponse from '../../../../../playground/mocks/data/idp/idx/identify.json';
import XHRIdentifyWithPasswordResponse from '../../../../../playground/mocks/data/idp/idx/identify-with-password.json';

describe('v2/ion/uiSchemaTransformer', function() {
  let testContext;

  beforeEach(() => {
    testContext = {
      settings: new Settings({
        baseUrl: 'http://localhost:3000',
      }),
    };
  });

  it('converts response with fields as form for ENROLL_PROFILE', done => {
    MockUtil.mockIntrospect(done, XHREnrollProfile, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result).toEqual({
        remediations: [
          {
            href: 'http://localhost:3000/idp/idx/enroll',
            name: 'enroll-profile',
            method: 'POST',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            action: expect.any(Function),
            value: [
              {
                name: 'userProfile',
                form: {
                  value: [
                    {
                      name: 'lastName',
                      label: 'Last name',
                      required: true,
                    },
                    {
                      name: 'firstName',
                      label: 'First name',
                      required: true,
                    },
                    {
                      name: 'email',
                      label: 'Email',
                      required: true,
                    },
                  ],
                },
              },
              {
                name: 'stateHandle',
                value: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
                visible: false,
              },
            ],
            uiSchema: [
              {
                name: 'userProfile.lastName',
                label: 'Last name',
                required: true,
                'label-top': true,
                'data-se': 'o-form-fieldset-userProfile.lastName',
                type: 'text',
              },
              {
                name: 'userProfile.firstName',
                label: 'First name',
                'label-top': true,
                'data-se': 'o-form-fieldset-userProfile.firstName',
                required: true,
                type: 'text',
              },
              {
                name: 'userProfile.email',
                label: 'Email',
                'label-top': true,
                'data-se': 'o-form-fieldset-userProfile.email',
                required: true,
                type: 'text',
              },
            ],
          },
          {
            href: 'http://localhost:3000/idp/idx/identify',
            name: 'select-identify',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            method: 'POST',
            action: expect.any(Function),
            value: [
              {
                name: 'identifier',
                label: 'identifier',
              },
              {
                name: 'stateHandle',
                value: '01r2p5S9qaAjESMFuPzt7r3ZMcZZQ_vvS0Tzg56ajB',
                visible: false,
              },
            ],
            uiSchema: [
              {
                name: 'identifier',
                label: 'identifier',
                'label-top': true,
                'data-se': 'o-form-fieldset-identifier',
                type: 'text',
              },
            ],
          },
        ],
        idx: idxResp,
      });
    });
  });

  it('converts authenticator require - email', done => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorRequiredEmail, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result).toEqual({
        app: {
          name: 'oidc_client',
          label: 'Native client',
          id: '0oa1bowRUq4I8pIfd0g4',
        },
        authenticatorEnrollments: _.pick(XHRAuthenticatorRequiredEmail.authenticatorEnrollments, 'value'),
        currentAuthenticatorEnrollment: XHRAuthenticatorRequiredEmail.currentAuthenticatorEnrollment.value,
        user: {
          id: '00u1d4o00DWrRfc5u0g4',
        },
        remediations: [
          {
            name: 'challenge-authenticator',
            href: 'http://localhost:3000/idp/idx/challenge/answer',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            method: 'POST',
            action: expect.any(Function),
            value: [
              {
                type: 'object',
                required: true,
                name: 'credentials',
                form: {
                  value: [
                    {
                      name: 'passcode',
                      label: 'Enter code',
                    },
                  ],
                },
              },
              {
                name: 'stateHandle',
                required: true,
                value: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                visible: false,
                mutable: false,
              },
            ],
            uiSchema: [
              {
                name: 'credentials.passcode',
                label: 'Enter code',
                'label-top': true,
                'data-se': 'o-form-fieldset-credentials.passcode',
                type: 'text',
              },
            ],
            relatesTo: XHRAuthenticatorRequiredEmail.currentAuthenticatorEnrollment,
          },
          {
            name: 'select-authenticator-authenticate',
            href: 'http://localhost:3000/idp/idx/challenge',
            method: 'POST',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            action: expect.any(Function),
            value: [
              {
                name: 'authenticator',
                type: 'object',
                options: [
                  {
                    label: 'Email',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            required: true,
                            value: 'aut1bospdDFs7q3vc0g4',
                            mutable: false,
                          },
                          {
                            name: 'methodType',
                            required: false,
                            value: 'email',
                            mutable: false,
                          },
                        ],
                      },
                    },
                    relatesTo: XHRAuthenticatorRequiredEmail.authenticatorEnrollments.value[0],
                  },
                ],
              },
              {
                name: 'stateHandle',
                required: true,
                value: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                visible: false,
                mutable: false,
              },
            ],
            uiSchema: [
              {
                name: 'authenticator',
                type: 'authenticatorVerifySelect',
                'label-top': true,
                'data-se': 'o-form-fieldset-authenticator',
                options: [
                  {
                    label: 'Email',
                    value: {
                      id: 'aut1bospdDFs7q3vc0g4',
                    },
                    authenticatorKey: 'okta_email',
                    relatesTo: XHRAuthenticatorRequiredEmail.authenticatorEnrollments.value[0],
                  },
                ],
              },
            ],
          },
        ],
        idx: idxResp,
      });
    });
  });

  it('converts authenticator enroll - authenticator list', done => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollSelectAuthenticators, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result).toEqual({
        authenticators: _.pick(XHRAuthenticatorEnrollSelectAuthenticators.authenticators, 'value'),
        user: {
          id: '00utjm1GstPjCF9Ad0g3',
        },
        remediations: [
          {
            name: 'select-authenticator-enroll',
            href: 'http://localhost:3000/idp/idx/credential/enroll',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            method: 'POST',
            action: expect.any(Function),
            value: [
              {
                name: 'authenticator',
                required: true,
                type: 'object',
                options: [
                  {
                    label: 'Okta Password',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            required: true,
                            value: 'autwa6eD9o02iBbtv0g3',
                            mutable: false,
                          },
                          {
                            name: 'methodType',
                            required: false,
                            value: 'password',
                            mutable: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Password',
                      type: 'password',
                      key: 'okta_password',
                      authenticatorId: 'autwa6eD9o02iBbtv0g3',
                      id: 'password-enroll-id-123',
                    },
                  },
                  {
                    label: 'Okta Phone',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aid568g3mXgtID0X1SLH',
                            mutable: false,
                            required: true,
                          },
                          {
                            name: 'methodType',
                            required: false,
                            options: [
                              {
                                label: 'SMS',
                                value: 'sms',
                              },
                              {
                                label: 'VOICE',
                                value: 'voice',
                              },
                            ],
                          },
                          {
                            name: 'phoneNumber',
                            required: false,
                            type: 'string',
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Phone',
                      type: 'phone',
                      key: 'phone_number',
                      authenticatorId: 'aid568g3mXgtID0X1SLH',
                      id: 'phone-enroll-id-123',
                    },
                  },
                  {
                    label: 'Security Key or Biometric Authenticator (FIDO2)',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aidtheidkwh282hv8g3',
                            required: true,
                            mutable: false,
                            visible: false,
                          },
                          {
                            name: 'methodType',
                            value: 'webauthn',
                            required: false,
                            mutable: false,
                            visible: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Security Key or Biometric Authenticator (FIDO2)',
                      type: 'security_key',
                      key: 'webauthn',
                      authenticatorid: 'aidtheidkwh282hv8g3',
                      id: 'webauthn-enroll-id-123',
                    },
                  },
                  {
                    label: 'Okta Security Question',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aid568g3mXgtID0X1GGG',
                            required: true,
                            mutable: false,
                            visible: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Security Question',
                      type: 'security_question',
                      key: 'security_question',
                      authenticatorId: 'aid568g3mXgtID0X1GGG',
                      id: 'security-question-enroll-id-123',
                    },
                  },
                  {
                    'label': 'Okta Verify',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aut1erh5wK1M8wA3g0g4',
                            'required': true,
                            'mutable': false,
                          },
                          {
                            'name': 'channel',
                            'required': false,
                            'type': 'string',
                            'options': [{
                              'value': 'qrcode',
                              'label': 'QRCODE'
                            }, {
                              'value': 'sms',
                              'label': 'SMS'
                            }, {
                              'value': 'email',
                              'label': 'EMAIL'
                            }]
                          }
                        ]
                      }
                    },
                    'relatesTo': {
                      'displayName': 'Okta Verify',
                      'type': 'app',
                      'key': 'okta_verify',
                      'authenticatorId': 'aut1erh5wK1M8wA3g0g4',
                      'id': 'okta-verify-enroll-id-123',
                      'methods': [
                        {
                          'type': 'signed_nonce'
                        },
                        {
                          'type': 'push'
                        },
                        {
                          'type': 'totp'
                        }
                      ]
                    }
                  },
                  {
                    'label': 'Google Authenticator',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aut11ceMaP0B0EzMI0g4',
                            'required': true,
                            'mutable': false,
                          },
                        ]
                      }
                    },
                    'relatesTo': {
                      'displayName': 'Google Authenticator',
                      'type': 'app',
                      'key': 'google_otp',
                      'authenticatorId': 'aut1erh5wK1M8wA3g0g3',
                      'id': 'okta-verify-enroll-id-124',
                      'methods': [
                        {
                          'type': 'otp'
                        }
                      ]
                    }
                  },
                  {
                    'label': 'Atko Custom On-prem',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'required': true,
                            'value': 'autx7fdyRt87txnAs0g3',
                            'mutable': false,
                            'visible': false
                          },
                          {
                            'name': 'methodType',
                            'required': true,
                            'value': 'otp',
                            'mutable': false,
                            'visible': false
                          }
                        ]
                      }
                    },
                    'relatesTo': {
                      'type': 'security_key',
                      'key': 'onprem_mfa',
                      'id': 'autx7fdyRt87txnAs0g3',
                      'displayName': 'Atko Custom On-prem',
                      'methods': [
                        {
                          'type': 'otp'
                        }
                      ]
                    }
                  },
                  {
                    'label': 'RSA SecurID',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'required': true,
                            'value': 'autx7fdyRt87txnAs0g3',
                            'mutable': false,
                            'visible': false
                          },
                          {
                            'name': 'methodType',
                            'required': true,
                            'value': 'otp',
                            'mutable': false,
                            'visible': false
                          }
                        ]
                      }
                    },
                    'relatesTo': {
                      'type': 'security_key',
                      'key': 'rsa_token',
                      'id': 'autx7fdyRt87txnAs0g3',
                      'displayName': 'RSA SecurID',
                      'methods': [
                        {
                          'type': 'otp'
                        }
                      ]
                    }
                  },
                  {
                    'label': 'Duo Security',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'required': true,
                            'value': 'aut32kl92UF8kfE4E0g4',
                            'mutable': false
                          },
                          {
                            'name': 'methodType',
                            'required': false,
                            'value': 'idp',
                            'mutable': false
                          }
                        ]
                      }
                    },
                    'relatesTo': {
                      'displayName': 'Duo Security',
                      'type': 'app',
                      'key': 'duo',
                      'id': 'aut32kl92UF8kfE4E0g4',
                      'methods': [
                        {
                          'type': 'idp'
                        }
                      ]
                    }
                  },
                  {
                    label: 'IDP Authenticator',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            required: true,
                            value: '0oa69chx4bZyx8O7l0g4',
                            mutable: false
                          }
                        ]
                      }
                    },
                    relatesTo: {
                      type: 'federated',
                      id: 'aut4mhtS1b84AR0iQ0g4',
                      key: 'external_idp',
                      displayName: 'IDP Authenticator',
                      methods: [
                        {
                          type: 'idp'
                        }
                      ]
                    }
                  },
                  {
                    'label': 'Atko Custom OTP Authenticator',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'required': true,
                            'value': 'aut32kl92UF8kfE4E0g5',
                            'mutable': false
                          },
                          {
                            'name': 'methodType',
                            'required': false,
                            'value': 'otp',
                            'mutable': false
                          }
                        ]
                      }
                    },
                    'relatesTo': {
                      'type': 'security_key',
                      'key': 'custom_otp',
                      'id': 'aut32kl92UF8kfE4E0g4',
                      'displayName': 'Atko Custom OTP Authenticator',
                      'methods': [
                        {
                          'type': 'otp'
                        }
                      ]
                    }
                  },
                  {
                    label: 'Symantec VIP',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            required: true,
                            value: 'aut11ceMaP0B0EzMI0g4',
                            mutable: false
                          }
                        ]
                      }
                    },
                    relatesTo: {
                      type: 'app',
                      key: 'symantec_vip',
                      id: 'aut11ceMaP0B0EzMI0g4',
                      displayName: 'Symantec VIP',
                      methods: [
                        {
                          type: 'otp'
                        }
                      ]
                    },
                  },
                  {
                    label: 'YubiKey Authenticator',
                    value: {
                      form: {
                        value: [
                          {
                            mutable: false,
                            name: 'id',
                            required: true,
                            value: 'aut10faWWbNaNWBaH0g4',
                          },
                          {
                            mutable: false,
                            name: 'methodType',
                            required: false,
                            value: 'otp',
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'YubiKey Authenticator',
                      key: 'yubikey_token',
                      id: 'aut10faWWbNaNWBaH0g4',
                      type: 'security_key',
                      methods: [
                        {
                          type: 'otp'
                        }
                      ]
                    },
                  }
                ]
              },
              XHRAuthenticatorEnrollSelectAuthenticators.remediation.value[0].value[1],
            ],
            uiSchema: [
              {
                name: 'authenticator',
                type: 'authenticatorEnrollSelect',
                required: true,
                'label-top': true,
                'data-se': 'o-form-fieldset-authenticator',
                options: [
                  {
                    label: 'Okta Password',
                    value: {
                      id: 'autwa6eD9o02iBbtv0g3',
                    },
                    authenticatorKey: 'okta_password',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[0],
                  },
                  {
                    label: 'Okta Phone',
                    value: {
                      id: 'aid568g3mXgtID0X1SLH',
                    },
                    authenticatorKey: 'phone_number',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[2],
                  },
                  {
                    label: 'Security Key or Biometric Authenticator (FIDO2)',
                    value: {
                      id: 'aidtheidkwh282hv8g3',
                    },
                    authenticatorKey: 'webauthn',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[1],
                  },
                  {
                    label: 'Okta Security Question',
                    value: {
                      id: 'aid568g3mXgtID0X1GGG',
                    },
                    authenticatorKey: 'security_question',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[3],
                  },
                  {
                    'label': 'Okta Verify',
                    'value': {
                      'id': 'aut1erh5wK1M8wA3g0g4'
                    },
                    authenticatorKey: 'okta_verify',
                    'relatesTo': XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[4]
                  },
                  {
                    label: 'Google Authenticator',
                    value: {
                      id: 'aut11ceMaP0B0EzMI0g4'
                    },
                    authenticatorKey: 'google_otp',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[5]
                  },
                  {
                    label: 'Atko Custom On-prem',
                    value: {
                      id: 'autx7fdyRt87txnAs0g3',
                      methodType: 'otp'
                    },
                    authenticatorKey: 'onprem_mfa',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[6]
                  },
                  {
                    label: 'RSA SecurID',
                    value: {
                      id: 'autx7fdyRt87txnAs0g3',
                      methodType: 'otp'
                    },
                    authenticatorKey: 'rsa_token',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[7]
                  },
                  {
                    label: 'Duo Security',
                    value: {
                      id: 'aut32kl92UF8kfE4E0g4'
                    },
                    authenticatorKey: 'duo',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[8]
                  },
                  {
                    label: 'IDP Authenticator',
                    value: {
                      id: '0oa69chx4bZyx8O7l0g4'
                    },
                    authenticatorKey: 'external_idp',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[9]
                  },
                  {
                    label: 'Atko Custom OTP Authenticator',
                    value: {
                      id: 'aut32kl92UF8kfE4E0g5'
                    },
                    authenticatorKey: 'custom_otp',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[10]
                  },
                  {
                    label: 'Symantec VIP',
                    value: {
                      id: 'aut11ceMaP0B0EzMI0g4',
                    },
                    authenticatorKey: 'symantec_vip',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[11]
                  },
                  {
                    label: 'YubiKey Authenticator',
                    value: {
                      id: 'aut10faWWbNaNWBaH0g4',
                    },
                    authenticatorKey: 'yubikey_token',
                    relatesTo: XHRAuthenticatorEnrollSelectAuthenticators.authenticators.value[12]
                  },
                ]
              }
            ]
          }
        ],
        idx: idxResp,
      });
    });
  });

  it('converts authenticator enroll - phone', done => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollDataPhone, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);

      expect(result.authenticators).toEqual({
        value: XHRAuthenticatorEnrollDataPhone.authenticators.value,
      });

      expect(result).toEqual({
        currentAuthenticator: XHRAuthenticatorEnrollDataPhone.currentAuthenticator.value,
        authenticators: {
          value: XHRAuthenticatorEnrollDataPhone.authenticators.value,
        },
        user: XHRAuthenticatorEnrollDataPhone.user.value,
        remediations: [
          Object.assign({}, XHRAuthenticatorEnrollDataPhone.remediation.value[0], {
            action: expect.any(Function),
            uiSchema: [
              {
                name: 'authenticator.id',
                value: 'aid568g3mXgtID0X1SLH',
                mutable: false,
                visible: false,
                required: true,
                'label-top': true,
                'data-se': 'o-form-fieldset-authenticator.id',
                type: 'text',
              },
              {
                name: 'authenticator.methodType',
                required: true,
                value: 'sms',
                options: [
                  {
                    label: 'SMS',
                    value: 'sms',
                  },
                  {
                    label: 'Voice call',
                    value: 'voice',
                  },
                ],
                'label-top': true,
                'data-se': 'o-form-fieldset-authenticator.methodType',
                type: 'radio',
              },
              {
                name: 'authenticator.phoneNumber',
                label: 'Phone number',
                required: true,
                type: 'text',
                'label-top': true,
                'data-se': 'o-form-fieldset-authenticator.phoneNumber',
              },
            ],
            relatesTo: XHRAuthenticatorEnrollDataPhone.currentAuthenticator,
          }),
          Object.assign({}, XHRAuthenticatorEnrollSecurityQuestion.remediation.value[1], {
            action: expect.any(Function),
            uiSchema: [
              {
                name: 'authenticator',
                type: 'authenticatorEnrollSelect',
                required: true,
                'label-top': true,
                'data-se': 'o-form-fieldset-authenticator',
                options: [
                  {
                    label: 'Okta Password',
                    value: {
                      id: 'autwa6eD9o02iBbtv0g3',
                    },
                    authenticatorKey: 'okta_password',
                    relatesTo: XHRAuthenticatorEnrollDataPhone.authenticators.value[0],
                  },
                  {
                    label: 'Okta Phone',
                    value: {
                      id: 'aid568g3mXgtID0X1SLH',
                    },
                    authenticatorKey: 'phone_number',
                    relatesTo: XHRAuthenticatorEnrollDataPhone.authenticators.value[2],
                  },
                  {
                    label: 'Security Key or Biometric Authenticator (FIDO2)',
                    value: {
                      id: 'aidtheidkwh282hv8g3',
                    },
                    authenticatorKey: 'webauthn',
                    relatesTo: XHRAuthenticatorEnrollDataPhone.authenticators.value[1],
                  },
                  {
                    label: 'Okta Security Question',
                    value: {
                      id: 'aid568g3mXgtID0X1GGG',
                    },
                    authenticatorKey: 'security_question',
                    relatesTo: XHRAuthenticatorEnrollDataPhone.authenticators.value[3],
                  },
                ],
              },
            ],
            value: [
              {
                name: 'authenticator',
                required: true,
                type: 'object',
                options: [
                  {
                    label: 'Okta Password',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            required: true,
                            value: 'autwa6eD9o02iBbtv0g3',
                            mutable: false,
                          },
                          {
                            name: 'methodType',
                            required: false,
                            value: 'password',
                            mutable: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Password',
                      type: 'password',
                      key: 'okta_password',
                      authenticatorId: 'autwa6eD9o02iBbtv0g3',
                      id: 'password-enroll-id-123',
                    },
                  },
                  {
                    label: 'Okta Phone',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aid568g3mXgtID0X1SLH',
                            mutable: false,
                            required: true,
                          },
                          {
                            name: 'methodType',
                            required: false,
                            options: [
                              {
                                label: 'SMS',
                                value: 'sms',
                              },
                              {
                                label: 'VOICE',
                                value: 'voice',
                              },
                            ],
                          },
                          {
                            name: 'phoneNumber',
                            required: false,
                            type: 'string',
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Phone',
                      type: 'phone',
                      key: 'phone_number',
                      authenticatorId: 'aid568g3mXgtID0X1SLH',
                      id: 'phone-enroll-id-123',
                    },
                  },
                  {
                    label: 'Security Key or Biometric Authenticator (FIDO2)',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aidtheidkwh282hv8g3',
                            required: true,
                            mutable: false,
                            visible: false,
                          },
                          {
                            name: 'methodType',
                            value: 'webauthn',
                            required: false,
                            mutable: false,
                            visible: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Security Key or Biometric Authenticator (FIDO2)',
                      type: 'security_key',
                      key: 'webauthn',
                      authenticatorid: 'aidtheidkwh282hv8g3',
                      id: 'webauthn-enroll-id-123',
                    },
                  },
                  {
                    label: 'Okta Security Question',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aid568g3mXgtID0X1GGG',
                            required: true,
                            mutable: false,
                            visible: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Security Question',
                      type: 'security_question',
                      key: 'security_question',
                      authenticatorId: 'aid568g3mXgtID0X1GGG',
                      id: 'security-question-enroll-id-123',
                    },
                  },
                ],
              },
              XHRAuthenticatorEnrollSecurityQuestion.remediation.value[1].value[1],
            ],
          }),
        ],
        idx: idxResp,
      });
    });
  });

  it('converts authenticator enroll - security question', done => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollSecurityQuestion, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result).toEqual({
        currentAuthenticator: XHRAuthenticatorEnrollSecurityQuestion.currentAuthenticator.value,
        user: XHRAuthenticatorEnrollSecurityQuestion.user.value,
        remediations: [
          Object.assign(XHRAuthenticatorEnrollSecurityQuestion.remediation.value[0], {
            action: expect.any(Function),
            uiSchema: [
              {
                name: 'sub_schema_local_credentials',
                type: 'radio',
                required: true,
                options: [
                  {
                    label: 'Choose a security question',
                    value: 0,
                  },
                  {
                    label: 'Create my own security question',
                    value: 1,
                  },
                ],
                'label-top': true,
                'data-se': 'o-form-fieldset-credentials',
                optionsUiSchemas: [
                  [
                    {
                      name: 'credentials.questionKey',
                      type: 'select',
                      required: true,
                      label: 'Choose a security question',
                      options: {
                        'disliked_food': 'What is the food you least liked as a child?',
                        'name_of_first_plush_toy': 'What is the name of your first stuffed animal?',
                        'favorite_vacation_location': 'Where did you go for your favorite vacation?',
                      },
                      'label-top': true,
                      'data-se': 'o-form-fieldset-credentials.questionKey',
                      wide: true,
                    },
                    {
                      name: 'credentials.answer',
                      label: 'Answer',
                      required: true,
                      secret: true,
                      'label-top': true,
                      'data-se': 'o-form-fieldset-credentials.answer',
                      type: 'password',
                      params: {
                        showPasswordToggle: true,
                      },
                    },
                  ],
                  [
                    {
                      name: 'credentials.questionKey',
                      required: true,
                      value: 'custom',
                      mutable: false,
                      'label-top': true,
                      'data-se': 'o-form-fieldset-credentials.questionKey',
                      type: 'text',
                    },
                    {
                      name: 'credentials.question',
                      label: 'Create a security question',
                      required: true,
                      'label-top': true,
                      'data-se': 'o-form-fieldset-credentials.question',
                      type: 'text',
                    },
                    {
                      name: 'credentials.answer',
                      label: 'Answer',
                      required: true,
                      secret: true,
                      'label-top': true,
                      'data-se': 'o-form-fieldset-credentials.answer',
                      type: 'password',
                      params: {
                        showPasswordToggle: true,
                      },
                    },
                  ],
                ],
                value: '0',
              },
            ],
            relatesTo: XHRAuthenticatorEnrollSecurityQuestion.currentAuthenticator,
          }),
          Object.assign(XHRAuthenticatorEnrollSecurityQuestion.remediation.value[1], {
            action: expect.any(Function),
            uiSchema: [
              {
                name: 'authenticator',
                type: 'authenticatorEnrollSelect',
                required: true,
                'label-top': true,
                'data-se': 'o-form-fieldset-authenticator',
                options: [
                  {
                    label: 'Okta Password',
                    value: {
                      id: 'autwa6eD9o02iBbtv0g3',
                    },
                    authenticatorKey: 'okta_password',
                    relatesTo: XHRAuthenticatorEnrollSecurityQuestion.authenticators.value[0],
                  },
                  {
                    label: 'Okta Phone',
                    value: {
                      id: 'aid568g3mXgtID0X1SLH',
                    },
                    authenticatorKey: 'phone_number',
                    relatesTo: XHRAuthenticatorEnrollSecurityQuestion.authenticators.value[2],
                  },
                  {
                    label: 'Security Key or Biometric Authenticator (FIDO2)',
                    value: {
                      id: 'aidtheidkwh282hv8g3',
                    },
                    authenticatorKey: 'webauthn',
                    relatesTo: XHRAuthenticatorEnrollSecurityQuestion.authenticators.value[1],
                  },
                  {
                    label: 'Okta Security Question',
                    value: {
                      id: 'aid568g3mXgtID0X1GGG',
                    },
                    authenticatorKey: 'security_question',
                    relatesTo: XHRAuthenticatorEnrollSecurityQuestion.authenticators.value[3],
                  },
                ],
              },
            ],
            value: [
              {
                name: 'authenticator',
                required: true,
                type: 'object',
                options: [
                  {
                    label: 'Okta Password',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            required: true,
                            value: 'autwa6eD9o02iBbtv0g3',
                            mutable: false,
                          },
                          {
                            name: 'methodType',
                            required: false,
                            value: 'password',
                            mutable: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Password',
                      type: 'password',
                      key: 'okta_password',
                      authenticatorId: 'autwa6eD9o02iBbtv0g3',
                      id: 'password-enroll-id-123',
                    },
                  },
                  {
                    label: 'Okta Phone',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aid568g3mXgtID0X1SLH',
                            mutable: false,
                            required: true,
                          },
                          {
                            name: 'methodType',
                            required: false,
                            options: [
                              {
                                label: 'SMS',
                                value: 'sms',
                              },
                              {
                                label: 'VOICE',
                                value: 'voice',
                              },
                            ],
                          },
                          {
                            name: 'phoneNumber',
                            required: false,
                            type: 'string',
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Phone',
                      type: 'phone',
                      key: 'phone_number',
                      authenticatorId: 'aid568g3mXgtID0X1SLH',
                      id: 'phone-enroll-id-123',
                    },
                  },
                  {
                    label: 'Security Key or Biometric Authenticator (FIDO2)',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aidtheidkwh282hv8g3',
                            required: true,
                            mutable: false,
                            visible: false,
                          },
                          {
                            name: 'methodType',
                            value: 'webauthn',
                            required: false,
                            mutable: false,
                            visible: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Security Key or Biometric Authenticator (FIDO2)',
                      type: 'security_key',
                      key: 'webauthn',
                      authenticatorid: 'aidtheidkwh282hv8g3',
                      id: 'webauthn-enroll-id-123',
                    },
                  },
                  {
                    label: 'Okta Security Question',
                    value: {
                      form: {
                        value: [
                          {
                            name: 'id',
                            value: 'aid568g3mXgtID0X1GGG',
                            required: true,
                            mutable: false,
                            visible: false,
                          },
                        ],
                      },
                    },
                    relatesTo: {
                      displayName: 'Okta Security Question',
                      type: 'security_question',
                      key: 'security_question',
                      authenticatorId: 'aid568g3mXgtID0X1GGG',
                      id: 'security-question-enroll-id-123',
                    },
                  },
                ],
              },
              XHRAuthenticatorEnrollSecurityQuestion.remediation.value[1].value[1],
            ],
          }),
        ],
        authenticators: {
          value: XHRAuthenticatorEnrollSecurityQuestion.authenticators.value,
        },
        idx: idxResp,
      });
    });
  });

  it('converts identify remediation response', done => {
    MockUtil.mockIntrospect(done, XHRIdentifyResponse, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result).toEqual({
        remediations: [
          {
            name: 'identify',
            href: 'http://localhost:3000/idp/idx/identify',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            method: 'POST',
            action: expect.any(Function),
            value: [
              {
                name: 'identifier',
                label: 'Username',
              },
              {
                name: 'rememberMe',
                label: 'Remember Me',
                type: 'boolean',
              },
              {
                name: 'stateHandle',
                required: true,
                value: expect.any(String),
                visible: false,
                mutable: false,
              },
            ],
            uiSchema: [
              {
                name: 'identifier',
                label: 'Username',
                type: 'text',
                'label-top': true,
                'data-se': 'o-form-fieldset-identifier',
              },
              {
                name: 'rememberMe',
                label: false,
                type: 'checkbox',
                placeholder: 'Remember Me',
                modelType: 'boolean',
                required: false,
                'label-top': true,
                'data-se': 'o-form-fieldset-rememberMe',
              },
            ],
          },
          {
            name: 'select-enroll-profile',
            href: 'http://localhost:3000/idp/idx/enroll',
            rel: ['create-form'],
            accepts: 'application/vnd.okta.v1+json',
            method: 'POST',
            action: expect.any(Function),
            value: [
              {
                name: 'stateHandle',
                required: true,
                value: expect.any(String),
                visible: false,
                mutable: false,
              },
            ],
            uiSchema: [],
          },
        ],
        idx: idxResp,
      });
    });
  });

  it('converts select channel response for Okta verify', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollOktaVerifyQr, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result.remediations[1].uiSchema).toEqual([{
        name: 'authenticator.id',
        value: 'aidtheidkwh282hv8g3',
        required: true,
        mutable: false,
        visible: false,
        'label-top': true,
        'data-se': 'o-form-fieldset-authenticator.id',
        type: 'text'
      }, {
        name: 'authenticator.channel',
        required: true,
        visible: true,
        options: [{
          value: 'qrcode',
          label: 'QRCODE',
        }, {
          value: 'sms',
          label: 'SMS'
        }, {
          value: 'email',
          label: 'Email'
        }],
        value: 'qrcode',
        'label-top': true,
        'data-se': 'o-form-fieldset-authenticator.channel',
        type: 'radio'
      }]);
    });
  });

  it('sets showPasswordToggle to true by default', done => {
    testContext.settings = new Settings({
      baseUrl: 'http://localhost:3000',
    });

    MockUtil.mockIntrospect(done, XHRIdentifyWithPasswordResponse, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result.remediations[0]).toEqual(
        {
          name: 'identify',
          href: 'http://localhost:3000/idp/idx/identify',
          rel: ['create-form'],
          accepts: 'application/vnd.okta.v1+json',
          method: 'POST',
          action: expect.any(Function),
          value: [
            {
              name: 'identifier',
              label: 'Username',
            },
            {
              'form':  {
                'value': [
                  {
                    'label': 'Password',
                    'name': 'passcode',
                    'secret': true,
                  },
                ],
              },
              'name': 'credentials',
              'required': true,
              'type': 'object',
            },

            {
              name: 'rememberMe',
              label: 'Keep me signed in',
              type: 'boolean',
            },
            {
              name: 'stateHandle',
              required: true,
              value: expect.any(String),
              visible: false,
              mutable: false,
            },
          ],
          uiSchema: [
            {
              name: 'identifier',
              label: 'Username',
              type: 'text',
              'label-top': true,
              'data-se': 'o-form-fieldset-identifier',
            },
            {
              'label': 'Password',
              'label-top': true,
              'data-se': 'o-form-fieldset-credentials.passcode',
              'name': 'credentials.passcode',
              'params':  {
                'showPasswordToggle': true,
              },
              'secret': true,
              'type': 'password',
            },
            {
              name: 'rememberMe',
              label: false,
              type: 'checkbox',
              placeholder: 'Keep me signed in',
              modelType: 'boolean',
              required: false,
              'label-top': true,
              'data-se': 'o-form-fieldset-rememberMe',
            },
          ],
        },
      );
    });
  });

  it('sets showPasswordToggle to false if "features.showPasswordToggleOnSignInPage" is false', done => {
    testContext.settings = new Settings({
      baseUrl: 'http://localhost:3000',
      'features.showPasswordToggleOnSignInPage': false,
    });

    MockUtil.mockIntrospect(done, XHRIdentifyWithPasswordResponse, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result.remediations[0]).toEqual(
        {
          name: 'identify',
          href: 'http://localhost:3000/idp/idx/identify',
          rel: ['create-form'],
          accepts: 'application/vnd.okta.v1+json',
          method: 'POST',
          action: expect.any(Function),
          value: [
            {
              name: 'identifier',
              label: 'Username',
            },
            {
              'form':  {
                'value': [
                  {
                    'label': 'Password',
                    'name': 'passcode',
                    'secret': true,
                  },
                ],
              },
              'name': 'credentials',
              'required': true,
              'type': 'object',
            },

            {
              name: 'rememberMe',
              label: 'Keep me signed in',
              type: 'boolean',
            },
            {
              name: 'stateHandle',
              required: true,
              value: expect.any(String),
              visible: false,
              mutable: false,
            },
          ],
          uiSchema: [
            {
              name: 'identifier',
              label: 'Username',
              type: 'text',
              'label-top': true,
              'data-se': 'o-form-fieldset-identifier',
            },
            {
              'label': 'Password',
              'label-top': true,
              'data-se': 'o-form-fieldset-credentials.passcode',
              'name': 'credentials.passcode',
              'params':  {
                'showPasswordToggle': false,
              },
              'secret': true,
              'type': 'password',
            },
            {
              name: 'rememberMe',
              label: false,
              type: 'checkbox',
              placeholder: 'Keep me signed in',
              modelType: 'boolean',
              required: false,
              'label-top': true,
              'data-se': 'o-form-fieldset-rememberMe',
            },
          ],
        },
      );
    });
  });


  it('sets showPasswordToggle to false if features.showPasswordToggleOnSignInPage is false', done => {
    testContext.settings = new Settings({
      baseUrl: 'http://localhost:3000',
      features: {
        showPasswordToggleOnSignInPage: false,
      }
    });

    MockUtil.mockIntrospect(done, XHRIdentifyWithPasswordResponse, idxResp => {
      const result = _.compose(uiSchemaTransformer.bind(null, testContext.settings), responseTransformer.bind(null, testContext.settings))(idxResp);
      expect(result.remediations[0]).toEqual(
        {
          name: 'identify',
          href: 'http://localhost:3000/idp/idx/identify',
          rel: ['create-form'],
          accepts: 'application/vnd.okta.v1+json',
          method: 'POST',
          action: expect.any(Function),
          value: [
            {
              name: 'identifier',
              label: 'Username',
            },
            {
              'form':  {
                'value': [
                  {
                    'label': 'Password',
                    'name': 'passcode',
                    'secret': true,
                  },
                ],
              },
              'name': 'credentials',
              'required': true,
              'type': 'object',
            },

            {
              name: 'rememberMe',
              label: 'Keep me signed in',
              type: 'boolean',
            },
            {
              name: 'stateHandle',
              required: true,
              value: expect.any(String),
              visible: false,
              mutable: false,
            },
          ],
          uiSchema: [
            {
              name: 'identifier',
              label: 'Username',
              type: 'text',
              'label-top': true,
              'data-se': 'o-form-fieldset-identifier',
            },
            {
              'label': 'Password',
              'label-top': true,
              'data-se': 'o-form-fieldset-credentials.passcode',
              'name': 'credentials.passcode',
              'params':  {
                'showPasswordToggle': false,
              },
              'secret': true,
              'type': 'password',
            },
            {
              name: 'rememberMe',
              label: false,
              type: 'checkbox',
              placeholder: 'Keep me signed in',
              modelType: 'boolean',
              required: false,
              'label-top': true,
              'data-se': 'o-form-fieldset-rememberMe',
            },
          ],
        },
      );
    });
  });
});
