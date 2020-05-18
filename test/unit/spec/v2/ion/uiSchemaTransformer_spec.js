import { _ } from 'okta';
import responseTransformer from 'v2/ion/responseTransformer';
import uiSchemaTransformer from 'v2/ion/uiSchemaTransformer';

import XHREnrollProfile from '../../../../../playground/mocks/idp/idx/data/enroll-profile.json';
import XHRFactorRequiredEmail  from '../../../../../playground/mocks/idp/idx/data/factor-verification-email.json';
import XHRFactorEnrollOptions from '../../../../../playground/mocks/idp/idx/data/factor-enroll-options.json';
import XHRAuthenticatorRequiredEmail  from '../../../../../playground/mocks/idp/idx/data/authenticator-verification-email.json';
import XHRAuthenticatorEnrollOptions  from '../../../../../playground/mocks/idp/idx/data/authenticator-select-enroll-options.json';


describe('v2/ion/uiSchemaTransformer', function () {
  it('converts factor require email', () => {
    const rawFactorRequiredEmailResponse = XHRFactorRequiredEmail;
    const transformedResponse  = {

      'proceed': jasmine.any(Function),
      'neededToProceed':[
        {
          'rel':[
            'create-form'
          ],
          'name':'challenge-factor',
          'href':'http://localhost:3000/idp/idx/challenge/answer',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'credentials',
              'form':{
                'value':[
                  {
                    'name':'passcode',
                    'label':'One-time verification code',
                    'secret':true,
                    'method':'post'
                  }
                ],
                'method':'post'
              },
              'method':'post'
            },
            {
              'name':'stateHandle',
              'required':true,
              'value':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
              'visible':false,
              'mutable':false,
              'method':'post'
            }
          ]
        },
        {
          'rel':[
            'create-form'
          ],
          'name':'select-factor',
          'href':'http://localhost:3000/idp/idx/challenge',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'factorId',
              'type':'set',
              'options':[
                {
                  'label':'Password',
                  'value':'00u2j17ObFUsbGfLg0g4',
                  'method':'options'
                },
                {
                  'label':'Email',
                  'value':'emf2j1ccd6CF4IWFY0g3',
                  'method':'options'
                }
              ],
              'method':'post'
            },
            {
              'name':'stateHandle',
              'required':true,
              'value':'02h50hMLvmuZUuoKCShHKZytlDeFRnn8KG-rcd8Ay5',
              'visible':false,
              'mutable':false,
              'method':'post'
            }
          ]
        }
      ],
      'actions':{

      },
      'context':{
        'stateHandle':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
        'version':'1.0.0',
        'expiresAt':'2019-09-30T22:19:25.000Z',
        'step':'AUTHENTICATE',
        'intent':'LOGIN',
        'factors':{
          'type':'array',
          'value':[
            {
              'factorType':'password',
              'factorProfileId':'00u2j17ObFUsbGfLg0g4'
            },
            {
              'factorType':'email',
              'factorProfileId':'emf2j1ccd6CF4IWFY0g3'
            }
          ]
        },
        'factor':{
          'type':'object',
          'value':{
            'factorType':'email',
            'factorProfileId':'fprt52ie7vo5m7mSO0g3',
            'factorId':'emfv6q1VxHR52T9az0g3',
            'profile':{
              'email':'inca@clouditude.net'
            }
          }
        },
        'user':{
          'type':'object',
          'value':{
            'id':'00usip1dptbE7NiLa0g3'
          }
        }
      },
      'rawIdxState': rawFactorRequiredEmailResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'factors':{
        'value':[
          {
            'factorType':'password',
            'factorProfileId':'00u2j17ObFUsbGfLg0g4'
          },
          {
            'factorType':'email',
            'factorProfileId':'emf2j1ccd6CF4IWFY0g3'
          }
        ]
      },
      'factor':{
        'factorType':'email',
        'factorProfileId':'emf2j1ccd6CF4IWFY0g3',
        'factorId':'emfv6q1VxHR52T9az0g3',
        'profile':{
          'email':'inca@clouditude.net'
        },
        'resend':{
          'rel':[
            'create-form'
          ],
          'name':'resend',
          'href':'http://localhost:3000/idp/idx/challenge/resend',
          'method':'POST',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'stateHandle',
              'required':true,
              'value':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
              'visible':false,
              'mutable':false,
            }
          ]
        },
        'poll':{
          'rel':[
            'create-form'
          ],
          'name':'poll',
          'href':'http://localhost:3000/idp/idx/challenge/poll',
          'method':'POST',
          'accepts':'application/vnd.okta.v1+json',
          'refresh':4000,
          'value':[
            {
              'name':'stateHandle',
              'required':true,
              'value':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
              'visible':false,
              'mutable':false,
            }
          ]
        }
      },
      'user':{
        'id':'00usip1dptbE7NiLa0g3'
      },
      'proceed': jasmine.any(Function),
      'neededToProceed':[
        {
          'rel':[
            'create-form'
          ],
          'name':'challenge-factor',
          'href':'http://localhost:3000/idp/idx/challenge/answer',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'credentials',
              'form':{
                'value':[
                  {
                    'name':'passcode',
                    'label':'One-time verification code',
                    'secret':true,
                    'method':'post'
                  }
                ],
                'method':'post'
              },
              'method':'post'
            },
          ]
        },
        {
          'rel':[
            'create-form'
          ],
          'name':'select-factor',
          'href':'http://localhost:3000/idp/idx/challenge',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'factorId',
              'type':'set',
              'options':[
                {
                  'label':'Password',
                  'value':'00u2j17ObFUsbGfLg0g4',
                  'method':'options',
                  'factorType': 'password'
                },
                {
                  'label':'Email',
                  'value':'emf2j1ccd6CF4IWFY0g3',
                  'method':'options',
                  'factorType': 'email'
                }
              ],
              'method':'post'
            },
          ]
        }
      ],
      'actions':{

      },
      'context':{
        'stateHandle':'02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
        'version':'1.0.0',
        'expiresAt':'2019-09-30T22:19:25.000Z',
        'step':'AUTHENTICATE',
        'intent':'LOGIN',
        'factors':{
          'type':'array',
          'value':[
            {
              'factorType':'password',
              'factorProfileId':'00u2j17ObFUsbGfLg0g4'
            },
            {
              'factorType':'email',
              'factorProfileId':'emf2j1ccd6CF4IWFY0g3'
            }
          ]
        },
        'factor':{
          'type':'object',
          'value':{
            'factorType':'email',
            'factorProfileId':'fprt52ie7vo5m7mSO0g3',
            'factorId':'emfv6q1VxHR52T9az0g3',
            'profile':{
              'email':'inca@clouditude.net'
            }
          }
        },
        'user':{
          'type':'object',
          'value':{
            'id':'00usip1dptbE7NiLa0g3'
          }
        }
      },
      'rawIdxState':rawFactorRequiredEmailResponse,
      'remediations':[
        {
          'value':[
            {
              'name':'credentials',
              'form':{
                'value':[
                  {
                    'name':'passcode',
                    'label':'One-time verification code',
                    'secret':true,
                    'method':'post'
                  },
                ],
                'method':'post'
              },
              'method':'post'
            }
          ],
          'href': 'http://localhost:3000/idp/idx/challenge/answer',
          'name':'challenge-factor',
          'method':'post',
          'uiSchema':[
            {
              'name':'credentials.passcode',
              'label':'One-time verification code',
              'secret':true,
              'method':'post',
              'type':'password',
              'params':{
                'showPasswordToggle':true
              }
            }
          ]
        },
        {
          'value':[
            {
              'name':'factorId',
              'type':'set',
              'options':[
                {
                  'label':'Password',
                  'value':'00u2j17ObFUsbGfLg0g4',
                  'method':'options',
                  'factorType':'password'
                },
                {
                  'label':'Email',
                  'value':'emf2j1ccd6CF4IWFY0g3',
                  'method':'options',
                  'factorType':'email'
                }
              ],
              'method':'post'
            }
          ],
          'href': 'http://localhost:3000/idp/idx/challenge',
          'name':'select-factor',
          'method':'post',
          'uiSchema':[
            {
              'name':'factorId',
              'type':'factorSelect',
              'options':[
                {
                  'label':'Password',
                  'value':'00u2j17ObFUsbGfLg0g4',
                  'method':'options',
                  'factorType':'password'
                },
                {
                  'label':'Email',
                  'value':'emf2j1ccd6CF4IWFY0g3',
                  'method':'options',
                  'factorType':'email'
                }
              ],
              'method':'post'
            }
          ]
        }
      ]
    });
  });

  it('converts factor enroll options', () => {
    const rawFactorEnrollResponse = XHRFactorEnrollOptions;
    const transformedResponse  = {
      'neededToProceed':[
        {
          'rel':[
            'create-form'
          ],
          'name':'select-factor',
          'href':'http://localhost:3000/idp/idx/challenge',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'factorProfileId',
              'type':'set',
              'options':[
                {
                  'label':'Password Label',
                  'value':'00u2j17ObFUsbGfLg0g4',
                  'method':'options'
                },
                {
                  'label':'Email Label',
                  'value':'emf2j1ccd6CF4IWFY0g3',
                  'method':'options'
                }
              ],
              'method':'post'
            }
          ]
        }
      ],
      'actions':{

      },
      'context':{
        'version':'1.0.0',
        'stateHandle':'01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
        'expiresAt':'2018-09-17T23:08:56.000Z',
        'step':'ENROLL',
        'intent':'login',
        'factors':{
          'type':'array',
          'value':[
            {
              'factorType':'password',
              'factorId':'00u2j17ObFUsbGfLg0g4'
            },
            {
              'factorType':'email',
              'factorId':'emf2j1ccd6CF4IWFY0g3'
            }
          ]
        },
        'user':{
          'type':'object',
          'value':{
            'id':'I9bvFiq01cRFgbn',
            'passwordChanged':'2019-05-03T19:00:00.000Z',
            'profile':{
              'login':'foo@example.com',
              'firstName':'Foo',
              'lastName':'Bar',
              'locale':'en-us',
              'timeZone':'UTC'
            }
          }
        }
      },
      'rawIdxState':rawFactorEnrollResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'factors':{
        'value':[
          {
            'factorType':'password',
            'factorId':'00u2j17ObFUsbGfLg0g4'
          },
          {
            'factorType':'email',
            'factorId':'emf2j1ccd6CF4IWFY0g3'
          }
        ]
      },
      'user':{
        'id':'I9bvFiq01cRFgbn',
        'passwordChanged':'2019-05-03T19:00:00.000Z',
        'profile':{
          'login':'foo@example.com',
          'firstName':'Foo',
          'lastName':'Bar',
          'locale':'en-us',
          'timeZone':'UTC'
        }
      },
      'neededToProceed':
        [
          {
            'rel':[
              'create-form'
            ],
            'name':'select-factor',
            'href':'http://localhost:3000/idp/idx/challenge',
            'method':'post',
            'accepts':'application/vnd.okta.v1+json',
            'value':[
              {
                'name':'factorProfileId',
                'type':'set',
                'options':[
                  {
                    'label':'Password Label',
                    'value':'00u2j17ObFUsbGfLg0g4',
                    'method':'options',
                    'factorType': 'password'
                  },
                  {
                    'label':'Email Label',
                    'value':'emf2j1ccd6CF4IWFY0g3',
                    'method':'options',
                    'factorType': 'email'
                  }
                ],
                'method':'post'
              }
            ]
          }
        ],
      'actions':{

      },
      'context':{
        'version':'1.0.0',
        'stateHandle':'01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
        'expiresAt':'2018-09-17T23:08:56.000Z',
        'step':'ENROLL',
        'intent':'login',
        'factors':{
          'type':'array',
          'value':[
            {
              'factorType':'password',
              'factorId':'00u2j17ObFUsbGfLg0g4'
            },
            {
              'factorType':'email',
              'factorId':'emf2j1ccd6CF4IWFY0g3'
            }
          ]
        },
        'user':{
          'type':'object',
          'value':{
            'id':'I9bvFiq01cRFgbn',
            'passwordChanged':'2019-05-03T19:00:00.000Z',
            'profile':{
              'login':'foo@example.com',
              'firstName':'Foo',
              'lastName':'Bar',
              'locale':'en-us',
              'timeZone':'UTC'
            }
          }
        }
      },
      'rawIdxState':rawFactorEnrollResponse,
      'remediations':[
        {
          'value':[
            {
              'name':'factorProfileId',
              'type':'set',
              'options':[
                {
                  'label':'Password Label',
                  'value':'00u2j17ObFUsbGfLg0g4',
                  'method':'options',
                  'factorType':'password'
                },
                {
                  'label':'Email Label',
                  'value':'emf2j1ccd6CF4IWFY0g3',
                  'method':'options',
                  'factorType':'email'
                }
              ],
              'method':'post'
            }
          ],
          'href': 'http://localhost:3000/idp/idx/challenge',
          'name':'select-factor',
          'method':'post',
          'uiSchema':[
            {
              'name':'factorProfileId',
              'type':'factorSelect',
              'options':[
                {
                  'label':'Password Label',
                  'value':'00u2j17ObFUsbGfLg0g4',
                  'method':'options',
                  'factorType':'password'
                },
                {
                  'label':'Email Label',
                  'value':'emf2j1ccd6CF4IWFY0g3',
                  'method':'options',
                  'factorType':'email'
                }
              ],
              'method':'post'
            }
          ]
        }
      ]
    });
  });

  it('converts response with fields as form for ENROLL_PROFILE', () => {
    const rawUserEnrollResponse = XHREnrollProfile;
    const transformedResponse  = {
      'neededToProceed':[
        {
          'rel':[
            'create-form'
          ],
          'name':'enroll-profile',
          'href':'http://localhost:3000/idp/idx/enroll',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'userProfile',
              'form':{
                'value':[
                  {
                    'name':'lastName',
                    'label':'Last name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'firstName',
                    'label':'First name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'email',
                    'label':'Primary email',
                    'required':true,
                    'method':'post'
                  }
                ],
                'method':'post'
              },
              'method':'post'
            }
          ]
        },
        {
          'rel':[
            'create-form'
          ],
          'name':'select-identify',
          'href':'http://localhost:3000/idp/idx',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'identifier',
              'label':'identifier',
              'method':'post'
            }
          ]
        }
      ],
      'actions':{

      },
      'context':{
        'stateHandle':'01r2p5S9qaAjESMFuPzt7r3ZMcZZQ_vvS0Tzg56ajB',
        'version':'1.0.0',
        'expiresAt':'2019-07-24T21:25:33.000Z',
        'step':'PROFILE_REQUIRED',
        'intent':'LOGIN'
      },
      'rawIdxState':rawUserEnrollResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'neededToProceed':[
        {
          'rel':[
            'create-form'
          ],
          'name':'enroll-profile',
          'href':'http://localhost:3000/idp/idx/enroll',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'userProfile',
              'form':{
                'value':[
                  {
                    'name':'lastName',
                    'label':'Last name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'firstName',
                    'label':'First name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'email',
                    'label':'Primary email',
                    'required':true,
                    'method':'post'
                  }
                ],
                'method':'post'
              },
              'method':'post'
            }
          ]
        },
        {
          'rel':[
            'create-form'
          ],
          'name':'select-identify',
          'href':'http://localhost:3000/idp/idx',
          'method':'post',
          'accepts':'application/vnd.okta.v1+json',
          'value':[
            {
              'name':'identifier',
              'label':'identifier',
              'method':'post'
            }
          ]
        }
      ],
      'actions':{

      },
      'context':{
        'stateHandle':'01r2p5S9qaAjESMFuPzt7r3ZMcZZQ_vvS0Tzg56ajB',
        'version':'1.0.0',
        'expiresAt':'2019-07-24T21:25:33.000Z',
        'step':'PROFILE_REQUIRED',
        'intent':'LOGIN'
      },
      'rawIdxState':rawUserEnrollResponse,
      'remediations':[
        {
          'value':[
            {
              'name':'userProfile',
              'form':{
                'value':[
                  {
                    'name':'lastName',
                    'label':'Last name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'firstName',
                    'label':'First name',
                    'required':true,
                    'method':'post'
                  },
                  {
                    'name':'email',
                    'label':'Primary email',
                    'required':true,
                    'method':'post'
                  }
                ],
                'method':'post'
              },
              'method':'post'
            }
          ],
          'href': 'http://localhost:3000/idp/idx/enroll',
          'name':'enroll-profile',
          'method':'post',
          'uiSchema':[
            {
              'name':'userProfile.lastName',
              'label':'Last name',
              'required':true,
              'method':'post',
              'type':'text'
            },
            {
              'name':'userProfile.firstName',
              'label':'First name',
              'required':true,
              'method':'post',
              'type':'text'
            },
            {
              'name':'userProfile.email',
              'label':'Primary email',
              'required':true,
              'method':'post',
              'type':'text'
            }
          ]
        },
        {
          'value':[
            {
              'name':'identifier',
              'label':'identifier',
              'method':'post'
            }
          ],
          'href': 'http://localhost:3000/idp/idx',
          'name':'select-identify',
          'method':'post',
          'uiSchema':[
            {
              'name':'identifier',
              'label':'identifier',
              'method':'post',
              'type':'text'
            }
          ]
        }
      ]
    });
  });

  it('converts authenticator require email', () => {
    const rawAuthenticatorRequiredEmailResponse = XHRAuthenticatorRequiredEmail;
    const transformedResponse  = {
      'proceed': jasmine.any(Function),
      'neededToProceed':[
        {
          'rel': [
            'create-form'
          ],
          'name': 'challenge-authenticator',
          'href': 'http://localhost:3000/idp/idx/challenge/answer',
          'method': 'POST',
          'accepts': 'application/vnd.okta.v1+json',
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
            },
          ]
        },
        {
          'rel': [
            'create-form'
          ],
          'name': 'select-authenticator-authenticate',
          'href': 'http://localhost:3000/idp/idx/challenge',
          'method': 'POST',
          'accepts': 'application/vnd.okta.v1+json',
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
            },
          ]
        },
      ],
      'actions':{

      },
      'context':{
        'stateHandle': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
        'version': '1.0.0',
        'expiresAt': '2020-05-05T16:58:36.000Z',
        'step': 'AUTHENTICATE',
        'intent': 'LOGIN',
        'authenticators': {
          'type': 'array',
          'value': [
            {
              'authenticatorType': 'password',
              'authenticatorId': 'autwa6eD9o02iBbtv0g3',
              'authenticatorEnrollmentId': 'aenwboITrg4b4yAYd0g3',
              'authenticatorName': 'Okta Password'
            },
            {
              'authenticatorType': 'webauthn',
              'authenticatorId': 'aidtheidkwh282hv8g3',
              'authenticatorName': 'Security Key or Biometric Authenticator (FIDO2)'
            },
            {
              'authenticatorType': 'email',
              'authenticatorId': 'aidtm56L8gXXHI1SD0g3',
              'authenticatorName': 'Okta Email',
              'methods': [
                {
                  'methodType': 'email'
                }
              ]
            }
          ]
        },
        'authenticator': {
          'type': 'object',
          'value': {
            'authenticatorType': 'email',
            'authenticatorId': 'aidtm56L8gXXHI1SD0g3',
            'authenticatorName': 'Okta Email',
            'methods': [
              {
                'methodType': 'email'
              }
            ],
            'profile': {
              'email': 'inca@hello.net'
            },
            'resend': {
              'rel': [
                'create-form'
              ],
              'name': 'resend',
              'href': 'http://localhost:3000/idp/idx/challenge/resend',
              'method': 'POST',
              'accepts': 'application/vnd.okta.v1+json',
              'value': [
                {
                  'name': 'stateHandle',
                  'required': true,
                  'value': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                  'visible': false,
                  'mutable': false
                }
              ]
            },
            'poll': {
              'rel': [
                'create-form'
              ],
              'name': 'poll',
              'href': 'http://localhost:3000/idp/idx/challenge/poll',
              'method': 'POST',
              'accepts': 'application/vnd.okta.v1+json',
              'refresh': 4000,
              'value': [
                {
                  'name': 'stateHandle',
                  'required': true,
                  'value': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                  'visible': false,
                  'mutable': false
                }
              ]
            }
          }
        },
        'user': {
          'type': 'object',
          'value': {
            'id': '00uwb8GLwf1HED5Xs0g3'
          }
        },
      },
      'rawIdxState': rawAuthenticatorRequiredEmailResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'authenticators': {
        'value': [
          {
            'authenticatorType': 'password',
            'authenticatorId': 'autwa6eD9o02iBbtv0g3',
            'authenticatorEnrollmentId': 'aenwboITrg4b4yAYd0g3',
            'authenticatorName': 'Okta Password'
          },
          {
            'authenticatorType': 'webauthn',
            'authenticatorId': 'aidtheidkwh282hv8g3',
            'authenticatorName': 'Security Key or Biometric Authenticator (FIDO2)'
          },
          {
            'authenticatorType': 'email',
            'authenticatorId': 'aidtm56L8gXXHI1SD0g3',
            'authenticatorName': 'Okta Email',
            'methods': [
              {
                'methodType': 'email'
              }
            ]
          }
        ]
      },
      'authenticator':{
        'authenticatorType': 'email',
        'authenticatorId': 'aidtm56L8gXXHI1SD0g3',
        'authenticatorName': 'Okta Email',
        'methods': [
          {
            'methodType': 'email'
          }
        ],
        'profile': {
          'email': 'inca@hello.net'
        },
        'resend': {
          'rel': [
            'create-form'
          ],
          'name': 'resend',
          'href': 'http://localhost:3000/idp/idx/challenge/resend',
          'method': 'POST',
          'accepts': 'application/vnd.okta.v1+json',
          'value': [
            {
              'name': 'stateHandle',
              'required': true,
              'value': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
              'visible': false,
              'mutable': false
            }
          ]
        },
        'poll': {
          'rel': [
            'create-form'
          ],
          'name': 'poll',
          'href': 'http://localhost:3000/idp/idx/challenge/poll',
          'method': 'POST',
          'accepts': 'application/vnd.okta.v1+json',
          'refresh': 4000,
          'value': [
            {
              'name': 'stateHandle',
              'required': true,
              'value': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
              'visible': false,
              'mutable': false
            }
          ]
        }
      },
      'user': {
        'id': '00uwb8GLwf1HED5Xs0g3'
      },
      'proceed': jasmine.any(Function),
      'neededToProceed':[
        {
          'rel': [
            'create-form'
          ],
          'name': 'challenge-authenticator',
          'href': 'http://localhost:3000/idp/idx/challenge/answer',
          'method': 'POST',
          'accepts': 'application/vnd.okta.v1+json',
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
          ]
        },
        {
          'rel': [
            'create-form'
          ],
          'name': 'select-authenticator-authenticate',
          'href': 'http://localhost:3000/idp/idx/challenge',
          'method': 'POST',
          'accepts': 'application/vnd.okta.v1+json',
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
            },
          ]
        },
      ],
      'actions':{

      },
      'context':{
        'stateHandle': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
        'version': '1.0.0',
        'expiresAt': '2020-05-05T16:58:36.000Z',
        'step': 'AUTHENTICATE',
        'intent': 'LOGIN',
        'authenticators': {
          'type': 'array',
          'value': [
            {
              'authenticatorType': 'password',
              'authenticatorId': 'autwa6eD9o02iBbtv0g3',
              'authenticatorEnrollmentId': 'aenwboITrg4b4yAYd0g3',
              'authenticatorName': 'Okta Password'
            },
            {
              'authenticatorType': 'webauthn',
              'authenticatorId': 'aidtheidkwh282hv8g3',
              'authenticatorName': 'Security Key or Biometric Authenticator (FIDO2)'
            },
            {
              'authenticatorType': 'email',
              'authenticatorId': 'aidtm56L8gXXHI1SD0g3',
              'authenticatorName': 'Okta Email',
              'methods': [
                {
                  'methodType': 'email'
                }
              ]
            }
          ]
        },
        'authenticator': {
          'type': 'object',
          'value': {
            'authenticatorType': 'email',
            'authenticatorId': 'aidtm56L8gXXHI1SD0g3',
            'authenticatorName': 'Okta Email',
            'methods': [
              {
                'methodType': 'email'
              }
            ],
            'profile': {
              'email': 'inca@hello.net'
            },
            'resend': {
              'rel': [
                'create-form'
              ],
              'name': 'resend',
              'href': 'http://localhost:3000/idp/idx/challenge/resend',
              'method': 'POST',
              'accepts': 'application/vnd.okta.v1+json',
              'value': [
                {
                  'name': 'stateHandle',
                  'required': true,
                  'value': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                  'visible': false,
                  'mutable': false
                }
              ]
            },
            'poll': {
              'rel': [
                'create-form'
              ],
              'name': 'poll',
              'href': 'http://localhost:3000/idp/idx/challenge/poll',
              'method': 'POST',
              'accepts': 'application/vnd.okta.v1+json',
              'refresh': 4000,
              'value': [
                {
                  'name': 'stateHandle',
                  'required': true,
                  'value': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
                  'visible': false,
                  'mutable': false
                }
              ]
            }
          }
        },
        'user': {
          'type': 'object',
          'value': {
            'id': '00uwb8GLwf1HED5Xs0g3'
          }
        },
      },
      'rawIdxState':rawAuthenticatorRequiredEmailResponse,
      'remediations': [
        {
          'name': 'challenge-authenticator',
          'href': 'http://localhost:3000/idp/idx/challenge/answer',
          'method': 'POST',
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
              'options': [
                {
                  'label': 'Okta Password',
                  'value': {
                    'id': 'autwa6eD9o02iBbtv0g3'
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
      ]
    });
  });

  it('converts authenticator enroll password', () => {
    const rawAuthenticatorEnrollOptionsResponse = XHRAuthenticatorEnrollOptions;
    const transformedResponse  = {
      'proceed': jasmine.any(Function),
      'neededToProceed':[
        {
          'rel': [
            'create-form'
          ],
          'name': 'select-authenticator-enroll',
          'href': 'http://localhost:3000/idp/idx/challenge',
          'method': 'POST',
          'accepts': 'application/vnd.okta.v1+json',
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
              ]
            },
          ]
        },
      ],
      'actions':{

      },
      'context':{
        'stateHandle': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
        'version': '1.0.0',
        'expiresAt': '2020-05-05T16:58:36.000Z',
        'step': 'AUTHENTICATE',
        'intent': 'LOGIN',
        'authenticators': {
          'type': 'array',
          'value': [
            {
              'authenticatorType': 'password',
              'authenticatorId': 'autwa6eD9o02iBbtv0g3',
              'authenticatorName': 'Okta Password'
            },
            {
              'authenticatorType': 'webauthn',
              'authenticatorId': 'aidtheidkwh282hv8g3',
              'authenticatorName': 'Security Key or Biometric Authenticator (FIDO2)'
            },
          ]
        },
        'user': {
          'type': 'object',
          'value': {
            'id': '00utjm1GstPjCF9Ad0g3'
          }
        },
      },
      'rawIdxState': rawAuthenticatorEnrollOptionsResponse
    };
    const result = _.compose(uiSchemaTransformer, responseTransformer)(transformedResponse);
    expect(result).toEqual({
      'authenticators': {
        'value': [
          {
            'authenticatorType': 'password',
            'authenticatorId': 'autwa6eD9o02iBbtv0g3',
            'authenticatorName': 'Okta Password'
          },
          {
            'authenticatorType': 'webauthn',
            'authenticatorId': 'aidtheidkwh282hv8g3',
            'authenticatorName': 'Security Key or Biometric Authenticator (FIDO2)'
          }
        ]
      },
      'user': {
        'id': '00utjm1GstPjCF9Ad0g3'
      },
      'proceed': jasmine.any(Function),
      'neededToProceed':[
        {
          'rel': [
            'create-form'
          ],
          'name': 'select-authenticator-enroll',
          'href': 'http://localhost:3000/idp/idx/challenge',
          'method': 'POST',
          'accepts': 'application/vnd.okta.v1+json',
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
              ]
            },
          ]
        },
      ],
      'actions':{

      },
      'context':{
        'stateHandle': '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
        'version': '1.0.0',
        'expiresAt': '2020-05-05T16:58:36.000Z',
        'step': 'AUTHENTICATE',
        'intent': 'LOGIN',
        'authenticators': {
          'type': 'array',
          'value': [
            {
              'authenticatorType': 'password',
              'authenticatorId': 'autwa6eD9o02iBbtv0g3',
              'authenticatorName': 'Okta Password'
            },
            {
              'authenticatorType': 'webauthn',
              'authenticatorId': 'aidtheidkwh282hv8g3',
              'authenticatorName': 'Security Key or Biometric Authenticator (FIDO2)'
            }
          ]
        },
        'user': {
          'type': 'object',
          'value': {
            'id': '00utjm1GstPjCF9Ad0g3'
          }
        },
      },
      'rawIdxState': rawAuthenticatorEnrollOptionsResponse,
      'remediations': [
        {
          'name': 'select-authenticator-enroll',
          'href': 'http://localhost:3000/idp/idx/challenge',
          'method': 'POST',
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
              ]
            }
          ],
          'uiSchema': [
            {
              'name': 'authenticator',
              'type': 'authenticatorSelect',
              'options': [
                {
                  'label': 'Okta Password',
                  'value': {
                    'id': 'autwa6eD9o02iBbtv0g3'
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
              ]
            }
          ]
        }
      ]
    });
  });

});
