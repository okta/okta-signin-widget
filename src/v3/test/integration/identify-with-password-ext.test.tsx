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

import { setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/introspect/default.json';
import { WidgetOptions } from '../../../types';

describe('identify-with-password-extended', () => {
  it('should display Identifier & Password hint labels for language with lower case country code', async () => {
    const usernameHint = 'This is your username';
    const passwordHint = 'This is your password';
    const hintOverrides: WidgetOptions['i18n'] = {
      'pt-br': {
        'primaryauth.username.tooltip': usernameHint,
        'primaryauth.password.tooltip': passwordHint,
      },
    };
    const {
      findByLabelText, findByText,
    } = await setup({
      mockResponse,
      widgetOptions: {
        i18n: hintOverrides,
        language: 'pt-br',
      },
    });

    await findByText('Sign in', { selector: 'button' });
    const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
    const passwordEl = await findByLabelText('Password') as HTMLInputElement;

    expect(usernameEl).toHaveAccessibleDescription(usernameHint);
    expect(passwordEl).toHaveAccessibleDescription(passwordHint);
  });

  it('should display Identifier & Password hint labels for language with upper case country code', async () => {
    const usernameHint = 'This is your username';
    const passwordHint = 'This is your password';
    const hintOverrides: WidgetOptions['i18n'] = {
      'pt-BR': {
        'primaryauth.username.tooltip': usernameHint,
        'primaryauth.password.tooltip': passwordHint,
      },
    };
    const {
      findByLabelText, findByText,
    } = await setup({
      mockResponse,
      widgetOptions: {
        i18n: hintOverrides,
        language: 'pt-BR',
      },
    });

    await findByText('Sign in', { selector: 'button' });
    const usernameEl = await findByLabelText(/Username/) as HTMLInputElement;
    const passwordEl = await findByLabelText('Password') as HTMLInputElement;

    expect(usernameEl).toHaveAccessibleDescription(usernameHint);
    expect(passwordEl).toHaveAccessibleDescription(passwordHint);
  });
});
