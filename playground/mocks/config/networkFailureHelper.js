/**
 * Network Failure Simulation Helper (OKTA-1083742)
 * 
 * Provides utilities to simulate intermittent network failures on any mock server path.
 * This is useful for testing that the widget gracefully recovers from transient network errors
 * (e.g., "Failed to fetch") during polling or other async operations.
 * 
 * Usage in responseConfig.js or test-configs:
 * 
 *   const { withNetworkFailure } = require('./networkFailureHelper');
 * 
 *   // Fail the 2nd request on /idp/idx/challenge/poll, others respond normally
 *   const networkFailurePollMock = {
 *     '/idp/idx/introspect': ['authenticator-verification-email-polling-short'],
 *     '/idp/idx/challenge/poll': withNetworkFailure(
 *       ['authenticator-verification-email-polling-short'],  // normal chained responses
 *       { failOnRequests: [2] }                              // fail on 2nd request
 *     ),
 *   };
 */

const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');

const supportedApi = [
  '/oauth2/',
  '/api/v1/authn',
  '/api/v1/registration',
  '/idp/idx',
  '/.well-known/webfinger'
];

const getDataDir = (apiPath) => {
  const xs = supportedApi.filter(api => apiPath.indexOf(api) === 0);
  return xs.length === 1 ? `${DATA_DIR}/${xs[0]}` : DATA_DIR;
};

/**
 * Mark a chained response array with network failure metadata.
 * When consumed by `createNetworkFailureRoute`, the specified request numbers
 * will destroy the socket (simulating "Failed to fetch") instead of responding.
 * 
 * @param {string[]} responses - Array of mock response filenames (same format as responseConfig)
 * @param {object} options
 * @param {number[]} options.failOnRequests - 1-based request numbers that should fail
 *   e.g., [2] means the 2nd request will fail, [2, 4] means 2nd and 4th will fail
 * @returns {{ responses: string[], failOnRequests: number[], __networkFailure: true }}
 */
function withNetworkFailure(responses, { failOnRequests = [2] } = {}) {
  return {
    responses,
    failOnRequests,
    __networkFailure: true,
  };
}

/**
 * Check if a mock config value was created by `withNetworkFailure`.
 * @param {any} value 
 * @returns {boolean}
 */
function isNetworkFailureConfig(value) {
  return value !== null && value !== undefined && value.__networkFailure === true;
}

// Registry of reset callbacks for all active network failure routes.
// Called on /introspect to reset counters at the start of each IDX flow.
const resetCallbacks = [];

/**
 * Reset all network failure counters. Call this when a new IDX flow starts
 * (e.g., on /idp/idx/introspect) so the failure pattern repeats on page reload.
 */
function resetAllCounters() {
  resetCallbacks.forEach(fn => fn());
}

/**
 * Create an Express route config for a path that simulates network failures.
 * This produces an object compatible with server.js's `registerService()`.
 * 
 * @param {string} routePath - The API path (e.g., '/idp/idx/challenge/poll')
 * @param {object} failureConfig - Output from `withNetworkFailure()`
 * @param {string} [method='POST'] - HTTP method
 * @returns {object} Route config for server.js registration
 */
function createNetworkFailureRoute(routePath, failureConfig, method = 'POST') {
  const { responses, failOnRequests } = failureConfig;
  let requestCount = 0;
  let responseIndex = 0;

  // Register reset callback so counters reset on introspect (new IDX flow)
  resetCallbacks.push(() => {
    requestCount = 0;
    responseIndex = 0;
  });

  return {
    path: routePath,
    method,
    render: (req, res) => {
      requestCount++;

      if (failOnRequests.includes(requestCount)) {
        console.log(`[NetworkFailure] Simulating failure on ${routePath} #${requestCount}`);
        req.socket.destroy();
        return;
      }

      console.log(`[NetworkFailure] ${routePath} #${requestCount} - responding normally`);
      const dataDir = getDataDir(routePath);
      const fileName = responses[responseIndex];
      const filePath = `${dataDir}/${fileName}.json`;
      const json = require(filePath);
      
      // Advance to next response in chain (loop back to start)
      responseIndex++;
      if (responseIndex >= responses.length) {
        responseIndex = 0;
      }

      const basenameMockFile = path.basename(filePath, '.json');
      if (basenameMockFile.indexOf('error-400') === 0) {
        res.status(400);
      } else if (basenameMockFile.indexOf('error-401') === 0) {
        res.status(401);
      } else if (basenameMockFile.indexOf('error-429') === 0) {
        res.status(429);
      } else if (basenameMockFile.indexOf('error') === 0) {
        res.status(403);
      }

      res.json(json);
    }
  };
}

module.exports = {
  withNetworkFailure,
  isNetworkFailureConfig,
  createNetworkFailureRoute,
  resetAllCounters,
};
