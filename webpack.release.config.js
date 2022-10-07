// The release webpack config exports configs to build CDN bundles:

// 1. default - okta-sign-in.min.js - full widget for endusers. generates a minified built version of the
//    widget that includes everything necessary to run (including all vendor
//    libraries)

// 2. no polyfill - okta-sign-in.no-polyfill.min.js - full widget for endusers who do not need IE11.

// 3. classic - okta-sign-in.classic.min.js - classic widget for endusers. Does not support OIE. No polyfills.

// 4. oie - okta-sign-in.oie.min.js - oie widget for endusers. Does not support Classic engine. No polyfills.

// 5. polyfill - okta-sign-in.polyfill.min.js - polyfill for embedded widget that need to support IE11 and PKCE

// 6. plugin a11y - okta-plugin-a11y.js - add-on that enhances support for accesibility

var config  = require('./webpack.common.config');
var plugins = require('./scripts/buildtools/webpack/plugins');
var useRuntime = require('./scripts/buildtools/webpack/runtime');
var usePolyfill = require('./scripts/buildtools/webpack/polyfill');


let entries = {
  // 1. default (default entry, minified, with polyfill)
  'default': {
    includePolyfill: true,
    includeRuntime: true,
    entry: './src/exports/cdn/default.ts',
    outputFilename: 'okta-sign-in.min.js',
    analyzerFile: 'okta-sign-in.min.analyzer'
  },
  // 2. no polyfill (default entry, minified, no polyfill)
  'noPolyfill': {
    entry: './src/exports/cdn/default.ts',
    outputFilename: 'okta-sign-in.no-polyfill.min.js',
    analyzerFile: 'okta-sign-in.no-polyfill.min.analyzer'
  },
  // 3. classic (classic entry, minified, no polyfill)
  'classic': {
    entry: './src/exports/cdn/classic.ts',
    outputFilename: 'okta-sign-in.classic.min.js',
    analyzerFile: 'okta-sign-in.classic.min.analyzer',
    engine: 'classic',
  },
  // 4. oie (oie bundle, minified, no polyfill)
  'oie': {
    entry: './src/exports/cdn/oie.ts',
    outputFilename: 'okta-sign-in.oie.min.js',
    analyzerFile: 'okta-sign-in.oie.min.analyzer',
    engine: 'oie'
  },
  // 5. polyfill for IE11 (embedded widgets)
  'polyfill': {
    entry: './polyfill/polyfill.js',
    outputFilename: 'okta-sign-in.polyfill.min.js',
    analyzerFile: 'okta-sign-in.polyfill.min.analyzer'
  },
  // 6. plugins: a11y
  'a11y': {
    entry: './src/plugins/OktaPluginA11y.ts',
    outputFilename: 'okta-plugin-a11y.js',
    outputLibrary: 'OktaPluginA11y'
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
  const { entry, outputFilename, analyzerFile, engine, outputLibrary, includePolyfill, includeRuntime } = entryValue;
  
  const entryConfig = config({
    mode: 'production',
    entry,
    outputFilename,
    engine
  });

  if (analyzerFile) {
    entryConfig.plugins = plugins({ isProduction: true, analyzerFile });
  }

  if (outputLibrary) {
    entryConfig.output.library = outputLibrary;
  }

  if (includeRuntime) {
    useRuntime(entryConfig);
  }

  if (includePolyfill) {
    usePolyfill(entryConfig);
  }
  
  return entryConfig;
});

module.exports = configs;
