const defaultConfigs = require('./.testcaferc.json');

module.exports = {
  ...defaultConfigs,
  filter: (testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
    return fixtureMeta.v3 === true;
  },
};
