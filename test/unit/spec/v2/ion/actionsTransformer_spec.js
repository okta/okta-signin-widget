import transformResponse from 'v2/ion/responseTransformer';
import transformActions from 'v2/ion/actionsTransformer';
import httpClient from 'v2/ion/httpClient';
import XHRFactorRequiredEmail from '../../../helpers/xhr/v2/FACTOR_REQUIRED_EMAIL';
import XHRFactorVerificationRequiredPush from '../../../helpers/xhr/v2/FACTOR_VERIFICATION_REQUIRED_OKTA_PUSH';
import { _ } from 'okta';

describe('v2/ion/actionsTransformer', function () {
  it('returns result when invokes with invalid resp', () => {
    expect(transformActions()).toBeNull();
    expect(transformActions('hello')).toBeNull();
  });

  it('converts factor require email', () => {
    const result = _.compose(transformActions, transformResponse)(XHRFactorRequiredEmail.response);
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

    spyOn(httpClient, 'fetchRequest');
    result.currentState['submit-factor']();
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    result.currentState['submit-factor']({ foo: 'bar' });
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
        foo: 'bar'
      }
    );

    result.currentState['cancel']();
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/cancel',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    // cancel doesn't take additional data for http request
    result.currentState['cancel']({ foo: 'bar' });
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/cancel',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    result.currentState['context']();
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/context',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    // context doesn't take additional data for http request
    result.currentState['context']({ foo: 'bar' });
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/context',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

  });

  it('converts factor verification require push', () => {
    const result = _.compose(transformActions, transformResponse)(XHRFactorVerificationRequiredPush.response);
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
            'refresh': 2000
          }
        ]
      },
      __rawResponse: XHRFactorVerificationRequiredPush.response,
    });

    spyOn(httpClient, 'fetchRequest');
    result.factor['refresh']();
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/refresh',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    result.factor['resend']();
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/resend',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    result.currentState['factor-poll-verification']();
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    result.currentState['factor-poll-verification']({ foo: 'bar' });
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82',
        foo: 'bar'
      }
    );

    result.currentState['cancel']();
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/cancel',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    // cancel doesn't take additional data for http request
    result.currentState['cancel']({ foo: 'bar' });
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/cancel',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    result.currentState['context']();
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/context',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

    // context doesn't take additional data for http request
    result.currentState['factor-poll-verification']({ foo: 'bar' });
    expect(httpClient.fetchRequest).toHaveBeenCalledWith(
      'https://your-org.okta.com/api/v2/authn/context',
      'POST',
      {
        stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'
      }
    );

  });

});
