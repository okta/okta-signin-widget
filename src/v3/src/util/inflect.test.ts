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

import {
  capitalize,
  decapitalize,
  toCamelCase,
  toKebabCase,
  tokenize,
  toPascalCase,
  toSnakeCase,
  toTitleCase,
} from './inflect';

describe('inflect', () => {
  describe('decapitalize', () => {
    test('lowercase', () => expect(decapitalize('lowercase')).toBe('lowercase'));
    test('uppercase', () => expect(decapitalize('UPPERCASE')).toBe('uPPERCASE'));
    test('camelCase', () => expect(decapitalize('camelCase')).toBe('camelCase'));
    test('PascalCase', () => expect(decapitalize('PascalCase')).toBe('pascalCase'));
    test('kebab-case', () => expect(decapitalize('kebab-case')).toBe('kebab-case'));
    test('snake_case', () => expect(decapitalize('snake_case')).toBe('snake_case'));
    test('Title Case', () => expect(decapitalize('Title Case')).toBe('title Case'));
  });
  describe('capitalize', () => {
    test('lowercase', () => expect(capitalize('lowercase')).toBe('Lowercase'));
    test('uppercase', () => expect(capitalize('UPPERCASE')).toBe('UPPERCASE'));
    test('camelCase', () => expect(capitalize('camelCase')).toBe('CamelCase'));
    test('PascalCase', () => expect(capitalize('PascalCase')).toBe('PascalCase'));
    test('kebab-case', () => expect(capitalize('kebab-case')).toBe('Kebab-case'));
    test('snake_case', () => expect(capitalize('snake_case')).toBe('Snake_case'));
    test('Title Case', () => expect(capitalize('Title Case')).toBe('Title Case'));
  });
  describe('tokenize', () => {
    test('lowercase', () => expect(tokenize('lowercase')).toEqual(['lowercase']));
    test('UPPERCASE', () => expect(tokenize('UPPERCASE')).toEqual(['UPPERCASE']));
    test('camelCase', () => expect(tokenize('camelCase')).toEqual(['camel', 'Case']));
    test('PascalCase', () => expect(tokenize('PascalCase')).toEqual(['Pascal', 'Case']));
    test('kebab-case', () => expect(tokenize('kebab-case')).toEqual(['kebab', 'case']));
    test('snake_case', () => expect(tokenize('snake_case')).toEqual(['snake', 'case']));
    test('__dunder_case__', () => expect(tokenize('__dunder_case__')).toEqual(['dunder', 'case']));
    test('Sentence case', () => expect(tokenize('Sentence case')).toEqual(['Sentence', 'case']));
  });
  describe('toTitleCase', () => {
    test('lowercase', () => expect(toTitleCase('lowercase')).toEqual('Lowercase'));
    test('UPPERCASE', () => expect(toTitleCase('UPPERCASE')).toEqual('UPPERCASE'));
    test('camelCase', () => expect(toTitleCase('camelCase')).toEqual('Camel Case'));
    test('PascalCase', () => expect(toTitleCase('PascalCase')).toEqual('Pascal Case'));
    test('kebab-case', () => expect(toTitleCase('kebab-case')).toEqual('Kebab Case'));
    test('snake_case', () => expect(toTitleCase('snake_case')).toEqual('Snake Case'));
    test('__dunder_case__', () => expect(toTitleCase('__dunder_case__')).toEqual('Dunder Case'));
    test('Sentence case', () => expect(toTitleCase('Sentence case')).toEqual('Sentence Case'));
    test('Title Case', () => expect(toTitleCase('Title Case')).toEqual('Title Case'));
  });
  describe('toKebabCase', () => {
    test('lowercase', () => expect(toKebabCase('lowercase')).toBe('lowercase'));
    test('UPPERCASE', () => expect(toKebabCase('UPPERCASE')).toBe('uppercase'));
    test('camelCase', () => expect(toKebabCase('camelCase')).toBe('camel-case'));
    test('PascalCase', () => expect(toKebabCase('PascalCase')).toBe('pascal-case'));
    test('kebab-case', () => expect(toKebabCase('kebab-case')).toBe('kebab-case'));
    test('snake_case', () => expect(toKebabCase('snake_case')).toBe('snake-case'));
    test('__dunder_case__', () => expect(toKebabCase('__dunder_case__')).toBe('dunder-case'));
    test('Sentence case', () => expect(toKebabCase('Sentence case')).toBe('sentence-case'));
    test('Title Case', () => expect(toKebabCase('Title Case')).toBe('title-case'));
  });
  describe('toSnakeCase', () => {
    test('lowercase', () => expect(toSnakeCase('lowercase')).toBe('lowercase'));
    test('UPPERCASE', () => expect(toSnakeCase('UPPERCASE')).toBe('uppercase'));
    test('camelCase', () => expect(toSnakeCase('camelCase')).toBe('camel_case'));
    test('PascalCase', () => expect(toSnakeCase('PascalCase')).toBe('pascal_case'));
    test('kebab-case', () => expect(toSnakeCase('kebab-case')).toBe('kebab_case'));
    test('snake_case', () => expect(toSnakeCase('snake_case')).toBe('snake_case'));
    test('__dunder_case__', () => expect(toSnakeCase('__dunder_case__')).toBe('dunder_case'));
    test('Sentence case', () => expect(toSnakeCase('Sentence case')).toBe('sentence_case'));
    test('Title Case', () => expect(toSnakeCase('Title Case')).toBe('title_case'));
  });
  describe('toCamelCase', () => {
    test('lowercase', () => expect(toCamelCase('lowercase')).toBe('lowercase'));
    test('UPPERCASE', () => expect(toCamelCase('UPPERCASE')).toBe('uppercase'));
    test('camelCase', () => expect(toCamelCase('camelCase')).toBe('camelCase'));
    test('PascalCase', () => expect(toCamelCase('PascalCase')).toBe('pascalCase'));
    test('kebab-case', () => expect(toCamelCase('kebab-case')).toBe('kebabCase'));
    test('snake_case', () => expect(toCamelCase('snake_case')).toBe('snakeCase'));
    test('__dunder_case__', () => expect(toCamelCase('__dunder_case__')).toBe('dunderCase'));
    test('Sentence case', () => expect(toCamelCase('Sentence case')).toBe('sentenceCase'));
    test('Title Case', () => expect(toCamelCase('Title Case')).toBe('titleCase'));
  });

  describe('acronyms', () => {
    test('tokenize', () => expect(tokenize('HTMLInputElement')).toEqual(['HTML', 'Input', 'Element']));
    test('toTitleCase', () => expect(toTitleCase('HTMLInputElement')).toBe('HTML Input Element'));
    test('toKebabCase', () => expect(toKebabCase('HTMLInputElement')).toBe('html-input-element'));
    test('toSnakeCase', () => expect(toSnakeCase('HTMLInputElement')).toBe('html_input_element'));
    test('toCamelCase', () => expect(toCamelCase('HTMLInputElement')).toBe('htmlInputElement'));
    test('toPascalCase', () => expect(toPascalCase('HTMLInputElement')).toBe('HtmlInputElement'));
  });
});
