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

import * as OrigLanguageUtils from './languageUtils';
import type { loc as origLoc } from './locUtil';

jest.unmock('./locUtil');

let loc: typeof origLoc;
let languageUtils: typeof OrigLanguageUtils;

describe('locUtil Tests', () => {
  describe('Token replacement', () => {
    const MockedBundle: Record<string, string> = {
      'some.basic.key': 'This is a key without params',
      'some.key.with.$1.token': 'This is a key with a token <$1>This is some text</$1>',
      'some.key.with.plain.html': 'This is a key with a token <span class="strong">This is some text</span>',
      'some.key.with.multiple.tokens': 'This is some test string with multiple tokens: <$1> <$2> here is a test string </$2> </$1>',
    };

    beforeEach(() => {
      jest.resetModules();
      jest.unmock('util/Bundles');
      jest.mock('./i18next', () => ({
        i18next: {
          t: jest.fn().mockImplementation(
            (origKey, params) => {
              const bundleAndKey = origKey.split(':');
              let bundle;
              let key = origKey;
              if (bundleAndKey.length === 2) {
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                ([bundle, key] = bundleAndKey);
                if (bundle === 'login' && MockedBundle[key]) {
                  return MockedBundle[key].replace('{0}', params?.[0]);
                }
              }
              return '';
            },
          ),
        },
      }));

      loc = jest.requireActual('./locUtil').loc;
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

  // https://www.i18next.com/translation-function/plurals
  describe('Pluralization', () => {
    const MockedLogin: Record<string, Record<string, string>> = {
      en: {
        item_one: 'one item',
        item_other: '{0} items',
        apple_one: 'one apple',
        apple_other: '{0} apples',
        pear_one: 'one pear',
        pear_other: '{0} pears',
      },
      ro: {
        item_one: 'un articol',
        item_few: '{0} articole',
        item_other: '{0} de articole',
        // 'apple_one': 'un măr', // missing translation
        apple_few: '{0} mere',
        apple_other: '{0} de mere',
        apple: '{0} de mere', // will be used as fallback
        pear_few: '{0} pere', // no fallback
      },
    };

    beforeEach(() => {
      jest.resetModules();
      jest.unmock('./i18next');
      jest.mock('util/Bundles', () => {
        const Bundles: {
          currentLanguage: string | undefined,
          login: Record<string, string>,
          country: Record<string, string>,
          loadLanguage: () => Promise<void>,
        } = {
          currentLanguage: undefined,
          login: MockedLogin.en,
          country: {},
          loadLanguage: jest.fn().mockImplementation(
            async (language: string) => {
              Bundles.currentLanguage = language;
              Bundles.login = MockedLogin[language] ?? {};
              Bundles.country = {};
            },
          ),
        };
        return Bundles;
      });

      languageUtils = jest.requireActual('./languageUtils');
      loc = jest.requireActual('./locUtil').loc;
    });

    it('can localize singular/plural in English', () => {
      languageUtils.initDefaultLanguage();
      const localizedTextOne = loc('item', 'login', [1]);
      expect(localizedTextOne).toBe('one item'); // item_one
      const localizedTextTwo = loc('item', 'login', [2]);
      expect(localizedTextTwo).toBe('2 items'); // item_other
    });

    it('can localize multiple plurals in other languages', async () => {
      languageUtils.initDefaultLanguage();
      await languageUtils.loadLanguage({ language: 'ro' });
      const localizedText1 = loc('item', 'login', [1]);
      expect(localizedText1).toBe('un articol'); // item_one
      const localizedText2 = loc('item', 'login', [2]);
      expect(localizedText2).toBe('2 articole'); // item_few
      const localizedText20 = loc('item', 'login', [20]);
      expect(localizedText20).toBe('20 de articole'); // item_other
    });

    it('can fallback to default form if some plural form translation is missing', async () => {
      languageUtils.initDefaultLanguage();
      await languageUtils.loadLanguage({ language: 'ro' });
      const localizedText2 = loc('apple', 'login', [2]);
      expect(localizedText2).toBe('2 mere'); // apple_few
      // no 'apple_one' => fallback to 'apple'
      const localizedText1 = loc('apple', 'login', [1]);
      expect(localizedText1).toBe('1 de mere'); // apple
    });

    it('will fallback to English if some plural form translation is missing and there is no fallback', async () => {
      languageUtils.initDefaultLanguage();
      await languageUtils.loadLanguage({ language: 'ro' });
      const localizedText2 = loc('pear', 'login', [2]);
      expect(localizedText2).toBe('2 pere'); // pear_few
      // no 'pear_one', no fallback to 'pear' => fallback to English 'pear_one'
      const localizedText1 = loc('pear', 'login', [1]);
      expect(localizedText1).toBe('one pear');
    });

    it('emits error event if requested key is missing in bundle', () => {
      // spy on emitting of CustomEvent with type 'okta-i18n-error' in `loc()` util
      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');
      languageUtils.initDefaultLanguage();
      const localizedText2 = loc('missing_key', 'login');
      expect(localizedText2).toBe('L10N_ERROR[missing_key]');
      expect(dispatchEventSpy).toHaveBeenCalledWith(new CustomEvent('okta-i18n-error', {
        detail: {
          type: 'l10n-error',
          key: 'missing_key',
          bundleName: 'login',
          reason: 'key',
        },
      }));
    });
  });
});
