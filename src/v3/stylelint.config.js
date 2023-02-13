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

module.exports = {
  plugins: [
    'stylelint-use-logical-spec',
  ],
  rules: {
    'liberty/use-logical-spec': 'always',
  },
  overrides: [
    {
      files: ['**/*.css'],
    },
    // NOTE: There is an issue with stylelint preventing it from processing TSX files
    // see: https://github.com/stylelint/postcss-css-in-js/issues/300
    // {
    //   files: ['**/*.tsx'],
    //   customSyntax: 'postcss-jsx',
    // },
  ],
};