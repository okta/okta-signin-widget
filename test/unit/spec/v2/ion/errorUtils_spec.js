import { _ } from '@okta/courage';
import errorUtils from 'v2/ion/errorUtils';
import Bundles from 'util/Bundles';

describe('v2/ion/errorUtils', function() {
  let originalLoginBundle;

  beforeAll(() => {
    originalLoginBundle = Bundles.login;
    Bundles.login = _.extend({}, originalLoginBundle, {
      'foo.error': 'localized foo error',
    });
  });
  afterAll(() => {
    Bundles.login = originalLoginBundle;
    originalLoginBundle = null;
  });

  describe('buildErrorObject', () => {
    it('converts ION error responses to form errors', () => {
      const error = {
        version: '1.0.0',
        messages: {
          type: 'array',
          value: [{ class: 'ERROR', i18n: { key: 'foo.error' }, message: 'foo error' }],
        },
      };
      expect(errorUtils.buildErrorObject(error)).toEqual({
        responseJSON: {
          errorCauses: [],
          errorSummary: 'localized foo error',
          errorSummaryKeys: ['foo.error'],
          errorIntent: undefined,
        },
      });
    });

    it('uses messages instead of errorSummary for API errors that carry messages', () => {
      const error = {
        errorCode: 'E0000001',
        errorSummary: 'Api validation failed: Switch to your other device',
        errorCauses: [],
        messages: {
          type: 'array',
          value: [
            {
              class: 'ERROR',
              i18n: { key: 'idx.only.fastpass.enrollment.on.other.device.error' },
              message: 'Switch to your other device',
            },
          ],
        },
      };
      expect(errorUtils.buildErrorObject(error)).toEqual({
        responseJSON: {
          ...error,
          errorSummary: 'Switch to your other device',
          errorSummaryKeys: ['idx.only.fastpass.enrollment.on.other.device.error'],
        },
      });
    });

    it('localizes messages on API errors when the i18n key is known', () => {
      const error = {
        errorCode: 'E0000001',
        errorSummary: 'Api validation failed: foo error',
        messages: {
          type: 'array',
          value: [{ class: 'ERROR', i18n: { key: 'foo.error' }, message: 'foo error' }],
        },
      };
      expect(errorUtils.buildErrorObject(error).responseJSON.errorSummary).toEqual('localized foo error');
    });

    it('uses errorSummary for API errors without messages', () => {
      const error = {
        errorCode: 'E0000001',
        errorSummary: 'Api validation failed: foo',
        messages: { type: 'array', value: [] },
      };
      expect(errorUtils.buildErrorObject(error)).toEqual({ responseJSON: error });
    });

    it('returns an unsupported response error and calls onUnsupportedError for unknown errors', () => {
      const error = { foo: 'bar' };
      const onUnsupportedError = jest.fn();
      expect(errorUtils.buildErrorObject(error, onUnsupportedError)).toEqual({
        responseJSON: { errorSummary: Bundles.login['error.unsupported.response'] },
      });
      expect(onUnsupportedError).toHaveBeenCalledWith(error);
    });
  });
});
