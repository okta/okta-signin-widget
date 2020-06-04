import { _ } from 'okta';
import responseTransformer from 'v2/ion/responseTransformer';
import uiSchemaTransformer from 'v2/ion/uiSchemaTransformer';
import MockUtil from '../../../helpers/v2/MockUtil';

import XHREnrollProfile from '../../../../../playground/mocks/idp/idx/data/enroll-profile.json';
import XHRFactorRequiredEmail  from '../../../../../playground/mocks/idp/idx/data/factor-verification-email.json';
import XHRFactorEnrollOptions from '../../../../../playground/mocks/idp/idx/data/factor-enroll-options.json';
import XHRAuthenticatorRequiredEmail  from '../../../../../playground/mocks/idp/idx/data/authenticator-verification-email.json';
import XHRAuthenticatorEnrollOptions  from '../../../../../playground/mocks/idp/idx/data/authenticator-select-enroll-options.json';
import XHRAuthenticatorEnrollPhone  from '../../../../../playground/mocks/idp/idx/data/authenticator-enroll-phone.json';
import XHRIdentifyResponse from '../../../../../playground/mocks/idp/idx/data/identify.json';

describe('v2/ion/uiSchemaTransformer', function () {
  it('converts factor require email', (done) => {
    MockUtil.mockIntrospect(done, XHRFactorRequiredEmail, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'factors': _.pick(XHRFactorRequiredEmail.factors, 'value'),
        'factor': XHRFactorRequiredEmail.factor.value,
        'user':{
          'id':'00usip1dptbE7NiLa0g3'
        },
        'remediations':[
          {
            'href': 'http://localhost:3000/idp/idx/challenge/answer',
            'name':'challenge-factor',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'credentials',
                'form':{
                  'value':[
                    {
                      'name':'passcode',
                      'label':'One-time verification code',
                      'secret':true,
                    },
                  ]
                }
              }
            ],
            'uiSchema':[
              {
                'name':'credentials.passcode',
                'label':'One-time verification code',
                'label-top': true,
                'secret':true,
                'type':'password',
                'params':{
                  'showPasswordToggle':true
                }
              }
            ]
          },
          {
            'href': 'http://localhost:3000/idp/idx/challenge',
            'name':'select-factor-authenticate',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'factorId',
                'type':'set',
                'options':[
                  {
                    'label':'Password',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'factorType':'password'
                  },
                  {
                    'label':'Email',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'factorType':'email'
                  }
                ]
              }
            ],
            'uiSchema':[
              {
                'name':'factorId',
                'type':'factorSelect',
                'label-top': true,
                'options':[
                  {
                    'label':'Password',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'factorType':'password'
                  },
                  {
                    'label':'Email',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'factorType':'email'
                  }
                ]
              }
            ]
          }
        ],
        idx: idxResp,
      });
    });
  });

  it('converts factor enroll options', (done) => {
    MockUtil.mockIntrospect(done, XHRFactorEnrollOptions, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'factors': _.pick(XHRFactorEnrollOptions.factors, 'value'),
        'user': XHRFactorEnrollOptions.user.value,
        'remediations':[
          {
            'href': 'http://localhost:3000/idp/idx/credential/enroll',
            'name':'select-factor-enroll',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'factorProfileId',
                'type':'set',
                'options':[
                  {
                    'label':'Password Label',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'factorType':'password'
                  },
                  {
                    'label':'Email Label',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'factorType':'email'
                  }
                ]
              }
            ],
            'uiSchema':[
              {
                'name':'factorProfileId',
                'type':'factorSelect',
                'label-top': true,
                'options':[
                  {
                    'label':'Password Label',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'factorType':'password'
                  },
                  {
                    'label':'Email Label',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'factorType':'email'
                  }
                ]
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts response with fields as form for ENROLL_PROFILE', (done) => {
    MockUtil.mockIntrospect(done, XHREnrollProfile, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'remediations':[
          {
            'href': 'http://localhost:3000/idp/idx/enroll',
            'name':'enroll-profile',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'userProfile',
                'form':{
                  'value':[
                    {
                      'name':'lastName',
                      'label':'Last name',
                      'required':true,
                    },
                    {
                      'name':'firstName',
                      'label':'First name',
                      'required':true,
                    },
                    {
                      'name':'email',
                      'label':'Primary email',
                      'required':true,
                    }
                  ],
                },
              }
            ],
            'uiSchema':[
              {
                'name':'userProfile.lastName',
                'label':'Last name',
                'required':true,
                'label-top': true,
                'type':'text'
              },
              {
                'name':'userProfile.firstName',
                'label':'First name',
                'label-top': true,
                'required':true,
                'type':'text'
              },
              {
                'name':'userProfile.email',
                'label':'Primary email',
                'label-top': true,
                'required':true,
                'type':'text'
              }
            ]
          },
          {
            'href': 'http://localhost:3000/idp/idx/identify',
            'name':'select-identify',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'identifier',
                'label':'identifier',
              }
            ],
            'uiSchema':[
              {
                'name':'identifier',
                'label':'identifier',
                'label-top': true,
                'type':'text'
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts authenticator require - email', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorRequiredEmail, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'authenticatorEnrollments': _.pick(XHRAuthenticatorRequiredEmail.authenticatorEnrollments, 'value'),
        'currentAuthenticator': XHRAuthenticatorRequiredEmail.currentAuthenticator.value,
        'user': {
          'id': '00uwb8GLwf1HED5Xs0g3'
        },
        'remediations': [
          {
            'name': 'challenge-authenticator',
            'href': 'http://localhost:3000/idp/idx/challenge/answer',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'credentials',
                'form': {
                  'value': [
                    {
                      'name': 'passcode',
                      'label': 'One-time verification code',
                      'secret': true
                    }
                  ]
                }
              }
            ],
            'uiSchema': [
              {
                'name': 'credentials.passcode',
                'label': 'One-time verification code',
                'secret': true,
                'label-top': true,
                'type': 'password',
                'params': {
                  'showPasswordToggle': true
                }
              }
            ]
          },
          {
            'name': 'select-authenticator-authenticate',
            'href': 'http://localhost:3000/idp/idx/challenge',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'authenticator',
                'type': 'object',
                'options': [
                  {
                    'label': 'Okta Password',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'required': true,
                            'value': 'aidwboITrg4b4yAYd0g3',
                            'mutable': false
                          },
                          {
                            'name': 'methodType',
                            'required': false,
                            'value': 'password',
                            'mutable': false
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Security Key or Biometric Authenticator (FIDO2)',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aidtheidkwh282hv8g3',
                            'required': true,
                            'mutable': false,
                            'visible': false
                          },
                          {
                            'name': 'methodType',
                            'value': 'webauthn',
                            'required': false,
                            'mutable': false,
                            'visible': false
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Okta Email',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aidtm56L8gXXHI1SD0g3',
                            'required': true,
                            'mutable': false,
                            'visible': false
                          },
                          {
                            'name': 'methodType',
                            'value': 'email',
                            'required': false,
                            'mutable': false
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            ],
            'uiSchema': [
              {
                'name': 'authenticator',
                'type': 'authenticatorSelect',
                'label-top': true,
                'options': [
                  {
                    'label': 'Okta Password',
                    'value': {
                      'id': 'aidwboITrg4b4yAYd0g3'
                    },
                    'authenticatorType': 'password'
                  },
                  {
                    'label': 'Security Key or Biometric Authenticator (FIDO2)',
                    'value': {
                      'id': 'aidtheidkwh282hv8g3'
                    },
                    'authenticatorType': 'webauthn'
                  },
                  {
                    'label': 'Okta Email',
                    'value': {
                      'id': 'aidtm56L8gXXHI1SD0g3'
                    },
                    'authenticatorType': 'email'
                  }
                ]
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts authenticator enroll - authenticator list', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollOptions, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'authenticators': _.pick(XHRAuthenticatorEnrollOptions.authenticators, 'value'),
        'user': {
          'id': '00utjm1GstPjCF9Ad0g3'
        },
        'remediations': [
          {
            'name': 'select-authenticator-enroll',
            'href': 'http://localhost:3000/idp/idx/credential/enroll',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'authenticator',
                'type': 'object',
                'required': true,
                'options': [
                  {
                    'label': 'Okta Password',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'required': true,
                            'value': 'autwa6eD9o02iBbtv0g3',
                            'mutable': false
                          },
                          {
                            'name': 'methodType',
                            'required': false,
                            'value': 'password',
                            'mutable': false
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Okta Phone',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aid568g3mXgtID0X1SLH',
                            'mutable': false,
                            'required': true
                          },
                          {
                            'name': 'methodType',
                            'required': false,
                            'options': [
                              { 'label': 'SMS', 'value': 'sms' },
                              { 'label': 'VOICE', 'value': 'voice' }
                            ]
                          },
                          {
                            'name': 'phoneNumber',
                            'required': false,
                            'type': 'string'
                          }
                        ]
                      }
                    }
                  },
                  {
                    'label': 'Security Key or Biometric Authenticator (FIDO2)',
                    'value': {
                      'form': {
                        'value': [
                          {
                            'name': 'id',
                            'value': 'aidtheidkwh282hv8g3',
                            'required': true,
                            'mutable': false,
                            'visible': false
                          },
                          {
                            'name': 'methodType',
                            'value': 'webauthn',
                            'required': false,
                            'mutable': false,
                            'visible': false
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            ],
            'uiSchema': [
              {
                'name': 'authenticator',
                'type': 'authenticatorSelect',
                'required': true,
                'label-top': true,
                'options': [
                  {
                    'label': 'Okta Password',
                    'value': {
                      'id': 'autwa6eD9o02iBbtv0g3'
                    },
                    'authenticatorType': 'password'
                  },
                  {
                    'label': 'Okta Phone',
                    'value': {
                      'id': 'aid568g3mXgtID0X1SLH'
                    },
                    'authenticatorType': 'phone'
                  },
                  {
                    'label': 'Security Key or Biometric Authenticator (FIDO2)',
                    'value': {
                      'id': 'aidtheidkwh282hv8g3'
                    },
                    'authenticatorType': 'webauthn'
                  },
                ]
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts authenticator enroll - phone', (done) => {
    MockUtil.mockIntrospect(done, XHRAuthenticatorEnrollPhone, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'currentAuthenticator': {
          'type': 'phone',
          'id': 'aid568g3mXgtID0X1SLH',
          'name': 'Okta Phone'
        },
        'user': {
          'id': 'I9bvFiq01cRFgbn',
          'passwordChanged': '2019-05-03T19:00:00.000Z',
          'profile': {
            'login': 'foo@example.com',
            'firstName': 'Foo',
            'lastName': 'Bar',
            'locale': 'en-us',
            'timeZone': 'UTC'
          }
        },
        'remediations': [
          {
            'name': 'select-authenticator-enroll-data',
            'href': 'http://localhost:3000/idp/idx/challenge',
            'method': 'POST',
            'action': jasmine.any(Function),
            'value': [
              {
                'name': 'authenticator',
                'required': true,
                'type': 'object',
                'visible': true,
                'value': {
                  'label': 'Okta Phone',
                  'form': {
                    'value': [
                      {
                        'name': 'id',
                        'value': 'aid568g3mXgtID0X1SLH',
                        'mutable': false,
                        'visible': false,
                        'required': true
                      },
                      {
                        'name': 'methodType',
                        'required': true,
                        'options': [
                          {
                            'label': 'SMS',
                            'value': 'sms'
                          },
                          {
                            'label': 'VOICE',
                            'value': 'voice'
                          }
                        ]
                      },
                      {
                        'name': 'phoneNumber',
                        'required': true,
                        'type': 'string'
                      }
                    ]
                  }
                }
              }
            ],
            'uiSchema': [
              {
                'name': 'authenticator.id',
                'value': 'aid568g3mXgtID0X1SLH',
                'mutable': false,
                'visible': false,
                'required': true,
                'label-top': true,
                'type': 'text'
              },
              {
                'name': 'authenticator.methodType',
                'required': true,
                'options': [
                  {
                    'label': 'SMS',
                    'value': 'sms'
                  },
                  {
                    'label': 'VOICE',
                    'value': 'voice'
                  }
                ],
                'label-top': true,
                'type': 'radio'
              },
              {
                'name': 'authenticator.phoneNumber',
                'required': true,
                'type': 'text',
                'label-top': true
              }
            ]
          }
        ],
        'idx': idxResp,
      });
    });
  });

  it('converts identify remidiation response', (done) => {
    MockUtil.mockIntrospect(done, XHRIdentifyResponse, idxResp => {
      const result = _.compose(uiSchemaTransformer, responseTransformer)(idxResp);
      expect(result).toEqual({
        'remediations': [
          {
            'name':'identify',
            'href':'http://localhost:3000/idp/idx/identify',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[
              {
                'name':'identifier',
                'label':'Username'
              },
              {
                'name':'rememberMe',
                'label':'Remember Me',
                'type':'boolean'
              }
            ],
            'uiSchema':[
              {
                'name':'identifier',
                'label':'Username',
                'type':'text',
                'label-top': true,
              },
              {
                'name':'rememberMe',
                'label':false,
                'type':'checkbox',
                'placeholder':'Remember Me',
                'modelType':'boolean',
                'required':false,
                'label-top': true,
              }
            ]
          },
          {
            'name':'select-enroll-profile',
            'href':'http://localhost:3000/idp/idx/enroll',
            'method':'POST',
            'action': jasmine.any(Function),
            'value':[],
            'uiSchema':[]
          }
        ],
        'idx': idxResp
      });
    });
  });
});
