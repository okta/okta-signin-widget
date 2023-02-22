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
import { loc as localize } from 'okta';

type TargetToken = '<$1>' | '</$1>';

export const loc = (
  key: string,
  bundleName?: string,
  params?: Array<string | number | boolean | unknown>,
  replacementTokens?: Record<TargetToken, string>,
): string => {
  const localizedText: string = localize(key, bundleName, params);

  if (typeof replacementTokens !== 'undefined') {
    let updatedText = localizedText;
    Object.entries(replacementTokens).forEach(([token, replacement]) => {
      updatedText = updatedText.replace(token, replacement);
    });
    return updatedText;
  }

  return localizedText;
};
