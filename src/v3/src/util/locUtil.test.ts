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

import { loc } from './locUtil';

describe('locUtil Tests', () => {
  const MockedBundle: Record<string, string> = {
    'some.basic.key': 'This is a key without params',
    'some.key.with.$1.token': 'This is a key with a token <$1>This is some text</$1>',
    'some.key.with.plain.html': 'This is a key with a token <span class="strong">This is some text</span>',
    'some.key.with.multiple.tokens': 'This is some test string with multiple tokens: <$1> <$2> here is a test string </$2> </$1>',
  };

  beforeEach(() => {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const mockedLoc = require('util/loc');
    mockedLoc.loc = jest.fn().mockImplementation(
      // eslint-disable-next-line no-unused-vars
      (key, _, params) => MockedBundle[key].replace('{0}', params?.[0]),
    );
  });

  it('should return simple translated string', () => {
    const localizedText = loc('some.basic.key', 'login');
    expect(localizedText).toBe('This is a key without params');
  });

  it('should not perform replacement when tokens are not found in the string', () => {
    const localizedText = loc('some.key.with.plain.html', 'login', undefined, { $1: { element: 'span' } });
    expect(localizedText).toBe('This is a key with a token <span class="strong">This is some text</span>');
  });

  it('should perform replacement when tokens are found in the string', () => {
    const localizedText = loc('some.key.with.$1.token', 'login', undefined, { $1: { element: 'span' } });
    expect(localizedText).toBe('This is a key with a token <span>This is some text</span>');
  });

  it('should perform replacement with provided attributes when tokens are found in the string', () => {
    const localizedText = loc('some.key.with.$1.token', 'login', undefined, { $1: { element: 'span', attributes: { class: 'strong' } } });
    expect(localizedText).toBe('This is a key with a token <span class="strong">This is some text</span>');
  });

  it('should perform replacement when translation string contains multiple tokens', () => {
    const localizedText = loc(
      'some.key.with.multiple.tokens',
      'login',
      undefined,
      {
        $1: { element: 'a', attributes: { href: '#' } },
        $2: { element: 'span', attributes: { class: 'strong' } },
      },
    );
    expect(localizedText).toBe('This is some test string with multiple tokens: <a href="#"> <span class="strong"> here is a test string </span> </a>');
  });
});
