import errorUtils from '../../../../../src/v2/ion/errorUtils';

describe('errorUtils', () => {
  describe('buildErrorObject', () => {
    it('returns converted form errors for ION error response', () => {
      const ionError = {
        version: '1.0.0',
        messages: {
          type: 'array',
          value: [
            { message: 'An error occurred', class: 'ERROR' },
          ],
        },
      };
      const result = errorUtils.buildErrorObject(ionError);
      expect(result.responseJSON).toBeDefined();
      expect(result.responseJSON.errorSummary).toBeDefined();
    });

    it('returns error with errorSummary as-is when not classifiable', () => {
      const error = { errorSummary: 'Something went wrong' };
      const result = errorUtils.buildErrorObject(error);
      expect(result.responseJSON).toBe(error);
      expect(result.responseJSON.errorSummary).toBe('Something went wrong');
    });

    it('returns classified error for network failure (no xhr)', () => {
      const error = {
        name: 'AuthApiError',
        errorSummary: 'Failed to fetch',
      };
      const result = errorUtils.buildErrorObject(error);
      // loc() returns translated text; verify it's not the raw browser message
      expect(result.responseJSON.errorSummary).not.toBe('Failed to fetch');
      expect(result.responseJSON.errorSummary).toBeDefined();
    });

    it('returns classified error for 500 status', () => {
      const error = {
        name: 'AuthApiError',
        xhr: { status: 500 },
      };
      const result = errorUtils.buildErrorObject(error);
      expect(result.responseJSON.errorSummary).toBeDefined();
    });

    it('returns classified error for malformed response', () => {
      const error = {
        name: 'AuthApiError',
        errorSummary: 'Could not parse server response',
        xhr: { status: 200 },
      };
      const result = errorUtils.buildErrorObject(error);
      // Should be classified as a parse error, not returned as-is
      expect(result.responseJSON.errorSummary).not.toBe('Could not parse server response');
    });

    it('uses originalError for classification when provided', () => {
      // When rawIdxState is unwrapped, the original error is passed separately
      const unwrappedError = {}; // rawIdxState has no useful properties
      const originalError = {
        name: 'AuthApiError',
        errorSummary: 'Failed to fetch',
      };
      const result = errorUtils.buildErrorObject(unwrappedError, undefined, originalError);
      // Should classify based on originalError, not the unwrapped error
      expect(result.responseJSON.errorSummary).not.toBe('Failed to fetch');
      expect(result.responseJSON.errorSummary).toBeDefined();
    });

    it('falls back to unsupported response for unknown error shape', () => {
      const error = { someProperty: 'value' };
      const result = errorUtils.buildErrorObject(error);
      expect(result.responseJSON.errorSummary).toBeDefined();
      // Verify it's the translated unsupported response message
      expect(typeof result.responseJSON.errorSummary).toBe('string');
    });

    it('calls onUnsupportedError callback for unrecognized errors', () => {
      const callback = jest.fn();
      const error = { someProperty: 'value' };
      errorUtils.buildErrorObject(error, callback);
      expect(callback).toHaveBeenCalledWith(error);
    });

    it('does not call onUnsupportedError for ION errors', () => {
      const callback = jest.fn();
      const ionError = {
        version: '1.0.0',
        messages: { type: 'array', value: [] },
      };
      errorUtils.buildErrorObject(ionError, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('does not call onUnsupportedError for errors with errorSummary', () => {
      const callback = jest.fn();
      const error = { errorSummary: 'Known error' };
      errorUtils.buildErrorObject(error, callback);
      expect(callback).not.toHaveBeenCalled();
    });

    it('does not call onUnsupportedError for classified errors', () => {
      const callback = jest.fn();
      const error = {
        name: 'AuthApiError',
        xhr: { status: 502 },
      };
      errorUtils.buildErrorObject(error, callback);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('isRateLimitError', () => {
    it('returns true for tooManyRequests summary key', () => {
      const error = {
        responseJSON: {
          errorSummaryKeys: ['tooManyRequests'],
        },
      };
      expect(errorUtils.isRateLimitError(error)).toBe(true);
    });

    it('returns true for E0000047 error code without errorIntent', () => {
      const error = {
        responseJSON: {
          errorCode: 'E0000047',
        },
      };
      expect(errorUtils.isRateLimitError(error)).toBe(true);
    });

    it('returns false for E0000047 error code with errorIntent', () => {
      const error = {
        responseJSON: {
          errorCode: 'E0000047',
          errorIntent: 'LOGIN',
        },
      };
      expect(errorUtils.isRateLimitError(error)).toBe(false);
    });

    it('returns false for other errors', () => {
      const error = {
        responseJSON: {
          errorCode: 'E0000001',
        },
      };
      expect(errorUtils.isRateLimitError(error)).toBe(false);
    });
  });
});
