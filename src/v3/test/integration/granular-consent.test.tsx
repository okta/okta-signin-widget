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

import { createAuthJsPayloadArgs, setup } from './util';

import mockResponse from '../../../../playground/mocks/data/idp/idx/consent-granular.json';

describe('granular-consent', () => {
  it('should render form with logo', async () => {
    const granularConsentResponseWithLogo = {
      ...mockResponse,
      app: {
        ...mockResponse.app,
        value: {
          ...mockResponse.app.value,
          logo: { ...mockResponse.app.value.logo, href: 'http://okta1.com/logo.png' },
        },
      },
    };
    const {
      container, findByRole, findByLabelText, queryByAltText,
    } = await setup({
      mockResponse: granularConsentResponseWithLogo,
    });
    const appNameHeading = await findByRole('heading', { level: 1 });
    const logo = queryByAltText('Logo for the app');

    expect(logo).toBeDefined();
    expect(appNameHeading.textContent).toBe('Native client');
    // Wait for Spinner to appear
    await findByLabelText('Processing...');
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload when consent is given', async () => {
    const { authClient, user, findByText } = await setup({ mockResponse });

    const checkCustom2 = await findByText('View your internet search history.');
    await user.click(checkCustom2);
    const allowConsentBtn = await findByText('Allow Access');
    await user.click(allowConsentBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/consent', {
        consent: true,
        optedScopes: {
          openid: true,
          custom1: true,
          custom2: false,
          'custom3.custom4.custom5': true,
          email: true,
          profile: true,
        },
      }, 'application/ion+json; okta-version=1.0.0'),
    );
  });

  it('should send correct payload when consent is denied', async () => {
    const { authClient, user, findByText } = await setup({ mockResponse });

    const denyConsentBtn = await findByText('Cancel');
    await user.click(denyConsentBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/consent', {
        consent: false,
        optedScopes: {
          openid: true,
          custom1: true,
          custom2: true,
          'custom3.custom4.custom5': true,
          email: true,
          profile: true,
        },
      }, 'application/ion+json; okta-version=1.0.0'),
    );
  });
});
