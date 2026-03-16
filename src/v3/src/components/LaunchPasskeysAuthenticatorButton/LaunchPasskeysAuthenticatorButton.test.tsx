/*
 * Copyright (c) 2025-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/preact';
import { createRef, h } from 'preact';
import { IDX_STEP } from 'src/constants';

import LaunchPasskeysAuthenticatorButton from './index';

const getCredentials = jest.fn();
const emit = jest.fn();
const setLoading = jest.fn();
const mockFocusRef = createRef();
const mockHcaptchaRef = createRef();
const mockOnSubmit = jest.fn();

jest.mock('src/hooks', () => ({
  useOnSubmit: () => mockOnSubmit,
  useAutoFocus: () => mockFocusRef,
}));

jest.mock('src/contexts', () => ({
  useWidgetContext: () => ({
    setLoading,
    setMessage: jest.fn(),
    abortController: {
      abort: jest.fn(),
      signal: { aborted: false },
    },
    widgetProps: {
      eventEmitter: {
        emit,
      },
    },
    sharedHcaptchaRef: mockHcaptchaRef,
  }),
}));

describe('LaunchPasskeysAuthenticatorButton', () => {
  const uischema = {
    translations: [
      { name: 'label', value: 'Sign in with passkeys' },
      { name: 'icon-description', value: 'Passkeys icon' },
    ],
    focus: true,
    options: { getCredentials },
  };

  const renderWithContext = () => render(
    <LaunchPasskeysAuthenticatorButton uischema={uischema as any} />,
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with label and icon', () => {
    renderWithContext();
    expect(
      screen.getByRole('button', { name: /sign in with passkeys/i }),
    ).toBeInTheDocument();
    expect(screen.getByTitle(/passkeys icon/i)).toBeInTheDocument();
  });

  it('calls getCredentials and submits on click when credentials exist', async () => {
    const credentials = { foo: 'bar' };
    getCredentials.mockResolvedValue(credentials);

    renderWithContext();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(getCredentials).toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalledWith({
        params: { credentials },
        step: IDX_STEP.LAUNCH_PASSKEYS_AUTHENTICATOR,
        includeData: false,
      });
    });
  });

  it('shows error message if getCredentials throws', async () => {
    const setMessage = jest.fn();

    (jest.requireMock('src/contexts') as any).useWidgetContext = () => ({
      setLoading,
      setMessage,
      abortController: {
        abort: jest.fn(),
        signal: { aborted: false },
      },
      widgetProps: {
        eventEmitter: {
          emit,
        },
      },
      sharedHcaptchaRef: mockHcaptchaRef,
    });

    getCredentials.mockRejectedValue(new Error('fail'));

    renderWithContext();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(getCredentials).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(setMessage).toHaveBeenCalledWith({
        class: 'ERROR',
        i18n: { key: 'signin.passkeys.error' },
        message: 'signin.passkeys.error',
      });
    });
  });

  it('shows NotSupportedError message when getCredentials throws NotSupportedError', async () => {
    const setMessage = jest.fn();

    (jest.requireMock('src/contexts') as any).useWidgetContext = () => ({
      setLoading,
      setMessage,
      abortController: {
        abort: jest.fn(),
        signal: { aborted: false },
      },
      widgetProps: {
        eventEmitter: {
          emit,
        },
      },
      sharedHcaptchaRef: mockHcaptchaRef,
    });

    const error = new DOMException('The operation is not supported.', 'NotSupportedError');
    getCredentials.mockRejectedValue(error);

    renderWithContext();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(getCredentials).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(setMessage).toHaveBeenCalledWith({
        class: 'ERROR',
        i18n: { key: 'signin.passkeys.error.NotSupportedError' },
        message: 'signin.passkeys.error.NotSupportedError',
      });
    });
  });

  it('shows generic error message for NotAllowedError (e.g., user cancels passkey prompt)', async () => {
    const setMessage = jest.fn();

    (jest.requireMock('src/contexts') as any).useWidgetContext = () => ({
      setLoading,
      setMessage,
      abortController: {
        abort: jest.fn(),
        signal: { aborted: false },
      },
      widgetProps: {
        eventEmitter: {
          emit,
        },
      },
      sharedHcaptchaRef: mockHcaptchaRef,
    });

    const error = new DOMException('The request is not allowed.', 'NotAllowedError');
    getCredentials.mockRejectedValue(error);

    renderWithContext();
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(getCredentials).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(setMessage).toHaveBeenCalledWith({
        class: 'ERROR',
        i18n: { key: 'signin.passkeys.error' },
        message: 'signin.passkeys.error',
      });
    });
  });

  it('should prevent concurrent modal passkey requests when button is pressed rapidly', async () => {
    let resolveCredentials: (value: unknown) => void;
    getCredentials.mockImplementation(() => new Promise((resolve) => {
      resolveCredentials = resolve;
    }));

    renderWithContext();
    const button = screen.getByRole('button');

    // First click — should call getCredentials
    fireEvent.click(button);
    await waitFor(() => {
      expect(getCredentials).toHaveBeenCalledTimes(1);
    });

    // Second click while first is still in-flight — should be blocked
    fireEvent.click(button);

    // getCredentials should still only have been called once
    expect(getCredentials).toHaveBeenCalledTimes(1);

    // Resolve the first call to clean up
    resolveCredentials!(null);
  });

  it('should allow a new request after the previous one completes', async () => {
    getCredentials.mockResolvedValue({ foo: 'bar' });

    renderWithContext();
    const button = screen.getByRole('button');

    // First click — completes normally
    fireEvent.click(button);
    await waitFor(() => {
      expect(getCredentials).toHaveBeenCalledTimes(1);
    });

    // Second click — should proceed since the first one finished
    fireEvent.click(button);
    await waitFor(() => {
      expect(getCredentials).toHaveBeenCalledTimes(2);
    });
  });
});
