const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { resolve, join } = require('path');
const { readFileSync } = require('fs');
const { getEnv, getResolveAlias } = require('./buildUtils');
const terserOptions = require('../../scripts/buildtools/terser/config');

const getOutputPath = mode => {
  if (mode === 'development') {
    return resolve(__dirname, 'playground/js');
  }
  return resolve(__dirname, '../..', 'dist/dist/js');
}

module.exports = (_, argv) => {
  const mode = argv.mode || 'production';
  const env = getEnv(mode);

  const config = {
    entry: [
      './polyfill/entry.js',
      './src/cdn.ts'
    ],
    output: {
      filename: 'okta-sign-in.next.js',
      path: getOutputPath(mode),
    },
    mode,
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: function(filePath) {
            const filePathContains = (f) => filePath.indexOf(f) > 0;
            const npmRequiresTransform = [
              '/node_modules/parse-ms',
              '/node_modules/@sindresorhus/to-milliseconds',
              '/node_modules/@okta/odyssey-react-mui',
              '/node_modules/@mui',
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
                  // TODO: resolve issue with authjs esm bundle, then switch to "usage" to reduce polyfill size
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
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true,
              },
            },
            'postcss-loader',
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
        ...getResolveAlias(mode),
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        OKTA_SIW_VERSION: '"0.0.0"',
        OKTA_SIW_COMMIT_HASH: '"local"',
        DEBUG: env.VITE_DEBUG,
      })
    ],
  };

  if (mode === 'production') {
    // add optimization config
    config.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions,
          extractComments: {
            // `banner` config option is intended for a message pointing to file containing license info
            // we use it to place single Okta license banner
            banner: readFileSync(join(__dirname, '../widget/copyright.txt'), 'utf8')
          }
        })
      ],
    };

    // generate bundle analyse file
    config.plugins.push(new BundleAnalyzerPlugin({
      openAnalyzer: false,
      reportFilename: 'okta-sign-in.analyzer.next.html',
      analyzerMode: 'static',
      defaultSizes: 'stat'
    }));
  }

  return config;
};