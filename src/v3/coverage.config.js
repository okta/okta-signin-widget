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

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest['coverageThreshold']} */
module.exports = {
  global: {
    statements: 70,
    branches: 10,
    functions: 60,
    lines: 70,
  },
  './src/OktaSignIn/': {
    statements: 0,
    branches: 0,
    functions: 0,
    lines: 0,
  },
  './src/components/': {
    statements: 85,
    branches: 65,
    functions: 80,
    lines: 85,
  },
  './src/hooks/': {
    statements: 90,
    branches: 70,
    functions: 85,
    lines: 90,
  },
  // Strictly enforce coverage thresholds for transformers
  './src/transformer/': {
    statements: 94,
    branches: 82,
    functions: 92,
    lines: 94,
  },
  './src/util/': {
    statements: 85,
    branches: 75,
    functions: 80,
    lines: 85,
  },
};
