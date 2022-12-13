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

import { WidgetProps } from '../types';
import { getLanguageCode } from './settingsUtils';

jest.mock('../../../util/BrowserFeatures', () => ({
  getUserLanguages: jest.fn().mockReturnValue(['en', 'en-US']),
}));

jest.mock('../../../config/config.json', () => ({
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ok-PL', 'es', 'ko', 'ja', 'nl', 'pt'],
}));

describe('Settings Utils Tests', () => {
  let widgetProps: WidgetProps = {};

  beforeEach(() => {
    widgetProps = { language: 'en' };
  });

  it('should return requested language even if it is not a supported language', () => {
    widgetProps.language = 'foobar';

    expect(getLanguageCode(widgetProps)).toBe('foobar');
  });

  it('should return requested language code when other supported languages are available', () => {
    widgetProps.language = 'ok-PL';

    expect(getLanguageCode(widgetProps)).toBe('ok-PL');
  });

  it('should return requested language code when other language prop is provided as a function', () => {
    widgetProps.language = () => ('es');

    expect(getLanguageCode(widgetProps)).toBe('es');
  });
});
