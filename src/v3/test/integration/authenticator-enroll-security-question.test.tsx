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
import { HttpRequestClient } from '@okta/okta-auth-js';
import { setup, updateStateHandleInMock } from './util';

import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/securityquestion-enroll-mfa.json';
import responseWithCharacterLimitError
  from '../../src/mocks/response/idp/idx/challenge/answer/enroll-security-question-with-character-limit-error.json';

describe('authenticator-enroll-security-question', () => {
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
        let response;
        const { data } = options;
        const answer = JSON.parse(data).credentials?.answer;
        if (answer?.length < 4) {
          response = responseWithCharacterLimitError;
        } else {
          response = {};
        }
        return Promise.resolve({
          responseText: JSON.stringify(response),
        });
      }

      // reject unknown request
      return Promise.reject(new Error('Unknown request'));
    });
  });

  describe('predefined question', () => {
    it('renders correct form', async () => {
      const { container, findByText } = await setup({ mockResponse });

      await findByText(/Set up security question/);
      await findByText(/What is the food you least liked/);
      expect(container).toMatchSnapshot();
    });

    it('should send correct payload', async () => {
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
        'http://localhost:3000/idp/idx/challenge/answer',
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

    it('fails client side validation when answer is missing', async () => {
      const {
        authClient, user, findByRole, findByTestId, findByText,
      } = await setup({ mockResponse });

      await findByText(/Set up security question/);
      await user.click(await findByText('Verify', { selector: 'button' }));

      // assert no network request
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
        expect.anything(),
      );
      // assert global alert
      const globalError = await findByRole('alert');
      expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
      // assert field level error
      const answerFieldError = await findByTestId('credentials.answer-error');
      expect(answerFieldError.innerHTML).toEqual('This field cannot be left blank');
    });

    it('clears messages when switch to custom question form', async () => {
      const {
        user, queryByRole, queryByTestId, findByText, findByLabelText,
      } = await setup({ mockResponse });

      await findByText(/Set up security question/);
      await user.click(await findByText('Verify', { selector: 'button' }));

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      // assert no error message
      await waitFor(() => {
        const globalError = queryByRole('alert');
        expect(globalError).toBeNull();
        const answerFieldError = queryByTestId('credentials.answer-error');
        expect(answerFieldError).toBeNull();
      });
    });

    it('should show field level character count error message when invalid number of characters are sent and field should retain characters', async () => {
      const {
        user, authClient, findByText, findByTestId,
      } = await setup({ mockRequestClient: mockRequestClientWithError });

      await findByText(/Set up security question/);
      const submitButton = await findByText('Verify', { selector: 'button' });
      const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;

      const answer = 'pi';
      await user.type(answerEle, answer);
      expect(answerEle.value).toEqual(answer);

      await user.click(submitButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
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
      const answerEleError = await findByTestId('credentials.answer-error');
      // Previously entered characters should remain in the field
      expect((await findByTestId('credentials.answer') as HTMLInputElement).value).toBe(answer);
      expect(answerEleError.innerHTML).toEqual('The security question answer must be at least 4 characters in length');
    });

    it('should show field level character count error message on multiple attempts to submit with invalid character count', async () => {
      const {
        user, authClient, findByText, findByTestId,
      } = await setup({ mockRequestClient: mockRequestClientWithError });

      await findByText(/Set up security question/);
      const submitButton = await findByText('Verify', { selector: 'button' });
      const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;

      const answer = 'pi';
      await user.type(answerEle, answer);
      expect(answerEle.value).toEqual(answer);

      await user.click(submitButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        // TODO: OKTA-526754 - extract this payload into a re-usable util function
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
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
      const answerEleError = await findByTestId('credentials.answer-error');
      expect(answerEleError.innerHTML).toEqual('The security question answer must be at least 4 characters in length');
      await user.click(await findByText('Verify', { selector: 'button' }));
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        // TODO: OKTA-526754 - extract this payload into a re-usable util function
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
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
      expect((await findByTestId('credentials.answer-error')).innerHTML)
        .toEqual('The security question answer must be at least 4 characters in length');
    });

    it('should send correct payload when toggling between question types and submitted form with incorrect number of characters', async () => {
      const {
        user, authClient, findByText, findByTestId, findByLabelText,
      } = await setup({ mockRequestClient: mockRequestClientWithError });

      await findByText(/Set up security question/);
      const submitButton = await findByText('Verify', { selector: 'button' });
      const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;

      const answer = 'pi';
      await user.type(answerEle, answer);
      expect(answerEle.value).toEqual(answer);

      await user.click(submitButton);
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
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
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
        {
          data: JSON.stringify({
            credentials: {
              questionKey: 'custom',
              question: customQuestion,
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
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
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
      expect((await findByTestId('credentials.answer') as HTMLInputElement).value).toBe(answer);
      expect((await findByTestId('credentials.answer-error')).innerHTML)
        .toEqual('The security question answer must be at least 4 characters in length');
      await user.click(await findByText('Verify', { selector: 'button' }));
      expect(authClient.options.httpRequestClient).toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
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
  });

  describe('custom question', () => {
    it('renders correct form', async () => {
      const {
        container,
        user,
        findByText,
        findByTestId,
        findByLabelText,
      } = await setup({ mockResponse });
      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));
      await findByText(/Set up security question/);
      await findByTestId('credentials.question');
      expect(container).toMatchSnapshot();
    });

    it('should send correct payload', async () => {
      const {
        authClient, user, findByTestId, findByText, findByLabelText,
      } = await setup({ mockResponse });

      // switch to custom question form
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
        'http://localhost:3000/idp/idx/challenge/answer',
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

    it('fails client side validation when custom question is missing', async () => {
      const {
        authClient,
        user,
        container,
        findByTestId,
        findByText,
        findByLabelText,
        findByRole,
        queryByTestId,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      const questionEle = await findByTestId('credentials.question') as HTMLInputElement;
      const answerEle = await findByTestId('credentials.answer') as HTMLInputElement;
      const answer = '42';
      await user.type(answerEle, answer);
      expect(answerEle.value).toBe(answer);
      expect(questionEle.value).toBe('');
      await user.click(await findByText('Verify', { selector: 'button' }));

      // assert no network request
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
        expect.anything(),
      );
      // assert global alert
      const globalError = await findByRole('alert');
      expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
      // assert field level error
      const questionFieldError = await findByTestId('credentials.question-error');
      expect(questionFieldError.innerHTML).toEqual('This field cannot be left blank');
      const answerFieldError = queryByTestId('credentials.answer-error');
      expect(answerFieldError).toBeNull();
      expect(container).toMatchSnapshot();
    });

    it('fails client side validation when answer is missing', async () => {
      const {
        authClient,
        user,
        findByTestId,
        findByText,
        findByLabelText,
        findByRole,
        queryByTestId,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      const customQuestionEle = await findByTestId('credentials.question') as HTMLInputElement;
      const question = 'What is the meaning of life?';
      await user.type(customQuestionEle, question);
      expect(customQuestionEle.value).toEqual(question);
      await user.click(await findByText('Verify', { selector: 'button' }));

      // assert no network request
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
        expect.anything(),
      );
      // assert global alert
      const globalError = await findByRole('alert');
      expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
      // assert field level error
      const answerFieldError = await findByTestId('credentials.answer-error');
      expect(answerFieldError.innerHTML).toEqual('This field cannot be left blank');
      const questionFieldError = queryByTestId('credentials.question-error');
      expect(questionFieldError).toBeNull();
    });

    it('fails client side validation when both custom question and answer are missing', async () => {
      const {
        authClient,
        user,
        findByTestId,
        findByText,
        findByLabelText,
        findByRole,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      await user.click(await findByText('Verify', { selector: 'button' }));
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalledWith(
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
        expect.anything(),
      );
      // assert global alert
      const globalError = await findByRole('alert');
      expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
      // assert field level error
      const questionFieldError = await findByTestId('credentials.question-error');
      expect(questionFieldError.innerHTML).toEqual('This field cannot be left blank');
      const answerFieldError = await findByTestId('credentials.answer-error');
      expect(answerFieldError.innerHTML).toEqual('This field cannot be left blank');
    });

    it('clears messages when switch to predefined question form', async () => {
      const {
        user, queryByRole, queryByTestId, findByText, findByLabelText,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));
      await user.click(await findByText('Verify', { selector: 'button' }));

      // switch to predefined question form
      user.click(await findByLabelText(/Choose a security question/));

      // assert no error message
      await waitFor(() => {
        const globalError = queryByRole('alert');
        expect(globalError).toBeNull();
        const questionFieldError = queryByTestId('credentials.question-error');
        expect(questionFieldError).toBeNull();
        const answerFieldError = queryByTestId('credentials.answer-error');
        expect(answerFieldError).toBeNull();
      });
    });

    it('should show field level character count error message when invalid number of characters are sent and field should retain characters', async () => {
      const {
        user, authClient, findByText, findByTestId, findByLabelText,
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
        'POST',
        'http://localhost:3000/idp/idx/challenge/answer',
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
      const answerEleError = await findByTestId('credentials.answer-error');
      // Previously entered characters should remain in the field
      expect((await findByTestId('credentials.answer') as HTMLInputElement).value).toBe(answer);
      expect(answerEleError.innerHTML).toEqual('The security question answer must be at least 4 characters in length');
    });
  });
});
