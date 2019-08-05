import transformResponse from 'v2/ion/responseTransformer';
import XHRFactorRequiredEmail from '../../../helpers/xhr/v2/FACTOR_REQUIRED_EMAIL';
import XHRFactorVerificationRequiredPush from '../../../helpers/xhr/v2/FACTOR_VERIFICATION_REQUIRED_OKTA_PUSH';

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
      url: 'https://your-org.okta.com/api/v2/authn/',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.currentState['submit-factor']({foo: 'bar'})).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
        foo: 'bar',
      }
    });

    expect(result.currentState['cancel']()).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/cancel',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    // cancel doesn't take additional data for http request
    expect(result.currentState['cancel']({ foo: 'bar' })).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/cancel',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.currentState['context']()).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/context',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    // context doesn't take additional data for http request
    expect(result.currentState['context']({ foo: 'bar' })).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/context',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

  });

  it('converts factor verification require push', () => {
    const result = transformResponse(XHRFactorVerificationRequiredPush.response);
    expect(result).toEqual({
      'factor': {
        'factorType': 'push',
        'provider': 'okta',
        'profile': {
          'email': 'omgm@foo.dev'
        },
        'qr': {
          'href': ':link/:to/:qrcode'
        },
        'refresh': jasmine.any(Function),
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
        'factor-poll-verification': jasmine.any(Function),
        'cancel': jasmine.any(Function),
        'context': jasmine.any(Function),
        'remediation': [
          {
            'name': 'factor-poll-verification',
            'refresh': 2000,
            'value': [],
          }
        ]
      },
      __rawResponse: XHRFactorVerificationRequiredPush.response,
    });

    expect(result.factor['refresh']()).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/refresh',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.factor['resend']()).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/resend',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.currentState['factor-poll-verification']()).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.currentState['factor-poll-verification']({foo: 'bar'})).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
      }
    });

    expect(result.currentState['cancel']()).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/cancel',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    // cancel doesn't take additional data for http request
    expect(result.currentState['cancel']({ foo: 'bar' })).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/cancel',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    expect(result.currentState['context']()).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/context',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

    // context doesn't take additional data for http request
    expect(result.currentState['context']({ foo: 'bar' })).toEqual({
      method: 'POST',
      url: 'https://your-org.okta.com/api/v2/authn/context',
      data: {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    });

  });

});
