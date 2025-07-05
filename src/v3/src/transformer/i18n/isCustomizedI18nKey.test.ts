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

import { WidgetProps } from 'src/types';

import { getLanguageCode } from '../../util';
import { isCustomizedI18nKey } from './isCustomizedI18nKey';

jest.mock('../../util', () => {
  const originalModule = jest.requireActual('../../util');
  return {
    ...originalModule,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    getLanguageCode: jest.fn(),
  };
});

describe('isCustomizedI18nKey', () => {
  const usernameHint = 'test username hint';
  let widgetProps: WidgetProps;

  beforeEach(() => {
    jest.clearAllMocks();
    (getLanguageCode as jest.Mock).mockImplementation(() => 'en');
    widgetProps = {};
  });

  it('should return true when key is present for language', () => {
    widgetProps = {
      i18n: {
        en: {
          'primaryauth.username.tooltip': usernameHint,
        },
      },
    };

    expect(isCustomizedI18nKey('primaryauth.username.tooltip', widgetProps)).toEqual(true);
  });

  it('should return false when there are no languages with custom i18n keys', () => {
    widgetProps = {
      i18n: {},
    };

    expect(isCustomizedI18nKey('primaryauth.username.tooltip', widgetProps)).toEqual(false);
  });

  it('should return false when key is only present in different language', () => {
    widgetProps = {
      i18n: {
        fr: {
          'primaryauth.username.tooltip': usernameHint,
        },
      },
    };

    expect(isCustomizedI18nKey('primaryauth.username.tooltip', widgetProps)).toEqual(false);
  });

  it('should return true when key is present in language with country code', () => {
    (getLanguageCode as jest.Mock).mockImplementation(() => 'pt-BR');
    widgetProps = {
      i18n: {
        'pt-BR': {
          'primaryauth.username.tooltip': usernameHint,
        },
      },
    };

    expect(isCustomizedI18nKey('primaryauth.username.tooltip', widgetProps)).toEqual(true);
  });

  it('should return true when language has lower case country code', () => {
    (getLanguageCode as jest.Mock).mockImplementation(() => 'pt-BR');
    widgetProps = {
      i18n: {
        'pt-br': {
          'primaryauth.username.tooltip': usernameHint,
        },
      },
    };

    expect(isCustomizedI18nKey('primaryauth.username.tooltip', widgetProps)).toEqual(true);
  });
});
