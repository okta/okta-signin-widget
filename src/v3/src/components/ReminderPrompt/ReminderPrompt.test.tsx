/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import '@testing-library/jest-dom';

import {
  cleanup, fireEvent, render, within,
} from '@testing-library/preact';
import { h } from 'preact';
import { act } from 'preact/test-utils';

import {
  ReminderElement,
  UISchemaElementComponentProps,
} from '../../types';
import ReminderPrompt, { DEFAULT_TIMEOUT_MS } from './ReminderPrompt';

// @ts-expect-error Expected 0 arguments, but got 1
jest.useFakeTimers('modern');

const mockSubmitHook = jest.fn().mockImplementation(() => ({}));
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useOnSubmit: () => mockSubmitHook,
}));

jest.mock('../../contexts', () => ({
  useWidgetContext: () => ({
    loading: jest.fn().mockReturnValue(false)(),
  }),
}));

describe('ReminderPrompt', () => {
  beforeEach(() => {
    mockSubmitHook.mockRestore();
  });

  afterEach(() => {
    cleanup();
  });

  it('should show prompt with working link after default timeout passes', async () => {
    const step = 'currentAuthenticator-resend';
    const props: UISchemaElementComponentProps & { uischema: ReminderElement; } = {
      uischema: {
        type: 'Reminder',
        options: {
          content: 'Didnt receive the email?',
          buttonText: 'Send again?',
          step,
          actionParams: { resend: true },
          isActionStep: true,
        },
      },
    };

    const { container, getByRole } = render(<ReminderPrompt {...props} />);

    expect(container.firstChild).toBeNull();
    act(() => {
      jest.setSystemTime(Date.now() + DEFAULT_TIMEOUT_MS);
      jest.runOnlyPendingTimers();
    });

    expect(container.firstChild).not.toBeNull();

    const box = getByRole('alert');
    const sendAgainLink = await within(box).findByText('Send again?');

    expect(container).toMatchSnapshot();

    expect(mockSubmitHook).not.toHaveBeenCalled();
    fireEvent.click(sendAgainLink);
    expect(mockSubmitHook).toHaveBeenCalledTimes(1);
    expect(mockSubmitHook).toHaveBeenCalledWith({
      step,
      isActionStep: true,
      params: { resend: true },
    });
  });

  it('should show prompt with working link after default timeout passes where ctaText contains HTML', async () => {
    const step = 'currentAuthenticator-resend';
    const props: UISchemaElementComponentProps & { uischema: ReminderElement; } = {
      uischema: {
        type: 'Reminder',
        options: {
          content: "Didn't receive the email? Click <a href='#' class='send-again'>send again</a>",
          contentHasHtml: true,
          step,
          contentClassname: 'send-again',
          actionParams: { resend: true },
          isActionStep: true,
        },
      },
    };

    const { container, getByRole } = render(<ReminderPrompt {...props} />);

    expect(container.firstChild).toBeNull();

    act(() => {
      jest.setSystemTime(Date.now() + DEFAULT_TIMEOUT_MS);
      jest.runOnlyPendingTimers();
    });

    expect(container.firstChild).not.toBeNull();

    const box = getByRole('alert');
    const sendAgainLink = await within(box).findByText('send again');

    expect(container).toMatchSnapshot();

    expect(mockSubmitHook).not.toHaveBeenCalled();
    fireEvent.click(sendAgainLink);
    expect(mockSubmitHook).toHaveBeenCalledTimes(1);
    expect(mockSubmitHook).toHaveBeenCalledWith({
      step,
      isActionStep: true,
      params: { resend: true },
    });
  });

  it('should show prompt after custom timeout passes', async () => {
    const CUSTOM_TIMEOUT = 1_000 * 60 * 5;

    const props: UISchemaElementComponentProps & { uischema: ReminderElement; } = {
      uischema: {
        type: 'Reminder',
        options: {
          content: 'Didnt receive the email?',
          buttonText: 'Send again?',
          timeout: CUSTOM_TIMEOUT,
          step: 'currentAuthenticator-resend',
          actionParams: { resend: true },
          isActionStep: true,
        },
      },
    };

    const { container } = render(<ReminderPrompt {...props} />);

    expect(container).toMatchSnapshot();

    act(() => {
      jest.setSystemTime(Date.now() + CUSTOM_TIMEOUT);
      jest.runOnlyPendingTimers();
    });

    expect(container.firstChild).not.toBeNull();
  });
});
