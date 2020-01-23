const path = require('path');
const responseConfig = require('./responseConfig');
const supportedApi = [
  '/api/v1/authn',
  '/idp/idx'
];

const getDataDir = (apiPath) => {
  const xs = supportedApi.filter(api => {
    return apiPath.indexOf(api) === 0;
  });

  if (xs.length === 1) {
    return `${__dirname}/../mocks/${xs[0]}/data`;
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
    method: 'POST',
    status: (req, res, next) => {
      if(!hasChainedMockData) {
        res.status(403);
        next();
        return;
      }
      const mockFile = getMockFile();

      const basenameMockFile = path.basename(mockFile, '.json');
      // response as error when the file name starts with 'error'
      if (basenameMockFile.indexOf('error') === 0) {
        res.status(403);
      }
      next();
    },
    template () {
      if (!hasChainedMockData) {
        return {
          errorSummary: `No mock found for ${apiPath}`,
        };
      } else {
        const mockFile = getMockFile();

        // move cursor to next response only after mock has been generated.
        updateIndex();

        return require(mockFile);
      }

    }
  }, option);
};

module.exports = configMock;
