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

import enduserConsentResponse from '../../../../playground/mocks/data/idp/idx/consent-enduser.json';

describe('enduser-consent', () => {
  it('should render form with logo', async () => {
    const {
      container, findByRole, queryByAltText, findByText,
    } = await setup({
      mockResponse: enduserConsentResponse,
    });
    const appNameHeading = await findByRole('heading', { level: 1 });
    const logo = queryByAltText('Logo for the app');

    expect(logo).toBeDefined();
    expect(appNameHeading.textContent).toBe('Native client');
    // Wait for form to fully load (spinner disappears, consent scopes appear)
    await findByText('View your email address.');
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload when consent is given', async () => {
    const { authClient, user, findByText } = await setup({ mockResponse: enduserConsentResponse });

    const allowConsentBtn = await findByText('Allow Access');
    await user.click(allowConsentBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/consent', {
        consent: true,
      }, 'application/ion+json; okta-version=1.0.0'),
    );
  });

  it('should send correct payload when cancel is clicked', async () => {
    const { authClient, user, findByText } = await setup({ mockResponse: enduserConsentResponse });

    const cancelBtn = await findByText('Cancel');
    await user.click(cancelBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/consent', {
        consent: false,
      }, 'application/ion+json; okta-version=1.0.0'),
    );
  });
});
