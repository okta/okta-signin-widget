const postcssPresetEnv = require('postcss-preset-env');

module.exports = () => {
  const plugins = [postcssPresetEnv()];
  return { plugins };
};