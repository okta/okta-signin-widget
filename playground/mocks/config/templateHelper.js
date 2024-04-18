const path = require('path');
const responseConfig = require('./responseConfig');
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
      if (!hasChainedMockData) {
        res.status(403);
        next();
        return;
      }
      const mockFile = getMockFile();

      const basenameMockFile = path.basename(mockFile, '.json');
      // response as error when the file name starts with 'error'
      if (basenameMockFile.indexOf('error-400') === 0) {
        res.status(400);
      } else if (basenameMockFile.indexOf('error-401') === 0) {
        res.status(401);
      } else if (basenameMockFile.indexOf('error-429') === 0) {
        res.status(429);
      } else if (basenameMockFile.indexOf('error') === 0) {
        res.status(403);
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

        // overwrite URLs if using mock server behind the proxy
        const json = require(mockFile);
        const str = JSON.stringify(json).replace(/http:\/\/localhost:3000/g, process.env.BASE_URL);
        return JSON.parse(str);
      }

    }
  }, option);
};

module.exports = configMock;
