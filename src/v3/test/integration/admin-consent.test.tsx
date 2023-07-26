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

import adminConsentResponse from '../../../../playground/mocks/data/idp/idx/consent-admin.json';

describe('admin-consent', () => {
  it('should render form with logo', async () => {
    const { container, findByRole } = await setup({ mockResponse: adminConsentResponse });
    const appNameHeading = await findByRole('heading', { level: 2 });
    const groupHeading = await findByRole('heading', { level: 3 });

    expect(appNameHeading.textContent).toBe('Native client');
    expect(groupHeading.textContent).toBe('Resource and policies');

    expect(container).toMatchSnapshot();
  });

  it('should render form without logo', async () => {
    const adminConsentResponseWithoutLogo = {
      ...adminConsentResponse,
      app: {
        ...adminConsentResponse.app,
        value: { ...adminConsentResponse.app.value, logo: undefined },
      },
    };
    const { container, findByRole } = await setup({ mockResponse: adminConsentResponseWithoutLogo });
    const appNameHeading = await findByRole('heading', { level: 2 });
    const groupHeading = await findByRole('heading', { level: 3 });

    expect(appNameHeading.textContent).toBe('Native client');
    expect(groupHeading.textContent).toBe('Resource and policies');

    expect(container).toMatchSnapshot();
  });

  it('should send correct payload when consent is given', async () => {
    const { authClient, user, findByText } = await setup({ mockResponse: adminConsentResponse });

    const allowConsentBtn = await findByText('Allow Access');
    await user.click(allowConsentBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/consent', {
        consent: true,
      }, 'application/ion+json; okta-version=1.0.0'),
    );
  });

  it('should send correct payload when cancel is clicked', async () => {
    const { authClient, user, findByText } = await setup({ mockResponse: adminConsentResponse });

    const allowConsentBtn = await findByText('Cancel');
    await user.click(allowConsentBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/consent', {
        consent: false,
      }, 'application/ion+json; okta-version=1.0.0'),
    );
  });
});
