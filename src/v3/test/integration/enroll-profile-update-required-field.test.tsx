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

import enrollProfileUpdatMockResponse from '@okta/mocks/data/idp/idx/enroll-profile-update-params.json';
import { waitFor } from '@testing-library/preact';
import { setup } from './util';

describe('enroll-profile-update-required-field', () => {
  it('should render form with one required field', async () => {
    const { container, findByRole } = await setup(
      { mockResponse: enrollProfileUpdatMockResponse },
    );
    const heading = await findByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Additional Profile information');
    expect(container).toMatchSnapshot();
  });

  it('fails client side validation with empty required fields', async () => {
    const {
      authClient, container, user, findByRole, findByTestId,
    } = await setup({ mockResponse: enrollProfileUpdatMockResponse });

    const heading = await findByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Additional Profile information');

    const submitButton = await findByRole('button', { name: 'Finish' });

    const customAttrEle = await findByTestId('userProfile.newAttribute') as HTMLInputElement;
    await waitFor(() => expect(customAttrEle).toHaveFocus());

    await user.click(submitButton);
    const customAttrError = await findByTestId('userProfile.newAttribute2-error');
    expect(customAttrError.textContent).toEqual('This field cannot be left blank');

    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });
});
