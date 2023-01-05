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

import Bundles from '../../../util/Bundles';
import { WidgetProps } from '../types';
import { getLanguageCode, getSupportedLanguages } from './settingsUtils';

export const loadLanguage = async (widgetProps: WidgetProps): Promise<void> => {
  const { i18n = {}, assets: { baseUrl, rewrite } = {} } = widgetProps;
  const languageCode = getLanguageCode(widgetProps);
  const supportedLanguages = getSupportedLanguages(widgetProps);

  return Bundles.loadLanguage(languageCode, i18n, {
    baseUrl: baseUrl ?? '/',
    rewrite: rewrite ?? ((val) => val),
  }, supportedLanguages);
};
