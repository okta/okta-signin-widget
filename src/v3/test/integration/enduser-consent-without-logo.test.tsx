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

import enduserConsentResponse from '../../../../playground/mocks/data/idp/idx/consent-enduser.json';

describe('enduser-consent-without-logo', () => {
  it('should render form', async () => {
    const enduserConsentResponseWithoutLogo = {
      ...enduserConsentResponse,
      app: {
        ...enduserConsentResponse.app,
        value: { ...enduserConsentResponse.app.value, logo: undefined },
      },
    };
    const { container, findByRole, findByLabelText, queryByAltText } = await setup({
      mockResponse: enduserConsentResponseWithoutLogo,
    });
    const appNameHeading = await findByRole('heading', { level: 2 });
    const logo = queryByAltText('Logo for the app');

    expect(logo).toBeNull();
    expect(appNameHeading.textContent).toBe('Native client');
    // Wait for Spinner to appear
    await findByLabelText('Processing...');
    expect(container).toMatchSnapshot();
  });
});
