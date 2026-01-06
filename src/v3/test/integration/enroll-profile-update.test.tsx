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
import mockResponse from '../../../../playground/mocks/data/idp/idx/enroll-profile-submit.json';
import { createAuthJsPayloadArgs, setup } from './util';

describe('enroll-profile-update', () => {
  it('should render form', async () => {
    const { container, findByLabelText, findByRole } = await setup({ mockResponse });
    const heading = await findByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Sign in');
    expect(container).toMatchSnapshot();
    const favoriteSportEle = await findByLabelText('Favorite sport') as HTMLInputElement;
    expect(favoriteSportEle).not.toHaveFocus();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByLabelText, findByRole,
    } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

    const heading = await findByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('Sign in');

    const submitButton = await findByRole('button', { name: 'Submit' });
    const favoriteSportEle = await findByLabelText('Favorite sport') as HTMLInputElement;
    const newAttributeEle = await findByLabelText('Custom attribute') as HTMLInputElement;

    const favoriteSport = 'Football';
    const newAttribute = 'New Attr';
    await waitFor(() => expect(favoriteSportEle).toHaveFocus());
    await user.type(favoriteSportEle, favoriteSport);
    await user.type(newAttributeEle, newAttribute);

    expect(favoriteSportEle.value).toEqual(favoriteSport);
    expect(newAttributeEle.value).toEqual(newAttribute);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/enroll/update', {
        userProfile: {
          favoriteSport,
          newAttribute,
        },
      }),
    );
  });

  it('fails client side validation with empty required fields', async () => {
    const {
      container, user, findByLabelText, findByRole, getNewRequestCount,
    } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

    const submitButton = await findByRole('button', { name: 'Submit' });

    await user.click(submitButton);
    const favoriteSportEle = await findByLabelText('Favorite sport') as HTMLInputElement;
    expect(favoriteSportEle).toHaveErrorMessage(/This field cannot be left blank/);
    const newAttributeEle = await findByLabelText('Custom attribute') as HTMLInputElement;
    expect(newAttributeEle).toHaveErrorMessage(/This field cannot be left blank/);

    expect(getNewRequestCount()).toBe(0);
    expect(container).toMatchSnapshot();
  });
});
