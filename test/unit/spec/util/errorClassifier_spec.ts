import { classifyError, isLikelyStaleSession } from '../../../../src/util/errorClassifier';

describe('errorClassifier', () => {
  describe('classifyError', () => {
    it('returns network error key when fetch fails with no xhr', () => {
      const error = {
        name: 'AuthApiError',
        errorSummary: 'Failed to fetch',
      };
      expect(classifyError(error)).toBe('error.network.connection');
    });

    it('returns network error key for "Load failed" (Safari)', () => {
      const error = {
        name: 'AuthApiError',
        errorSummary: 'Load failed',
      };
      expect(classifyError(error)).toBe('error.network.connection');
    });

    it('returns network error key for "NetworkError"', () => {
      const error = {
        name: 'AuthApiError',
        errorSummary: 'NetworkError when attempting to fetch resource.',
      };
      expect(classifyError(error)).toBe('error.network.connection');
    });

    it('returns network error key when xhr status is 0', () => {
      const error = {
        name: 'AuthApiError',
        xhr: { status: 0 },
      };
      expect(classifyError(error)).toBe('error.network.connection');
    });

    it('returns timeout error key for AbortError', () => {
      const error = {
        name: 'AbortError',
        errorSummary: 'The operation was aborted',
      };
      expect(classifyError(error)).toBe('error.request.timeout');
    });

    it('returns timeout error key when errorSummary mentions timeout', () => {
      const error = {
        name: 'AuthApiError',
        xhr: { status: 408 },
        errorSummary: 'Request timeout',
      };
      expect(classifyError(error)).toBe('error.request.timeout');
    });

    it('returns server error key for 500 status', () => {
      const error = {
        name: 'AuthApiError',
        xhr: { status: 500 },
      };
      expect(classifyError(error)).toBe('error.server.internal');
    });

    it('returns server error key for 502 status', () => {
      const error = {
        name: 'AuthApiError',
        xhr: { status: 502 },
      };
      expect(classifyError(error)).toBe('error.server.internal');
    });

    it('returns server error key for 503 status', () => {
      const error = {
        name: 'AuthApiError',
        xhr: { status: 503 },
      };
      expect(classifyError(error)).toBe('error.server.internal');
    });

    it('returns parse error key for malformed JSON', () => {
      const error = {
        name: 'AuthApiError',
        errorSummary: 'Could not parse server response',
        xhr: { status: 200 },
      };
      expect(classifyError(error)).toBe('error.server.parse');
    });

    it('returns unsupported response key for unknown error shape', () => {
      const error = {
        someProperty: 'someValue',
      };
      expect(classifyError(error)).toBe('error.unsupported.response');
    });

    it('returns unsupported response key for null', () => {
      expect(classifyError(null)).toBe('error.unsupported.response');
    });

    it('returns unsupported response key for undefined', () => {
      expect(classifyError(undefined)).toBe('error.unsupported.response');
    });

    it('returns unsupported response key for non-object', () => {
      expect(classifyError('string error')).toBe('error.unsupported.response');
    });

    it('returns unsupported response key for empty object', () => {
      expect(classifyError({})).toBe('error.unsupported.response');
    });

    it('uses message property as fallback when errorSummary is absent', () => {
      const error = {
        name: 'AuthApiError',
        message: 'Failed to fetch',
      };
      expect(classifyError(error)).toBe('error.network.connection');
    });

    it('does not classify as network error when xhr exists even with network-like message', () => {
      // When xhr exists, the fetch succeeded but the response had issues
      const error = {
        name: 'AuthApiError',
        errorSummary: 'Failed to fetch',
        xhr: { status: 400 },
      };
      // Has xhr so not a network error, status 400 is not 5xx, message is not timeout/parse
      expect(classifyError(error)).toBe('error.unsupported.response');
    });
  });

  describe('isLikelyStaleSession', () => {
    const THIRTY_MINUTES = 30 * 60 * 1000;

    const networkError = { errorSummary: 'Failed to fetch' };
    const timeoutError = { name: 'AbortError', errorSummary: 'The operation was aborted' };
    const serverError = { xhr: { status: 500 } };
    const parseError = { errorSummary: 'Could not parse server response', xhr: { status: 200 } };
    const unknownError = { someProperty: 'someValue' };

    it('returns true for network error with session older than 30 minutes', () => {
      expect(isLikelyStaleSession(networkError, THIRTY_MINUTES + 1)).toBe(true);
    });

    it('returns true for timeout error with session older than 30 minutes', () => {
      expect(isLikelyStaleSession(timeoutError, THIRTY_MINUTES + 1)).toBe(true);
    });

    it('returns true for server error with session older than 30 minutes', () => {
      expect(isLikelyStaleSession(serverError, THIRTY_MINUTES + 1)).toBe(true);
    });

    it('returns false for network error with session younger than 30 minutes', () => {
      expect(isLikelyStaleSession(networkError, THIRTY_MINUTES - 1)).toBe(false);
    });

    it('returns false for parse error even with old session', () => {
      // Parse errors are not network/server transient errors
      expect(isLikelyStaleSession(parseError, THIRTY_MINUTES + 1)).toBe(false);
    });

    it('returns false for unknown error even with old session', () => {
      expect(isLikelyStaleSession(unknownError, THIRTY_MINUTES + 1)).toBe(false);
    });

    it('returns true when session age is exactly at the threshold', () => {
      // Threshold check uses strict less-than, so exactly 30 min is NOT less than threshold
      expect(isLikelyStaleSession(networkError, THIRTY_MINUTES)).toBe(true);
    });

    it('returns true when session age is Infinity (no timestamp)', () => {
      expect(isLikelyStaleSession(networkError, Infinity)).toBe(true);
    });

    it('returns false for null error with old session', () => {
      expect(isLikelyStaleSession(null, THIRTY_MINUTES + 1)).toBe(false);
    });
  });
});
