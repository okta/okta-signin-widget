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

import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/securityquestion-enroll-mfa.json';

describe('authenticator-enroll-security-question', () => {
  it('should render form', async () => {
    const { container, findByText } = await setup({ mockResponse });

    await findByText(/Set up security question/);
    await findByText(/What is the food you least liked/);
    expect(container).toMatchSnapshot();
  });

  it('should send correct payload with default selections', async () => {
    const {
      authClient, user, findByTestId, findByText,
    } = await setup({ mockResponse });

    await findByText(/Set up security question/);

    const submitButton = await findByText('Verify', { selector: 'button' });
    const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;

    const answer = 'pizza';
    await user.type(answerEle, answer);

    expect(answerEle.value).toEqual(answer);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/challenge/answer',
      {
        data: JSON.stringify({
          credentials: {
            questionKey: 'disliked_food',
            answer,
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

  it('should send correct payload with custom selections', async () => {
    const {
      authClient, user, findByTestId, findByText, findByLabelText,
    } = await setup({ mockResponse });

    await findByText(/Set up security question/);

    user.click(await findByLabelText(/Create my own security question/));

    const customQuestionEle = await findByTestId('credentials.question') as HTMLInputElement;
    const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;
    const submitButton = await findByText('Verify', { selector: 'button' });

    const question = 'What is the meaning of life?';
    const answer = '42';
    await user.type(customQuestionEle, question);
    await user.type(answerEle, answer);

    expect(customQuestionEle.value).toEqual(question);
    expect(answerEle.value).toEqual(answer);

    await user.click(submitButton);
    expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
      'POST',
      'https://oie-4695462.oktapreview.com/idp/idx/challenge/answer',
      {
        data: JSON.stringify({
          credentials: {
            questionKey: 'custom',
            question,
            answer,
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
