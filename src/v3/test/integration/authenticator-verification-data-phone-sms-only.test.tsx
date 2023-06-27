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
import mockResponse from '../../src/mocks/response/idp/idx/challenge/sms-method.json';

describe('authenticator-verification-data-phone-sms-only', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Verify with your phone/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload', async () => {
    const {
      authClient, user, findByText,
    } = await setup({ mockResponse });

    await findByText(/Verify with your phone/);
    await findByText(/Send a code via SMS to/);
    await findByText(/Carrier messaging charges may apply/);

    const submitButton = await findByText('Receive a code via SMS', { selector: 'button' });
    expect(submitButton.innerHTML).toContain('Receive a code via SMS');

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge', {
        authenticator: {
          methodType: 'sms',
          id: 'aut41wnl0jzrilXNz5d7',
          enrollmentId: 'sms4bvjioge7Sdu3p5d7',
        },
      }),
    );
  });
});
