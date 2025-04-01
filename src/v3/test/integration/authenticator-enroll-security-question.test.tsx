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

import mockResponse from '../../src/mocks/response/idp/idx/credential/enroll/securityquestion-enroll-mfa.json';
import { mockMathRandom } from '../utils/mockMathRandom';

describe('authenticator-enroll-security-question', () => {
  beforeEach(() => {
    mockMathRandom();
  });

  describe('predefined question', () => {
    it('renders correct form', async () => {
      const { container, findByText } = await setup({
        mockResponse,
        widgetOptions: { features: { autoFocus: true } },
      });

      await findByText(/Set up security question/);
      await findByText(/What is the food you least liked/);
      expect(container).toMatchSnapshot();
    });

    it('should render form without an autoFocused field', async () => {
      const { container, findByRole } = await setup({
        mockResponse,
        widgetOptions: { features: { autoFocus: false } },
      });
      const radioEle = await findByRole(
        'radio', { name: 'Choose a security question' },
      ) as HTMLInputElement;
      expect(radioEle).not.toHaveFocus();
      expect(container).toMatchSnapshot();
    });

    it('should send correct payload', async () => {
      const {
        authClient, user, findByLabelText, findByText,
      } = await setup({ mockResponse, widgetOptions: { features: { autoFocus: true } } });

      await findByText(/Set up security question/);

      const submitButton = await findByText('Verify', { selector: 'button' });
      const answerEle = await findByLabelText('Answer') as HTMLInputElement;

      const answer = 'pizza';
      await user.tab();
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
    });

    it('fails client side validation when answer is missing', async () => {
      const {
        authClient, user, findAllByRole, findByLabelText, findByText,
      } = await setup({ mockResponse });

      await findByText(/Set up security question/);
      await user.click(await findByText('Verify', { selector: 'button' }));

      // assert no network request
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
      // assert global alert
      const [globalError] = await findAllByRole('alert');
      expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
      // assert field level error
      const answerField = await findByLabelText('Answer') as HTMLInputElement;
      expect(answerField).toHaveErrorMessage(/This field cannot be left blank/);
    });

    it('clears messages when switch to custom question form', async () => {
      const {
        user, queryAllByRole, findByText, findByLabelText,
      } = await setup({ mockResponse });

      await findByText(/Set up security question/);
      await user.click(await findByText('Verify', { selector: 'button' }));

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      // assert no error message
      await waitFor(async () => {
        const [globalError] = queryAllByRole('alert');
        expect(globalError).toBeUndefined();
        const answerEle = await findByLabelText('Answer') as HTMLInputElement;
        expect(answerEle).not.toHaveErrorMessage();
      });
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
        authClient, user, findByText, findByLabelText, findByRole,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      const customQuestionEle = await findByRole('textbox', { name: 'Create my own security question' }) as HTMLInputElement;
      const answerEle = await findByLabelText('Answer') as HTMLInputElement;
      const submitButton = await findByText('Verify', { selector: 'button' });

      const question = 'What is the meaning of life?';
      const answer = '42';
      await user.type(customQuestionEle, question);
      await user.type(answerEle, answer);

      expect(customQuestionEle.value).toEqual(question);
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
    });

    it('fails client side validation when custom question is missing', async () => {
      const {
        authClient,
        user,
        container,
        findByText,
        findByRole,
        findByLabelText,
        findAllByRole,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      const questionEle = await findByRole('textbox', { name: 'Create my own security question' }) as HTMLInputElement;
      const answerEle = await findByLabelText('Answer') as HTMLInputElement;
      const answer = '42';
      await user.type(answerEle, answer);
      expect(answerEle.value).toBe(answer);
      expect(questionEle.value).toBe('');
      await user.click(await findByText('Verify', { selector: 'button' }));

      // assert no network request
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
      // assert global alert
      const [globalError] = await findAllByRole('alert');
      expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
      // assert field level error
      expect(questionEle).toHaveErrorMessage(/This field cannot be left blank/);
      expect(answerEle).not.toHaveErrorMessage();
      expect(container).toMatchSnapshot();
    });

    it('fails client side validation when answer is missing', async () => {
      const {
        authClient,
        user,
        findByText,
        findByRole,
        findByLabelText,
        findAllByRole,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      const customQuestionEle = await findByRole('textbox', { name: 'Create my own security question' }) as HTMLInputElement;
      const question = 'What is the meaning of life?';
      await user.type(customQuestionEle, question);
      expect(customQuestionEle.value).toEqual(question);
      await user.click(await findByText('Verify', { selector: 'button' }));

      // assert no network request
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
      // assert global alert
      const [globalError] = await findAllByRole('alert');
      expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
      // assert field level error
      expect(customQuestionEle).not.toHaveErrorMessage();
      const answerEle = await findByLabelText('Answer') as HTMLInputElement;
      expect(answerEle).toHaveErrorMessage(/This field cannot be left blank/);
    });

    it('fails client side validation when both custom question and answer are missing', async () => {
      const {
        authClient,
        user,
        findByText,
        findByLabelText,
        findAllByRole,
        findByRole,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));

      await user.click(await findByText('Verify', { selector: 'button' }));
      expect(authClient.options.httpRequestClient).not.toHaveBeenCalled();
      // assert global alert
      const [globalError] = await findAllByRole('alert');
      expect(globalError.innerHTML).toContain('We found some errors. Please review the form and make corrections.');
      // assert field level error
      const customQuestionEle = await findByRole('textbox', { name: 'Create my own security question' }) as HTMLInputElement;
      expect(customQuestionEle).toHaveErrorMessage(/This field cannot be left blank/);
      const answerField = await findByLabelText('Answer') as HTMLInputElement;
      expect(answerField).toHaveErrorMessage(/This field cannot be left blank/);
    });

    it('clears messages when switch to predefined question form', async () => {
      const {
        user, queryAllByRole, queryByTestId, findByText, findByLabelText,
      } = await setup({ mockResponse });

      // switch to custom question form
      user.click(await findByLabelText(/Create my own security question/));
      await user.click(await findByText('Verify', { selector: 'button' }));

      // switch to predefined question form
      user.click(await findByLabelText(/Choose a security question/));

      // assert no error message
      await waitFor(() => {
        const [globalError] = queryAllByRole('alert');
        expect(globalError).toBeUndefined();
        const questionFieldError = queryByTestId('credentials.question-error');
        expect(questionFieldError).toBeNull();
        const answerFieldError = queryByTestId('credentials.answer-error');
        expect(answerFieldError).toBeNull();
      });
    });
  });
});
