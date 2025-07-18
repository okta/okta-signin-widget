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

import { waitFor } from '@testing-library/preact';
import enrollProfileUpdatAllOptionalMockResponse from '../../../../playground/mocks/data/idp/idx/enroll-profile-update-all-optional-params.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('enroll-profile-update-optional-fields', () => {
  it('should render form with one required field', async () => {
    const { container, findByRole, findByTestId } = await setup(
      { mockResponse: enrollProfileUpdatAllOptionalMockResponse },
    );
    const heading = await findByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Additional Profile information');
    expect(container).toMatchSnapshot();
    const customAttrEle = await findByTestId('userProfile.newAttribute') as HTMLInputElement;
    expect(customAttrEle).not.toHaveFocus();
  });

  it('should send correct payload when skipping update with all optional fields', async () => {
    const {
      authClient, user, findByRole, findByTestId,
    } = await setup({
      mockResponse: enrollProfileUpdatAllOptionalMockResponse,
      widgetOptions: { features: { autoFocus: true } },
    });

    const heading = await findByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Additional Profile information');

    const customAttrEle = await findByTestId('userProfile.newAttribute') as HTMLInputElement;
    const skipProfileLink = await findByRole('link', { name: 'Skip Profile' });
    await waitFor(() => expect(customAttrEle).toHaveFocus());

    await user.click(skipProfileLink);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/skip', undefined, 'application/vnd.okta.v1+json'),
    );
  });
});
