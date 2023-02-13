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

const rtlLanguageCodes = new Set([
  'ar', // Arabic
  'arc', // Aramaic
  'arz', // Egyptian Arabic
  'ckb', // Kurdish (Sorani)
  'dv', // Divehi
  'fa', // Persian
  'ha', // Hausa
  'he', // Hebrew
  'khw', // Khowar
  'ks', // Kashmiri
  'ps', // Pashto
  'sd', // Sindhi
  'ur', // Urdu
  'uz', // Uzbeki Afghanistan
  'yi', // Yiddish
]);

// ltr is default so mark as undefined when ltr
type LanguageDirection = 'rtl' | undefined;

export const getLanguageDirection = (
  languageCode: string,
): LanguageDirection => (rtlLanguageCodes.has(languageCode) ? 'rtl' : undefined);