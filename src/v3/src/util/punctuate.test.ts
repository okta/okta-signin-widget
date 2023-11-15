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

import { punctuate } from './punctuate';

describe('punctuate', () => {
  const tests: [string, string, string | undefined][] = [
    [
      'adds period if string ends with a letter',
      'Activation link has expired',
      'Activation link has expired.',
    ],
    [
      'adds period if string ends with a digit',
      'Update to iOS 16',
      'Update to iOS 16.',
    ],
    [
      'adds period if string ends with "',
      'On Okta Verify, click "Set up"',
      'On Okta Verify, click "Set up".',
    ],
    [
      'keeps string as-is if it ends with .',
      'Operation cancelled by user.',
      'Operation cancelled by user.',
    ],
    [
      'keeps string as-is if it ends with !',
      'SMS sent!',
      'SMS sent!',
    ],
    [
      'keeps string as-is if it ends with ?',
      'Don\’t have Okta Verify?',
      'Don\’t have Okta Verify?',
    ],
    [
      'keeps string as-is if it ends with ,',
      'Unable to sign in,',
      'Unable to sign in,',
    ],
    [
      'keeps string as-is if it ends with )',
      'At least 4 number(s)',
      'At least 4 number(s)',
    ],
    [
      'keeps string as-is if it ends with :',
      'Password requirements were not met:',
      'Password requirements were not met:',
    ],
    [
      'keeps string as-is if it ends with ;',
      'Password requirements were not met;',
      'Password requirements were not met;',
    ],
    [
      'keeps string as-is if it ends with -',
      'Unsupported browser -',
      'Unsupported browser -',
    ],
    [
      'adds period if string has trailing whitespaces and trimmed string ends with non-punctuation char',
      'Activation link has expired ',
      'Activation link has expired.',
    ],
    [
      'keeps string as-is if it has trailing whitespaces and trimmed string ends with punctuation',
      'We sent you a verification email. ',
      'We sent you a verification email. ',
    ],
    [
      'keeps string as-is if it ends with Chinese full stop',
      '请求无法完成。',
      '请求无法完成。',
    ],
    [
      'adds period to Chinese string if it ends with non-punctuation char',
      '请求无法完成',
      '请求无法完成.',
    ],
  ];

  tests.forEach(([testName, from, to]) => {
    // eslint-disable-next-line jest/valid-title
    test(testName, () => expect(punctuate(from)).toBe(to));
  });
});
