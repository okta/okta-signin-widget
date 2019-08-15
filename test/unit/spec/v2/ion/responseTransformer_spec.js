import transformResponse from 'v2/ion/responseTransformer';
import XHRFactorRequiredEmail from '../../../helpers/xhr/v2/FACTOR_REQUIRED_EMAIL';
import XHRFactorVerificationRequiredEmail from '../../../helpers/xhr/v2/FACTOR_VERIFICATION_REQUIRED_EMAIL';
import XHRTerminalTransfered from '../../../helpers/xhr/v2/TERMINAL_TRANSFERED';

describe('v2/ion/responseTransformer', function () {
  it('returns result when invokes with invalid resp', () => {
    expect(transformResponse()).toBeNull();
    expect(transformResponse('hello')).toBeNull();
  });

  it('converts factor require email', () => {
    const result = transformResponse(XHRFactorRequiredEmail.response);
    expect(result).toEqual({
      'factor': {
        'id': 'emf1axecbKovLJPWl0g4',
        'factorType': 'email',
        'provider': 'OKTA',
        'vendorName': 'OKTA',
        'profile': {
          'email': 'e...a@rain.com'
        }
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
      'currentState': {
        'version': '1.0.0',
        'stateHandle': '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
        'expiresAt': '2018-09-17T23:08:56.000Z',
        'step': 'FACTOR_REQUIRED',
        'intent': 'login',
        'submit-factor': jasmine.any(Function),
        'cancel': jasmine.any(Function),
        'context': jasmine.any(Function),
        'remediation': [
          {
            'name': 'submit-factor',
            'value': [
              {
                'name': 'email',
                'placeholder': 'Enter code',
                'required': true,
                'type': 'text'
              }
            ]
          }
        ]
      },
      __rawResponse: XHRFactorRequiredEmail.response,
    });

    expect(result.currentState['submit-factor']()).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.currentState['submit-factor']({foo: 'bar'})).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
        foo: 'bar',
      }
    });

    expect(result.currentState['cancel']()).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/cancel',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    // cancel doesn't take additional data for http request
    expect(result.currentState['cancel']({ foo: 'bar' })).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/cancel',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.currentState['context']()).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/context',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    // context doesn't take additional data for http request
    expect(result.currentState['context']({ foo: 'bar' })).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/context',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });
  });

  it('converts factor verification require email', () => {
    const result = transformResponse(XHRFactorVerificationRequiredEmail.response);
    expect(result).toEqual({
      'factor': {
        'factorType': 'email',
        'provider': 'okta',
        'profile': {
          'email': 'o*****m@abbott.dev'
        },
        'poll': jasmine.any(Function),
        'resend': jasmine.any(Function),
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
      'currentState': {
        'version': '1.0.0',
        'stateHandle': '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
        'expiresAt': '2018-09-17T23:08:56.000Z',
        'step': 'FACTOR_VERIFICATION_REQUIRED',
        'intent': 'login',
        'cancel': jasmine.any(Function),
        'context': jasmine.any(Function),
        'otp': jasmine.any(Function),
        'remediation': [
          {
            'name': 'otp',
            'value': [
              {
                'name': 'otp',
                'label': 'Passcode',
                'minLength': 4
              }
            ]
          }
        ]
      },
      __rawResponse: XHRFactorVerificationRequiredEmail.response,
    });

    expect(result.factor['resend']()).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/resend',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.factor['poll']()).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/poll',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.factor['poll']({foo: 'bar'})).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/poll',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
      }
    });

    expect(result.currentState['cancel']()).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/cancel',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    // cancel doesn't take additional data for http request
    expect(result.currentState['cancel']({ foo: 'bar' })).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/cancel',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.currentState['context']()).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/context',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    // context doesn't take additional data for http request
    expect(result.currentState['context']({ foo: 'bar' })).toEqual({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/idx/context',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

  });

  it('converts terminal transfered', () => {
    const result = transformResponse(XHRTerminalTransfered.response);
    expect(result).toEqual({
      'terminal': {
        'name': 'terminal-transfered',
        'message': 'Flow continued in a new tab.',
      },
      'currentState': {
        'version': '1.0.0',
        'remediation': [],
      },
      __rawResponse: XHRTerminalTransfered.response,
    });
  });
});
