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

import { WidgetProps } from '../../types';
import { getLanguageCode } from '../../util';

export const isCustomizedI18nKey = (i18nKey: string, widgetProps: WidgetProps): boolean => {
  const { i18n } = widgetProps;
  const widgetLanguageLowerCase = getLanguageCode(widgetProps).toLowerCase();

  if (typeof i18n === 'undefined' || i18n === null) {
    return false;
  }

  // Lower case the language codes when searching for i18n key so it is case insensitive
  // eslint-disable-next-line max-len
  return Object.entries(i18n).some(([customizedLangCode, customizedI18nKeys]) => customizedLangCode.toLowerCase() === widgetLanguageLowerCase
        && customizedI18nKeys[i18nKey] !== undefined);
};
