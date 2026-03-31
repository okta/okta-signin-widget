import { withNetworkRetry } from '../../../../src/util/retryRequest';

describe('retryRequest', () => {
  describe('withNetworkRetry', () => {
    it('returns result on first successful call', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await withNetworkRetry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries once on network error and succeeds', async () => {
      const networkError = { name: 'AuthApiError', errorSummary: 'Failed to fetch' };
      const fn = jest.fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce('success');

      const result = await withNetworkRetry(fn, { delayMs: 0 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('throws after exhausting retries on persistent network error', async () => {
      const networkError = { name: 'AuthApiError', errorSummary: 'Failed to fetch' };
      const fn = jest.fn().mockRejectedValue(networkError);

      await expect(withNetworkRetry(fn, { maxRetries: 1, delayMs: 0 }))
        .rejects.toBe(networkError);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not retry on non-network errors', async () => {
      const serverError = { name: 'AuthApiError', errorSummary: 'User not found' };
      const fn = jest.fn().mockRejectedValue(serverError);

      await expect(withNetworkRetry(fn, { delayMs: 0 })).rejects.toBe(serverError);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('does not retry on ION errors', async () => {
      const ionError = { version: '1.0.0', messages: { type: 'array', value: [] } };
      const fn = jest.fn().mockRejectedValue(ionError);

      await expect(withNetworkRetry(fn, { delayMs: 0 })).rejects.toBe(ionError);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on timeout error', async () => {
      const timeoutError = { name: 'AbortError', errorSummary: 'The operation was aborted' };
      const fn = jest.fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce('recovered');

      const result = await withNetworkRetry(fn, { delayMs: 0 });

      expect(result).toBe('recovered');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('respects maxRetries parameter', async () => {
      const networkError = { name: 'AuthApiError', errorSummary: 'Failed to fetch' };
      const fn = jest.fn().mockRejectedValue(networkError);

      await expect(withNetworkRetry(fn, { maxRetries: 2, delayMs: 0 }))
        .rejects.toBe(networkError);
      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('retries on xhr status 0 (connection failed)', async () => {
      const connectionError = {
        name: 'AuthApiError',
        xhr: { status: 0 },
      };
      const fn = jest.fn()
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValueOnce('recovered');

      const result = await withNetworkRetry(fn, { delayMs: 0 });

      expect(result).toBe('recovered');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('retries on proxy 403 (network policy block)', async () => {
      const policyError = {
        name: 'AuthApiError',
        xhr: { status: 403, headers: {} },
      };
      const fn = jest.fn()
        .mockRejectedValueOnce(policyError)
        .mockResolvedValueOnce('recovered');

      const result = await withNetworkRetry(fn, { delayMs: 0 });

      expect(result).toBe('recovered');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('does not retry Okta 403 (has x-okta-request-id)', async () => {
      const okta403 = {
        name: 'AuthApiError',
        xhr: { status: 403, headers: { 'x-okta-request-id': 'abc123' } },
      };
      const fn = jest.fn().mockRejectedValue(okta403);

      await expect(withNetworkRetry(fn, { delayMs: 0 })).rejects.toBe(okta403);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('does not retry server errors (5xx)', async () => {
      const serverError = {
        name: 'AuthApiError',
        xhr: { status: 500 },
      };
      const fn = jest.fn().mockRejectedValue(serverError);

      await expect(withNetworkRetry(fn, { delayMs: 0 })).rejects.toBe(serverError);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
