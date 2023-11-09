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

import { makeAriaLabel } from './makeAriaLabel';

describe('makeAriaLabel', () => {
  const tests: [string, string, string | undefined][] = [
    [
      'adds period if string ends with a letter',
      'Activation link has expired',
      'Activation link has expired.'
    ],
    [
      'adds period if string ends with a digit',
      'Update to iOS 16',
      'Update to iOS 16.'
    ],
    [
      'adds period if string ends with "',
      'On Okta Verify, click "Set up"',
      'On Okta Verify, click "Set up".'
    ],
    [
      'keeps string as-is if it ends with .',
      'Operation cancelled by user.',
      undefined
    ],
    [
      'keeps string as-is if it ends with !',
      'SMS sent!',
      undefined
    ],
    [
      'keeps string as-is if it ends with ?',
      'Don\’t have Okta Verify?',
      undefined
    ],
    [
      'keeps string as-is if it ends with ,',
      'Unable to sign in,',
      undefined
    ],
    [
      'keeps string as-is if it ends with )',
      'At least 4 number(s)',
      undefined
    ],
    [
      'keeps string as-is if it ends with :',
      'Password requirements were not met:',
      undefined
    ],
    [
      'keeps string as-is if it ends with ;',
      'Password requirements were not met;',
      undefined
    ],
    [
      'keeps string as-is if it ends with -',
      'Unsupported browser -',
      undefined
    ],
    [
      'adds period if string has trailing whitespaces and trimmed string ends with non-punctuation char',
      'Activation link has expired ',
      'Activation link has expired.'
    ],
    [
      'keeps string as-is if it has trailing whitespaces and trimmed string ends with punctuation',
      'We sent you a verification email. ',
      undefined
    ],
    [
      'supports Unicode punctuation chars',
      '请求无法完成。',
      undefined
    ]
  ];

  tests.forEach(([testName, from, to]) => {
    test(testName, () => expect(makeAriaLabel(from)).toBe(to));
  });
});
