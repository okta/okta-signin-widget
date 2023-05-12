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
import {
  getDefaultCountryCode, getHelpLink, getLanguageCode, transformIdentifier,
} from './settingsUtils';

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

  it('should return "US" as the default country code value when org does not provide a value', () => {
    expect(getDefaultCountryCode(widgetProps)).toBe('US');
  });

  it('should return "US" as the default country code when org provided value is invalid', () => {
    widgetProps.defaultCountryCode = 'ABDC';

    expect(getDefaultCountryCode(widgetProps)).toBe('US');
  });

  it('should return org provided country code as the default value when code is valid', () => {
    widgetProps.defaultCountryCode = 'BW';

    expect(getDefaultCountryCode(widgetProps)).toBe('BW');
  });

  it('should not modify identifier if transform function is not defined', () => {
    const identifier = 'testuser@okta1.com';
    expect(transformIdentifier(widgetProps, 'identify', identifier)).toBe(identifier);
  });

  it('should modify identifier when transform function is defined', () => {
    widgetProps = {
      transformUsername: (username: string) => username.split('@')[0],
    };
    const identifier = 'testuser@okta1.com';
    expect(transformIdentifier(widgetProps, 'identify', identifier)).toBe('testuser');
  });

  it('should return default help link if custom one is not provided', () => {
    widgetProps = {
      baseUrl: 'https://okta1.com',
    };
    expect(getHelpLink(widgetProps)).toBe('https://okta1.com/help/login');
  });
});
