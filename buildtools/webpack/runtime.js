module.exports = function addRuntime (webpackConfig, runtimeOptions) {
  const rules = webpackConfig.module.rules;
  const babelRule = rules.find(rule => rule.loader === 'babel-loader');
  babelRule.options.plugins = babelRule.options.plugins.concat([
    [ '@babel/transform-runtime', runtimeOptions ]
  ]);
};
