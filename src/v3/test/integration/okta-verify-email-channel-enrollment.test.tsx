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
import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/enroll-ov-email-channel.json';

describe('okta-verify-email-channel-enrollment', () => {
  it('should render email channel form and send correct payload', async () => {
    const {
      container, findByText, findByTestId, user, authClient,
    } = await setup({ mockResponse });

    await findByText(/Set up Okta Verify via email link/);
    await findByText(/Make sure you can access the email on your mobile device./);
    const emailEl = await findByTestId(/email/) as HTMLInputElement;
    const submitBtn = await findByText(/Send me the setup link/);

    expect(container).toMatchSnapshot();

    await user.type(emailEl, 'tester@okta1.com');
    expect(emailEl.value).toEqual('tester@okta1.com');
    await user.click(submitBtn);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/send', {
        email: 'tester@okta1.com',
      }),
    );
  });
});
