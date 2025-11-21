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

import mockResponse from '../../../../playground/mocks/data/idp/idx/authenticator-verification-phone-sms-required.json';

describe('authenticator-verification-phone-sms-required', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Verify with your phone/);
    expect(container).toMatchSnapshot();
  });

  it('should show validation error when submitting empty passcode field', async () => {
    const {
      user,
      findByText,
      findByLabelText,
    } = await setup({ mockResponse });

    const titleElement = await findByText(/Verify with your phone/);
    await waitFor(() => expect(titleElement).toHaveFocus());

    const codeEle = await findByLabelText('Enter Code') as HTMLInputElement;
    const submitButton = await findByText('Verify', { selector: 'button' });

    // Verify field is initially empty
    expect(codeEle.value).toEqual('');

    // Click verify button without entering a code
    await user.click(submitButton);

    // Should show validation error message instead of throwing an error
    const errorMessage = await findByText(/This field cannot be left blank/);
    expect(errorMessage).toBeInTheDocument();
  });
});
