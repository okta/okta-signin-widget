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

import { fireEvent, render, waitFor } from '@testing-library/preact';
import { h } from 'preact';
import {
  MessageType,
  UISchemaElementComponentProps,
  WebAuthNButtonElement,
} from 'src/types';

import WebAuthNSubmitButton from './WebAuthNSubmitButton';

jest.mock('../../../../v2/ion/i18nTransformer', () => ({
  getMessageFromBrowserError: (error: Error) => (error.name === 'NotAllowedError' ? 'Operation not allowed' : error.message),
}));

const setMessageMockFn = jest.fn();
jest.mock('../../contexts', () => ({
  useWidgetContext: () => ({
    setMessage: setMessageMockFn,
  }),
}));

const mockSubmitHook = jest.fn().mockImplementation(() => ({}));
jest.mock('../../hooks', () => ({
  useOnSubmit: () => mockSubmitHook,
}));

describe('WebAuthNControlSubmitControl Tests', () => {
  let props: UISchemaElementComponentProps & { uischema: WebAuthNButtonElement; };

  beforeEach(() => {
    props = {
      uischema: {
        type: 'WebAuthNSubmitButton',
        options: {
          label: 'Verify',
          step: 'enroll-authenticator',
          onClick: jest.fn().mockImplementation(
            () => Promise.resolve({}),
          ),
          submitOnLoad: false,
          showLoadingIndicator: true,
        },
      } as WebAuthNButtonElement,
    };
  });

  it('should render webauthn verify button and handle click', async () => {
    const { findByTestId } = render(<WebAuthNSubmitButton {...props} />);

    const button = await findByTestId('button');

    fireEvent.click(button);
    await waitFor(() => {
      expect(setMessageMockFn).toBeCalled();
      expect(mockSubmitHook).toBeCalled();
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
    const { findByTestId } = render(<WebAuthNSubmitButton {...props} />);

    const button = await findByTestId('button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(setMessageMockFn).toHaveBeenLastCalledWith({
        message: 'Operation not allowed',
        class: MessageType.ERROR,
        i18n: { key: 'Operation not allowed' },
      });
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
    const { findByTestId } = render(<WebAuthNSubmitButton {...props} />);

    const button = await findByTestId('button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(setMessageMockFn).toHaveBeenLastCalledWith({
        message: 'Something went wrong',
        class: MessageType.ERROR,
        i18n: { key: 'Something went wrong' },
      });
    });
  });
});
