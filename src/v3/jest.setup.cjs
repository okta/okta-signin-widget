/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable import/extensions */
import 'jest-canvas-mock';
import { toHaveBeenCalledBefore } from 'jest-extended';

expect.extend({ toHaveBeenCalledBefore });

require('@testing-library/jest-dom');
require('whatwg-fetch');
const { createSerializer } = require('@emotion/jest');
const { configure } = require('@testing-library/preact');

configure({
  testIdAttribute: 'data-se',
});

global.OKTA_SIW_VERSION = '0.0.0';
global.OKTA_SIW_COMMIT_HASH = 'b9bbc0140703c3fbf0e2e58920362e70'; // "echo jest | md5"
global.DEBUG = false;

expect.addSnapshotSerializer(createSerializer({ includeStyles: false }));
