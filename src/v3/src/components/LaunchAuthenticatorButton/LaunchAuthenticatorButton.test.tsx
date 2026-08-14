/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { fireEvent, render, screen } from '@testing-library/preact';
import { createRef, h } from 'preact';
import { IDX_STEP } from 'src/constants';

import LaunchAuthenticatorButton from './index';

const mockFocusRef = createRef();
const mockOnSubmit = jest.fn();
const mockRedirectWithFormGet = jest.fn();

jest.mock('../../../../util/Util', () => ({
  redirectWithFormGet: (...args: unknown[]) => mockRedirectWithFormGet(...args),
}));

jest.mock('src/hooks', () => ({
  useOnSubmit: () => mockOnSubmit,
  useAutoFocus: () => mockFocusRef,
}));

jest.mock('src/contexts', () => ({
  useWidgetContext: () => ({
    loginHint: undefined,
    setloginHint: jest.fn(),
    data: {},
    widgetProps: {},
  }),
}));

describe('LaunchAuthenticatorButton', () => {
  const buildUischema = (step: string, extraOptions: Record<string, unknown> = {}) => ({
    translations: [
      { name: 'label', value: 'Sign in with NFC' },
      { name: 'icon-description', value: 'Launch authenticator icon' },
    ],
    focus: true,
    options: { step, ...extraOptions },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the NFC icon for the launch-nfc-authenticator step', () => {
    render(
      <LaunchAuthenticatorButton
        uischema={buildUischema(IDX_STEP.LAUNCH_NFC_AUTHENTICATOR) as any}
      />,
    );

    expect(screen.getByRole('button', { name: /sign in with nfc/i })).toBeInTheDocument();
    // The button renders a single icon; assert it is the NFC glyph, not Okta Verify.
    expect(screen.getByRole('img')).toHaveAttribute('aria-labelledby', 'mfa-nfc-pin');
  });

  it('renders the Okta Verify icon for the launch-authenticator step', () => {
    render(
      <LaunchAuthenticatorButton
        uischema={buildUischema(IDX_STEP.LAUNCH_AUTHENTICATOR) as any}
      />,
    );

    expect(screen.getByRole('img')).toHaveAttribute('aria-labelledby', 'mfa-okta-verify');
  });

  it('submits with the NFC step when the button is clicked', () => {
    render(
      <LaunchAuthenticatorButton
        uischema={buildUischema(IDX_STEP.LAUNCH_NFC_AUTHENTICATOR) as any}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in with nfc/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      step: IDX_STEP.LAUNCH_NFC_AUTHENTICATOR,
      isActionStep: false,
      params: { rememberMe: undefined },
    });
  });

  it('sets the login hint from the identifier field before submitting on click', () => {
    const setloginHint = jest.fn();
    (jest.requireMock('src/contexts') as any).useWidgetContext = () => ({
      loginHint: undefined,
      setloginHint,
      data: { identifier: 'user@example.com' },
      widgetProps: {},
    });

    render(
      <LaunchAuthenticatorButton
        uischema={buildUischema(IDX_STEP.LAUNCH_NFC_AUTHENTICATOR) as any}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in with nfc/i }));

    expect(setloginHint).toHaveBeenCalledWith('user@example.com');
    expect(mockOnSubmit).toHaveBeenCalledWith({
      step: IDX_STEP.LAUNCH_NFC_AUTHENTICATOR,
      isActionStep: false,
      params: { rememberMe: undefined },
    });
  });

  // OKTA-1250822: NFC must not fire the (stale) launch-screen deep link on click; the
  // challenge-poll screen fires the correct challenge.
  it('does NOT fire a device-challenge deep link on click for the NFC launch step', () => {
    const assignMock = jest.fn();
    jest.spyOn(global, 'location', 'get').mockReturnValue({
      href: 'http://localhost:3000',
      assign: assignMock,
    } as unknown as Location);

    render(
      <LaunchAuthenticatorButton
        uischema={buildUischema(IDX_STEP.LAUNCH_NFC_AUTHENTICATOR, {
          deviceChallengeUrl: 'https://example.okta.com/challenge?x=1',
          challengeMethod: 'CUSTOM_URI',
        }) as any}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in with nfc/i }));

    expect(assignMock).not.toHaveBeenCalled();
    expect(mockRedirectWithFormGet).not.toHaveBeenCalled();
    // still submits the launch action
    expect(mockOnSubmit).toHaveBeenCalledWith({
      step: IDX_STEP.LAUNCH_NFC_AUTHENTICATOR,
      isActionStep: false,
      params: { rememberMe: undefined },
    });
  });

  it('still fires the deep link on click for a non-NFC launch step', () => {
    const assignMock = jest.fn();
    jest.spyOn(global, 'location', 'get').mockReturnValue({
      href: 'http://localhost:3000',
      assign: assignMock,
    } as unknown as Location);

    render(
      <LaunchAuthenticatorButton
        uischema={buildUischema(IDX_STEP.LAUNCH_AUTHENTICATOR, {
          deviceChallengeUrl: 'https://example.okta.com/challenge?x=1',
          challengeMethod: 'CUSTOM_URI',
        }) as any}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in with nfc/i }));

    expect(assignMock).toHaveBeenCalledWith(expect.stringContaining('example.okta.com'));
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
