const { resolve } = require('path');

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
      'okta-loginpage-render': './src/main.ts'
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: '[name].js',
      iife: true,
      library: {
        name: 'OktaLoginPageRender',
        type: 'umd',
      }
    },
    module: {
      rules: [
        {
          test: require.resolve('@okta/loginpage/dist/js/initLoginPage.pack.js'),
          use: 'exports-loader?type=commonjs&exports=OktaLogin',
        },
        {
          test: require.resolve('@okta/loginpage/legacy/js/initLoginPage.pack.js'),
          use: 'exports-loader?type=commonjs&exports=OktaLogin',
        },
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
        '@okta/loginpage': resolve(__dirname, 'node_modules/@okta/loginpage/dist/js/initLoginPage.pack.js'),
        '@okta/loginpage-legacy': resolve(__dirname, 'node_modules/@okta/loginpage/legacy/js/initLoginPage.pack.js'),
        '@': resolve(__dirname, 'src')
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    ignoreWarnings: [/Failed to parse source map/],
  };
};
