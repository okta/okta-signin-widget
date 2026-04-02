const fs = require('fs');
const path = require('path');
const responseConfig = require('./responseConfig');
const { isNetworkFailureConfig, createNetworkFailureRoute, resetAllCounters } = require('./networkFailureHelper');
const supportedApi = [
  '/oauth2/',
  '/api/v1/authn',
  '/api/v1/registration',
  '/idp/idx',
  '/.well-known/webfinger'
];

const getDataDir = (apiPath) => {
  const xs = supportedApi.filter(api => {
    return apiPath.indexOf(api) === 0;
  });

  if (xs.length === 1) {
    return `${__dirname}/../data/${xs[0]}`;
  } else {
    return __dirname;
  }
};

const configMock = (option) => {
  let index = 0;
  const apiPath = option.path;
  const chainedMockData = responseConfig.mocks[apiPath];

  // If the mock config uses withNetworkFailure(), produce a
  // route that simulates socket destruction on specified request numbers.
  if (isNetworkFailureConfig(chainedMockData)) {
    return createNetworkFailureRoute(apiPath, chainedMockData, option.method || 'POST');
  }

  const hasChainedMockData = Array.isArray(chainedMockData) && chainedMockData.length > 0;
  const updateIndex = () => {
    index++;
    if (index >= chainedMockData.length) {
      index = 0;
    }
  };
  const getMockFile = () => {
    const dataDir = getDataDir(apiPath);
    const fileName = chainedMockData[index];
    const filePath = `${dataDir}/${fileName}.json`;
    return (filePath);
  };

  return Object.assign({
    // delay: [2000, 3000],
    proxy: false,
    method: option.method || 'POST',
    status: (req, res, next) => {
      // Reset network failure counters at the start of each IDX flow (OKTA-1083742)
      if (apiPath.endsWith('/introspect')) {
        resetAllCounters();
      }
      if (!hasChainedMockData) {
        res.status(403);
        next();
        return;
      }
      const mockFile = getMockFile();

      const basenameMockFile = path.basename(mockFile, '.json');
      // Derive HTTP status from the mock filename.
      // Files named error-{NNN}-*.json use that status code;
      // files named error-*.json (without a numeric code) default to 403.
      if (basenameMockFile.indexOf('error') === 0) {
        const match = basenameMockFile.match(/^error-(\d{3})/);
        res.status(match ? Number(match[1]) : 403);
      }
      next();
    },
    template() {
      if (!hasChainedMockData) {
        return {
          errorSummary: `No mock found for ${apiPath}`,
        };
      } else {
        const mockFile = getMockFile();

        // move cursor to next response only after mock has been generated.
        updateIndex();

        // Read raw file content so non-JSON mocks (e.g. invalid.json
        // containing HTML) are returned as-is, simulating a proxy error page.
        const raw = fs.readFileSync(mockFile, 'utf8');
        try {
          const json = JSON.parse(raw);
          // overwrite URLs if using mock server behind the proxy
          const str = JSON.stringify(json).replace(/http:\/\/localhost:3000/g, process.env.BASE_URL);
          return JSON.parse(str);
        } catch (_) {
          // Not valid JSON — return the raw content (Express sends as text/html)
          return raw;
        }
      }

    }
  }, option);
};

module.exports = configMock;
