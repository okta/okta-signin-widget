var common    = require('./webpack.common.config');
var plugins   = require('./scripts/buildtools/webpack/plugins');
var usePolyfill = require('./scripts/buildtools/webpack/polyfill');
var path       = require('path');
var PLAYGROUND = path.resolve(__dirname, 'playground');

module.exports = (env = {}) => {
  const { isProduction, skipAnalyzer } = env;

  let entries = {
    'default': {
      entry: './src/exports/default.ts',
    },
    'classic': {
      entry: './src/exports/classic.ts',
      classic: true
    },
    'oie': {
      entry: './src/exports/oie.ts',
      oie: true
    }
  };
  
  // if ENTRY env var is passed, filter the entries to include only the named ENTRY
  if (process.env.ENTRY) {
    entries = {
      [process.env.ENTRY]: entries[process.env.ENTRY]
    };
  }

  
  const configs = Object.keys(entries).map(entryName => {
    const entryValue = entries[entryName];
    const webpackConfig = {
      ...common({
        outputFilename: `okta-sign-in.${entryName}.js`,
        ...entryValue,
      }),
      plugins: plugins({
        isProduction,
        skipAnalyzer,
        analyzerFile: `okta-sign-in.${entryName}.analyzer`
      })
    };


    if (isProduction) {
      // development bundle does not include runtime transforms
      usePolyfill(webpackConfig);
    } else {
      webpackConfig.optimization.minimize = false;
    }

    if (env.mockDuo) {
      console.log('======> Mocking Duo iFrame');  // eslint-disable-line no-console
      Object.assign(webpackConfig.resolve.alias, {
        'duo': `${PLAYGROUND}/mocks/spec-duo/duo-mock.js`,
      });
    }

    return webpackConfig;
  });
  return configs;
};
