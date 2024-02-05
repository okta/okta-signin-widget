/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

const FailOnBuildFailPlugin = function() {};

FailOnBuildFailPlugin.prototype.apply = function(compiler) {
  compiler.hooks.done.tap('Fail on build', (stats) => {

    // webpack 5.x and karma-webpack combo will fail to treat some missing assets as build failures
    // See https://oktainc.atlassian.net/browse/OKTA-253137
    if( stats.warnings.length || stats.errors.length ) {
      [
        ...stats.warnings,
        ...stats.errors,
      ].forEach(function( warning ) { console.error( warning ); });
      console.error('failOnBuildFail plugin Forcibly killing build because of webpack compile failure');
      throw new Error('Plugin failOnBuildFail forcing build abort');
    }
  });
};

module.exports = FailOnBuildFailPlugin;