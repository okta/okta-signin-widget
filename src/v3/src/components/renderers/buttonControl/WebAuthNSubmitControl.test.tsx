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

import { CellProps } from '@jsonforms/core';
import { fireEvent, render, waitFor } from '@testing-library/preact';
import { h } from 'preact';
import { MessageType } from 'src/types';

import WebAuthNSubmitControl from './WebAuthNSubmitControl';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: jest.fn().mockReturnValue('Operation not allowed'),
    i18n: {
      exists: (key: string) => key === 'oie.browser.error.NotAllowedError',
    },
  }),
}));

const setMessagesMockFn = jest.fn();
const setIdxTransactionMockFn = jest.fn();

jest.mock('../../../contexts', () => ({
  useWidgetContext: () => ({
    setMessages: setMessagesMockFn,
    setIdxTransaction: setIdxTransactionMockFn,
  }),
}));

describe('WebAuthNControlSubmitControl Tests', () => {
  let props: CellProps;
  const actionMockFn = jest.fn();

  beforeEach(() => {
    props = {
      id: '',
      enabled: true,
      visible: true,
      path: '',
      handleChange: jest.fn(),
      schema: {},
      rootSchema: {},
      isValid: true,
      errors: '',
      data: {},
      uischema: {
        type: 'Control',
        scope: '',
        options: {
          nextStep: {},
          onClick: jest.fn().mockImplementation(
            () => Promise.resolve({}),
          ),
          submitOnLoad: false,
          showLoadingIndicator: true,
          label: 'Verify',
          action: actionMockFn,
        },
      },
    };
  });

  it('should render webauthn verify button and handle click', async () => {
    const { findByTestId } = render(<WebAuthNSubmitControl {...props} />);

    const button = await findByTestId('proceedBtn');

    fireEvent.click(button);
    await waitFor(() => {
      expect(setMessagesMockFn).toBeCalled();
      expect(setIdxTransactionMockFn).toBeCalled();
      expect(actionMockFn).toBeCalled();
    });
  });

  it('should render webauthn verify button and handle click when known error occurs', async () => {
    props = {
      ...props,
      uischema: {
        ...props.uischema,
        options: {
          ...props.uischema.options,
          onClick: () => new Promise((resolve, reject) => {
            const error = new Error('Operation not allowed');
            error.name = 'NotAllowedError';
            reject(error);
          }),
        },
      },
    };
    const { findByTestId } = render(<WebAuthNSubmitControl {...props} />);

    const button = await findByTestId('proceedBtn');

    fireEvent.click(button);

    await waitFor(() => {
      expect(setMessagesMockFn).toHaveBeenLastCalledWith([{
        message: 'Operation not allowed',
        class: MessageType.ERROR,
        i18n: { key: 'Operation not allowed' },
      }]);
    });
  });

  it('should render webauthn verify button and handle click when unknown error occurs', async () => {
    props = {
      ...props,
      uischema: {
        ...props.uischema,
        options: {
          ...props.uischema.options,
          onClick: () => new Promise((resolve, reject) => {
            const error = new Error('Something went wrong');
            error.name = 'somethingwentwrong';
            reject(error);
          }),
        },
      },
    };
    const { findByTestId } = render(<WebAuthNSubmitControl {...props} />);

    const button = await findByTestId('proceedBtn');

    fireEvent.click(button);

    await waitFor(() => {
      expect(setMessagesMockFn).toHaveBeenLastCalledWith([{
        message: 'Something went wrong',
        class: MessageType.ERROR,
        i18n: { key: 'Something went wrong' },
      }]);
    });
  });
});
