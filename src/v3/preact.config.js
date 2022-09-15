/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable import/no-extraneous-dependencies,no-param-reassign */
import { resolve } from 'path';
import { DefinePlugin } from 'webpack';
import { merge as webpackMerge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { omit } from 'lodash';
import GitRevisionPlugin from 'git-revision-webpack-plugin';
import playgroundConfig from '../../webpack.playground.config';
import { version } from './package.json';

const gitRevisionPlugin = new GitRevisionPlugin();

// util: resolve paths relative to the project root
const rootResolve = (...parts) => resolve(__dirname, '../../', ...parts);

// util: merges CSP statements
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
const mergeContentSecurityPolicies = (...policies) => {
  const toMap = (map, str) => (
    str.split(/;\W*/)
      .map((list) => list.split(/[ ]+/))
      .reduce((m, [k, ...vals]) => {
        m[k] = m[k] ? m[k].concat(vals) : vals;
        return m;
      }, map)
  );
  return Object.entries(policies.reduce(toMap, {}))
    .map(([dir, vals]) => `${dir} ${[...new Set(vals)].join(' ')}`)
    .join('; ');
};

export default {
  webpack(config, env) {
    config.output.libraryTarget = 'umd';
    config.output.filename = ({ chunk }) => (
      chunk.name === 'bundle' ? 'okta-sign-in.next.js' : '[name].next.js'
    );

    config.node = {
      fs: 'empty',
    };

    // remove MiniCssExtractPlugin
    config.plugins = config.plugins.filter(
      (plugin) => !(plugin instanceof MiniCssExtractPlugin),
    );

    config.plugins.push(new DefinePlugin({
      // for OktaSignIn.__version, AuthContainer[data-version]
      VERSION: JSON.stringify(`okta-signin-widget-${version}`),
      // for OktaSignIn.__commit, AuthContainer[data-commit]
      COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
      // for v2/util/Logger file
      DEBUG: env !== 'production',
    }));

    // use odyssey babel configs
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: [{
        loader: '@okta/odyssey-babel-loader',
      }],
    });

    config.module.rules = config.module.rules.map((rule) => {
      // Excludes SVG from file loader rule
      if (rule.test && rule.test.test('.svg')) {
        rule.exclude = /\.svg$/;
      }

      // TODO OKTA-515335 remove ts-loader
      if (rule.loader === 'babel-loader') {
        const use = [
          {
            loader: 'babel-loader',
            options: rule.options,
          },
          {
            loader: 'ts-loader',
          },
        ];
        return {
          ...rule,
          loader: undefined,
          options: undefined,
          use,
        };
      }
      // exclude svg from url-loader
      // preact-svg-loader is used for svg
      if (rule.loader && rule.loader.includes('url-loader')) {
        rule.test = /\\.(woff2?|ttf|eot|jpe?g|png|webp|gif|mp4|mov|ogg|webm)(\\?.*)?$/i;
      }
      if (rule.use) {
        return {
          ...rule,
          use: rule.use.reduce((acc, loader) => {
            acc.push(
              loader !== MiniCssExtractPlugin.loader ? loader : 'style-loader',
            );
            return acc;
          }, []),
        };
      }

      return rule;
    });

    config.module.rules.push({
      test: /\.svg$/,
      enforce: 'pre',
      use: [
        {
          loader: 'preact-svg-loader',
          options: {
            mangleIds: false,
          },
        },
      ],
    });

    // Use any `index` file, not just index.js
    config.resolve.alias['preact-cli-entrypoint'] = resolve(
      __dirname,
      'src',
      'index',
    );

    // TODO: integrate with rollup bundling system once migrate to the widget
    // repo preact-cli still stays with webpack v4, which seems to have issue to
    // understand `exports` field correctly in auth-js' subdeps using ESM bundle
    // of auth-js is required to enable tree-shaking
    // https://github.com/preactjs/preact-cli/issues/1579
    // point to @okta/okta-auth-js in /v3/node_modules
    config.resolve.alias['@okta/okta-auth-js'] = resolve(
      __dirname,
      'node_modules',
      '@okta/okta-auth-js',
      'esm',
      'browser',
      'index.js',
    );

    // broadcast-channel esnode bundle is loaded by default, browser one should
    // be used
    config.resolve.alias['broadcast-channel'] = rootResolve(
      'node_modules',
      'broadcast-channel',
      'dist',
      'esbrowser',
      'index.js',
    );

    config.resolve.alias.genpass = rootResolve(
      'node_modules',
      'genpass',
      'src',
      'index.js',
    );

    config.resolve.alias.nls = rootResolve('packages', '@okta/i18n/src/json');
    config.resolve.alias.qtip = rootResolve('packages', '@okta/qtip2/dist/jquery.qtip.js');
    config.resolve.alias['okta-i18n-bundles'] = rootResolve('src', 'util', 'Bundles');
    config.resolve.alias['util/Logger'] = rootResolve('src', 'util', 'Logger');
    config.resolve.alias['util/Bundles'] = rootResolve('src', 'util', 'Bundles');
    config.resolve.alias['util/Enums'] = rootResolve('src', 'util', 'Enums');
    config.resolve.alias['util/FactorUtil'] = rootResolve('src', 'util', 'FactorUtil');
    config.resolve.alias['util/TimeUtil'] = rootResolve('src', 'util', 'TimeUtil');
    config.resolve.alias['util/BrowserFeatures'] = rootResolve('src', 'util', 'BrowserFeatures');
    config.resolve.alias['config/config.json'] = rootResolve('src', 'config', 'config.json');

    // inherit from webpack.playground.config.js omitting these properties
    const inherited = omit(playgroundConfig, [
      'devServer.headers.Content-Security-Policy', // merge instead of override
      'devServer.port',
      'entry',
      'module',
      'output',
      'resolve.extensions',
    ]);

    // TODO OKTA-516685 use build assets instead of webpack-dev-server
    const overrides = {
      entry: {
        playground: rootResolve('playground', 'main.ts'),
      },
      devtool: 'cheap-module-source-map',

      devServer: {
        headers: {
          'Content-Security-Policy': mergeContentSecurityPolicies(
            "object-src 'self'; script-src 'self' 'unsafe-eval'",
            playgroundConfig.devServer.headers['Content-Security-Policy'] || '',
          ),
        },
      },
    };

    // NOTE do not reassign config. preact cli requires this object to modified
    Object.assign(config, webpackMerge(config, inherited, overrides));
  },
};
