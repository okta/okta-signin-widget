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
import { createAuthJsPayloadArgs, setup } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/identify/securityquestion-verify.json';
import mockResponseNoProfile from '../../src/mocks/response/idp/idx/identify/securityquestion-verify-no-profile.json';

describe('authenticator-verification-security-question', () => {
  it('renders form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Verify with your Security Question/);
    expect(container).toMatchSnapshot();
  });

  it('renders form when idx response does not have profile in currentAuthenticatorEnrollment', async () => {
    const { container, findByText } = await setup({ mockResponse: mockResponseNoProfile });
    await findByText(/Verify with your Security Question/);
    expect(container).toMatchSnapshot();
  });

  it('sends correct payload', async () => {
    const {
      authClient,
      user,
      findByText,
      findByLabelText,
    } = await setup({ mockResponse });
    const titleElement = await findByText(/Verify with your Security Question/);
    await waitFor(() => expect(titleElement).toHaveFocus());
    await findByText(/What is the food you least liked as a child\?/);

    const answerEl = await findByLabelText('What is the food you least liked as a child?') as HTMLInputElement;
    const submitButton = await findByText('Verify', { selector: 'button' });

    await user.type(answerEl, 'fake-answer');
    expect(answerEl.value).toEqual('fake-answer');
    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
        credentials: {
          answer: 'fake-answer',
          questionKey: 'disliked_food',
        },
      }),
    );
  });
});
