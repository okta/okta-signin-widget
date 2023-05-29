const webpack = require('webpack');
const { resolve } = require('path');

module.exports = {
  entry: [
    './polyfill/entry.js',
    './src/index.ts'
  ],
  output: {
    library: {
      name: 'OktaSignIn',
      type: 'var',
    },
    filename: 'okta-sign-in.next.js',
    path: resolve(__dirname, '../..', 'dist/dist/js'),
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: function(filePath) {
          const filePathContains = (f) => filePath.indexOf(f) > 0;
          const npmRequiresTransform = [
            '/node_modules/parse-ms',
            '/node_modules/@sindresorhus/to-milliseconds',
            '/node_modules/@mui',
            '/node_modules/@okta/odyssey-react-mui',
            '/node_modules/@okta/odyssey-react-mui',
            '/node_modules/@okta/okta-auth-js',
            '/node_modules/p-cancelable',
          ].some(filePathContains);
          const shallBeExcluded = [
            '/node_modules/',
            'packages/@okta/qtip2',
          ].some(filePathContains);

          return shallBeExcluded && !npmRequiresTransform;
        },
        loader: 'babel-loader',
        options: {
          sourceType: 'unambiguous',
          presets: [
            [
              "@babel/preset-env",
              {
                targets: [
                  'defaults', 
                  'ie 11'
                ],
                useBuiltIns: "entry",
                corejs: "3.9"
              }
            ],
            "@babel/preset-react",
            '@babel/preset-typescript',
          ],
          plugins: [
            [
                "@babel/plugin-transform-react-jsx",
                {
                    "runtime": "automatic",
                    "importSource": "preact"
                },
            ],
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    alias: {
      '@okta/courage': resolve(__dirname, '../../packages/@okta/courage-dist'),
      '@okta/mocks': resolve(__dirname, '../../playground/mocks'),
      '@okta/okta-i18n-bundles': resolve(__dirname, '../util/Bundles.ts'),
      '@okta/qtip': resolve(__dirname, '../../packages/@okta/qtip2/dist/jquery.qtip.js'),
      config: resolve(__dirname, '../config'),
      nls: resolve(__dirname, '../../packages/@okta/i18n/src/json'),
      okta: resolve(__dirname, '../../packages/@okta/courage-dist'),
      src: resolve(__dirname, './src'), // FIXME use relative imports
      'util/BrowserFeatures': resolve(__dirname, '../util/BrowserFeatures'),
      'util/Bundles': resolve(__dirname, '../util/Bundles'),
      'util/Enums': resolve(__dirname, '../util/Enums'),
      'util/FactorUtil': resolve(__dirname, '../util/FactorUtil'),
      'util/Logger': resolve(__dirname, '../util/Logger'),
      'util/TimeUtil': resolve(__dirname, '../util/TimeUtil'),
      v1: resolve(__dirname, '../v1'),
      v2: resolve(__dirname, '../v2'),

      // duo_web_sdk: env.VITE_MOCK_DUO
      //   ? resolve(__dirname, 'src/__mocks__/duo_web_sdk') // mock
      //   : 'duo_web_sdk', // real

      // react -> preact alias
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      // SDK_VERSION: JSON.stringify(SDK_VERSION)
      OKTA_SIW_VERSION: '"0.0.0"',
      OKTA_SIW_COMMIT_HASH: '"local"',
      // DEBUG: env.VITE_DEBUG,
    })
  ],
  optimization: {
    minimize: false
  },
};