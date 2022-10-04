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

import mockResponse from '@okta/mocks/data/idp/idx/enroll-profile-submit.json';
import { waitFor } from '@testing-library/preact';
import { setup } from './util';

describe('enroll-profile-update', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Sign in/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Sign in/);

    const submitButton = await findByText('Submit', { selector: 'button' });
    const favoriteSportEle = await findByTestId('userProfile.favoriteSport') as HTMLInputElement;
    const newAttributeEle = await findByTestId('userProfile.newAttribute') as HTMLInputElement;

    const favoriteSport = 'Football';
    const newAttribute = 'New Attr';
    await waitFor(() => expect(favoriteSportEle).toHaveFocus());
    await user.type(favoriteSportEle, favoriteSport);
    await user.type(newAttributeEle, newAttribute);

    expect(favoriteSportEle.value).toEqual(favoriteSport);
    expect(newAttributeEle.value).toEqual(newAttribute);

    await user.click(submitButton);
    // TODO: OKTA-526754 - Update this assertion once merged back into 0.1
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'http://localhost:3000/idp/idx/enroll/update',
      {
        data: JSON.stringify({
          userProfile: {
            favoriteSport,
            newAttribute,
          },
          stateHandle: 'fake-stateHandle',
        }),
        headers: {
          Accept: 'application/json; okta-version=1.0.0',
          'Content-Type': 'application/json',
          'X-Okta-User-Agent-Extended': 'okta-auth-js/9.9.9',
        },
        withCredentials: true,
      },
    );
  });

  it('fails client side validation with empty required fields', async () => {
    const {
      authClient, container, user, findByText, findByTestId,
    } = await setup({ mockResponse });

    const submitButton = await findByText('Submit', { selector: 'button' });

    await user.click(submitButton);
    const favoriteSportError = await findByTestId('userProfile.favoriteSport-error');
    expect(favoriteSportError.textContent).toEqual('This field cannot be left blank');
    const newAttributeError = await findByTestId('userProfile.newAttribute-error');
    expect(newAttributeError.textContent).toEqual('This field cannot be left blank');

    expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });
});
