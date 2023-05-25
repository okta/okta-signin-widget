// The dev webpack config exports configs to build developer bundles:

// 1. default - okta-sign-in.js - full widget for developers. Supports both OIE and Classic engines.

// 2. classic - okta-sign-in.classic.js - classic widget for developers. Does not support OIE (idx) engine.

// 3. oie - okta-sign-in.oie.js - oie widget for developers. Does not support Classic (authn) engine

var common    = require('./webpack.common.config');
var plugins   = require('./scripts/buildtools/webpack/plugins');
var usePolyfill = require('./scripts/buildtools/webpack/polyfill');
var path       = require('path');
var PLAYGROUND = path.resolve(__dirname, 'playground');
var ASSETS_DIR = path.resolve(__dirname, 'assets');
var DEFAULT_ENTRIES = {
  'default': {
    entry: './src/exports/cdn/default.ts',
  },
  'classic': {
    entry: './src/exports/cdn/classic.ts',
    engine: 'classic'
  },
  'oie': {
    entry: './src/exports/cdn/oie.ts',
    engine: 'oie'
  },
  'polyfill': {
    entry: './polyfill/index.js',
    outputLibrary: null
  },
  'css': {
    entry: `${ASSETS_DIR}/sass/okta-sign-in.scss`,
    copyAssets: true,
  }
};

module.exports = (env = {}) => {
  const { isProduction, skipAnalyzer } = env;

  let entries = { ...DEFAULT_ENTRIES };
  
  // if ENTRY env var is passed, filter the entries to include only the named ENTRY
  if (process.env.ENTRY) {
    entries = {
      [process.env.ENTRY]: DEFAULT_ENTRIES[process.env.ENTRY],
      ...(process.env.ENTRY !== 'css' && { css: DEFAULT_ENTRIES.css })
    };
  }

  const configs = Object.keys(entries).map(entryName => {
    const entryValue = entries[entryName];
    const fileNameBase = entryName === 'default' ? 'okta-sign-in' : `okta-sign-in.${entryName}`;
    const webpackConfig = {
      ...common({
        ...(entryName !== 'css' && { outputFilename: `${fileNameBase}.js` }),
        ...entryValue,
      }),
      plugins: plugins({
        isProduction,
        skipAnalyzer,
        analyzerFile: `${fileNameBase}.analyzer`,
        copyAssets: entryValue.copyAssets,
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
        '@okta/duo': `${PLAYGROUND}/mocks/spec-duo/duo-mock.js`,
      });
    }

    return webpackConfig;
  });
  return configs;
};
