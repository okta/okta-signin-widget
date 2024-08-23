const { resolve } = require('path');
const pkg = require('./package.json');

const babelOptions = {
  sourceType: 'unambiguous',
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: '3.9',
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        // core-js polyfill handled by @babel/preset-env
        corejs: false,
        helpers: true,
        regenerator: true,
      },
    ],
  ],
};


module.exports = (_, argv) => {
  return {
    mode: argv.mode === 'development' ? 'development' : 'production',
    devtool: 'source-map',
    entry: {
      'okta-loginpage-render': './src/main.ts',
      ...(argv.mode === 'production' && { 'okta-loginpage-render-with-version': './src/main.ts' }),
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: ({ runtime }) => {
        // use versioned bundle for cache busting
        return runtime === 'okta-loginpage-render-with-version' ? `okta-loginpage-render-${pkg.version}.js` : 'okta-loginpage-render.js';
      },
      iife: true,
      library: {
        name: 'OktaLoginPageRender',
        type: 'window'
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          loader: 'babel-loader',
          options: babelOptions,
        },
        // load external source maps
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        },
      ],
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};
