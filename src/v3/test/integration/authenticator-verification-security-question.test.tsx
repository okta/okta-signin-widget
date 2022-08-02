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

import mockResponse from '../../src/mocks/response/idp/idx/identify/securityquestion-verify.json';

describe('authenticator-verification-security-question', () => {
  it('renders form', async () => {
    const { container, findByText } = await setup({ mockResponse });
    await findByText(/Verify with your Security Question/);
    expect(container).toMatchSnapshot();
  });

  it('sends correct payload', async () => {
    const {
      authClient,
      user,
      findByText,
      findByTestId,
    } = await setup({ mockResponse });
    await findByText(/Verify with your Security Question/);
    await findByText(/What is the food you least liked as a child\?/);

    const answerEl = await findByTestId('credentials.answer') as HTMLInputElement;
    const submitButton = await findByTestId('submit');

    await user.type(answerEl, 'fake-answer');
    expect(answerEl.value).toEqual('fake-answer');
    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://dev-08160404.okta.com/idp/idx/challenge/answer',
      {
        data: JSON.stringify({
          credentials: {
            answer: 'fake-answer',
            questionKey: 'disliked_food',
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
});
