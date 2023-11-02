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

// eslint-disable-next-line import/no-extraneous-dependencies
import { loc as localize } from '../../../util/loc';
import { TokenReplacement } from '../types';

/**
 *
 * @param key - i18n key used for the translation
 * @param bundleName - Translation bundle to read properties from
 * @param params - parameters used to interpolate tokens in the string
 * @param {TokenReplacement} tokenReplacement - Record that enables
 * you to find and replace tokens embedded in the string.
 * @returns translated string in the current language code
 */
export const loc = (
  key: string,
  bundleName?: string,
  params?: Array<string | number | boolean | unknown>,
  tokenReplacement?: TokenReplacement,
): string => {
  const localizedText: string = localize(key, bundleName, params);

  if (typeof tokenReplacement !== 'undefined') {
    let updatedText = localizedText;
    Object.entries(tokenReplacement).forEach(([searchValue, replaceObj]) => {
      const searchRgx = new RegExp(`(<\\${searchValue}>)(.*)(</\\${searchValue}>)`);
      const props: string | undefined = replaceObj?.attributes
        && Object.entries(replaceObj.attributes)
          .map(([attrKey, attrVal]) => `${attrKey}="${attrVal}"`)
          .join(' ');
      const openTag = `<${replaceObj?.element}${(
        typeof props !== 'undefined' ? ` ${props}` : ''
      )}>`;
      const closeTag = `</${replaceObj?.element}>`;
      updatedText = updatedText.replace(searchRgx, `${openTag}$2${closeTag}`);
    });
    return updatedText;
  }

  return localizedText;
};
