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
import { setup } from './util';
import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-ov-sms-channel.json';

describe('okta-verify-sms-channel-enrollment', () => {
  it('should render sms channel form and send correct payload', async () => {
    const {
      container, findByText, findByTestId, user, authClient,
    } = await setup({ mockResponse });

    await findByText(/Set up Okta Verify via SMS/);
    await findByText(/Make sure you can access the text on your mobile device./);
    const phoneEl = await findByTestId('phoneNumber') as HTMLInputElement;
    const submitBtn = await findByText(/Send me the setup link/);
    const countryEl = await findByTestId('countryList') as HTMLInputElement;

    expect(container).toMatchSnapshot();

    await waitFor(() => expect(countryEl).toHaveFocus());
    const mockPhoneNumber = '2165551234';
    await user.type(phoneEl, mockPhoneNumber);
    expect(phoneEl.value).toEqual(mockPhoneNumber);
    await user.click(submitBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/challenge/send',
      {
        data: JSON.stringify({
          phoneNumber: `+1${mockPhoneNumber}`,
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
});
