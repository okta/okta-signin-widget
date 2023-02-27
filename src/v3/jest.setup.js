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

/* eslint-disable import/extensions */
import 'jest-canvas-mock';
import { toHaveBeenCalledBefore } from 'jest-extended';
import mockBundles from '../util/Bundles.ts';

expect.extend({ toHaveBeenCalledBefore });

require('@testing-library/jest-dom');
require('whatwg-fetch');
const { createSerializer } = require('@emotion/jest');
const { configure } = require('@testing-library/preact');

configure({
  testIdAttribute: 'data-se',
});

global.VERSION = '0.0.0';
global.COMMITHASH = 'b9bbc0140703c3fbf0e2e58920362e70'; // "echo jest | md5"
global.DEBUG = false;

expect.addSnapshotSerializer(createSerializer({ includeStyles: false }));

jest.mock('okta', () => {
  return {
    ...jest.requireActual('okta'),
    loc: jest.fn().mockImplementation(
      // eslint-disable-next-line no-unused-vars
      (key, bundle, params) => (mockBundles.login[key] ? key : new Error(`Invalid i18n key: ${key}`)),
    ),
  };
});