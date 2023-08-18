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

export const chop = (str: string, n = 1): [string, string] => {
  const first = str.slice(0, n);
  const rest = str.slice(n);
  return [first, rest];
};

export const tokenize = (str: string): string[] => (
  str.split(/\W+/g)
    .filter(Boolean)
    .map((token) => {
      // eslint-disable-next-line no-nested-ternary
      const matches = /(^[A-Z]+$)/.test(token)
        ? [token]
        : (/([A-Z]{2,})/.test(token)
          ? token.match(/([A-Z]{2,}(?=[A-Z]))|([A-Z][a-z]*)|(\d+)/g)
          : token.match(/([A-Z]*[a-z]*)|(\d+)/g));
      return matches
        ?.flat()
        ?.filter(Boolean) ?? [];
    })
    .flat()
);

export const capitalize = (str: string): string => {
  const [first, rest] = chop(str);
  return `${first.toLocaleUpperCase()}${rest}`;
};

export const decapitalize = (str: string): string => {
  const [first, rest] = chop(str);
  return `${first.toLocaleLowerCase()}${rest}`;
};

export const toTitleCase = (str: string): string => tokenize(str)
  .map(capitalize)
  .join(' ');

export const toKebabCase = (str: string): string => tokenize(str)
  .map(capitalize)
  .map((token) => token.toLocaleLowerCase())
  .join('-');

export const toSnakeCase = (str: string): string => tokenize(str)
  .map((token) => token.toLocaleLowerCase())
  .join('_');

export const toPascalCase = (str: string): string => tokenize(str)
  .map((s) => s.toLocaleLowerCase())
  .map(capitalize)
  .join('');

export const toCamelCase = (str: string): string => decapitalize(toPascalCase(str));
