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

import { HttpRequestClient } from '@okta/okta-auth-js';
import { createAuthJsPayloadArgs, setup, updateStateHandleInMock } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/securityquestion-enroll-mfa.json';
import responseWithCharacterLimitError
  from '../../src/mocks/response/idp/idx/challenge/answer/enroll-security-question-with-character-limit-error.json';

describe('authenticator-enroll-security-question-error', () => {
  let mockRequestClientWithError: HttpRequestClient;
  beforeEach(() => {
    mockRequestClientWithError = jest.fn().mockImplementation((_, url, options) => {
      updateStateHandleInMock(mockResponse);
      updateStateHandleInMock(responseWithCharacterLimitError);
      if (url.endsWith('/interact')) {
        return Promise.resolve({
          responseText: JSON.stringify({
            interaction_handle: 'fake-interactionhandle',
          }),
        });
      }

      if (url.endsWith('/introspect')) {
        return Promise.resolve({
          responseText: JSON.stringify(mockResponse),
        });
      }

      if (url.endsWith('/idp/idx/challenge/answer')) {
        const { data } = options;
        const answer = JSON.parse(data).credentials?.answer;
        if (answer?.length < 4) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject({
            responseText: JSON.stringify(responseWithCharacterLimitError),
            status: 401,
            headers: {},
          });
        }
        return Promise.resolve({
          responseText: JSON.stringify({}),
          status: 200,
        });
      }

      // reject unknown request
      return Promise.reject(new Error('Unknown request'));
    });
  });

  describe('predefined question', () => {
    it('should show field level character count error message when invalid number of characters are sent and field should retain characters', async () => {
      const {
        user, authClient, container, findByText, findByTestId,
      } = await setup({ mockRequestClient: mockRequestClientWithError });

      await findByText(/Set up security question/);
      const submitButton = await findByText('Verify', { selector: 'button' });
      const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;

      const answer = 'pi';
      await user.type(answerEle, answer);
      expect(answerEle.value).toEqual(answer);

      await user.click(submitButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
          credentials: {
            questionKey: 'disliked_food',
            answer,
          },
        }),
      );
      const answerEleError = await findByTestId('credentials.answer-error');
      // Previously entered characters should remain in the field
      expect((await findByTestId('credentials.answer') as HTMLInputElement).value).toBe(answer);
      expect(answerEleError.innerHTML).toEqual('The security question answer must be at least 4 characters in length');
      expect(container).toMatchSnapshot();
    });

    it('should show field level character count error message on multiple attempts to submit with invalid character count', async () => {
      const {
        user, authClient, container, findByText, findByTestId,
      } = await setup({ mockRequestClient: mockRequestClientWithError });

      await findByText(/Set up security question/);
      const submitButton = await findByText('Verify', { selector: 'button' });
      const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;

      const answer = 'pi';
      await user.type(answerEle, answer);
      expect(answerEle.value).toEqual(answer);

      await user.click(submitButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
          credentials: {
            questionKey: 'disliked_food',
            answer,
          },
        }),
      );
      const answerEleError = await findByTestId('credentials.answer-error');
      expect(answerEleError.innerHTML).toEqual('The security question answer must be at least 4 characters in length');
      await user.click(await findByText('Verify', { selector: 'button' }));
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
          credentials: {
            questionKey: 'disliked_food',
            answer,
          },
        }),
      );
      expect((await findByTestId('credentials.answer-error')).innerHTML)
        .toEqual('The security question answer must be at least 4 characters in length');
      expect(container).toMatchSnapshot();
    });

    it('should send correct payload when toggling between question types and submitted form with incorrect number of characters', async () => {
      const {
        user, authClient, container, findByText, findByTestId, findByLabelText,
      } = await setup({ mockRequestClient: mockRequestClientWithError });

      await findByText(/Set up security question/);
      const submitButton = await findByText('Verify', { selector: 'button' });
      const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;

      const answer = 'pi';
      await user.type(answerEle, answer);
      expect(answerEle.value).toEqual(answer);

      await user.click(submitButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
          credentials: {
            questionKey: 'disliked_food',
            answer,
          },
        }),
      );
      const answerEleError = await findByTestId('credentials.answer-error');
      // Previously entered characters should remain in the field
      expect((await findByTestId('credentials.answer') as HTMLInputElement).value).toBe(answer);
      expect(answerEleError.innerHTML).toEqual('The security question answer must be at least 4 characters in length');

      // switch to custom question form
      await user.click(await findByLabelText(/Create my own security question/));

      const customQuestionEle = await findByTestId('credentials.question') as HTMLInputElement;
      const customQuestionAnswerEle = await findByTestId('credentials.answer') as HTMLInputElement;
      const customQuestion = 'What is life?';
      await user.type(customQuestionEle, customQuestion);
      await user.type(customQuestionAnswerEle, answer);
      expect(customQuestionEle.value).toBe(customQuestion);
      expect(customQuestionAnswerEle.value).toBe(answer);

      await user.click(await findByText('Verify', { selector: 'button' }));
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
          credentials: {
            questionKey: 'custom',
            question: customQuestion,
            answer,
          },
        }),
      );
      // Previously entered characters should remain in the field
      expect((await findByTestId('credentials.answer') as HTMLInputElement).value).toBe(answer);
      expect((await findByTestId('credentials.answer-error')).innerHTML)
        .toEqual('The security question answer must be at least 4 characters in length');

      // switch to predefined question form
      await user.click(await findByLabelText(/Choose a security question/));
      await findByLabelText('Choose a security question', { selector: 'select' });
      const restoredAnswerEle = await findByTestId('credentials.answer') as HTMLInputElement;

      await user.type(restoredAnswerEle, answer);
      expect(restoredAnswerEle.value).toEqual(answer);

      await user.click(await findByText('Verify', { selector: 'button' }));
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
          credentials: {
            questionKey: 'disliked_food',
            answer,
          },
        }),
      );
      expect((await findByTestId('credentials.answer') as HTMLInputElement).value).toBe(answer);
      expect((await findByTestId('credentials.answer-error')).innerHTML)
        .toEqual('The security question answer must be at least 4 characters in length');
      expect(container).toMatchSnapshot();
      await user.click(await findByText('Verify', { selector: 'button' }));
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
          credentials: {
            questionKey: 'disliked_food',
            answer,
          },
        }),
      );
    }, 20000);
  });

  describe('custom question', () => {
    it('should show field level character count error message when invalid number of characters are sent and field should retain characters', async () => {
      const {
        user, authClient, container, findByText, findByTestId, findByLabelText,
      } = await setup({ mockRequestClient: mockRequestClientWithError });

      await findByText(/Set up security question/);

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      const submitButton = await findByText('Verify', { selector: 'button' });
      const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;
      const customQuestionEle = await findByTestId('credentials.question') as HTMLInputElement;

      const question = 'What is the meaning of life?';
      await user.type(customQuestionEle, question);
      expect(customQuestionEle.value).toEqual(question);

      const answer = 'pi';
      await user.type(answerEle, answer);
      expect(answerEle.value).toEqual(answer);

      await user.click(submitButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        ...createAuthJsPayloadArgs('POST', 'idp/idx/challenge/answer', {
          credentials: {
            questionKey: 'custom',
            question,
            answer,
          },
        }),
      );
      const answerEleError = await findByTestId('credentials.answer-error');
      // Previously entered characters should remain in the field
      expect((await findByTestId('credentials.answer') as HTMLInputElement).value).toBe(answer);
      expect(answerEleError.innerHTML).toEqual('The security question answer must be at least 4 characters in length');
      expect(container).toMatchSnapshot();
    });
  });
});
