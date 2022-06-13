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

import '@testing-library/jest-dom';

import { ControlProps } from '@jsonforms/core';
import { fireEvent, render, within } from '@testing-library/preact';
import { h } from 'preact';
import { act } from 'preact/test-utils';

import ReminderPromptControl, { DEFAULT_TIMEOUT_MS } from './ReminderPromptControl';

jest.useFakeTimers();

describe('ReminderPromptControl', () => {
  it('should show prompt with working link after default timeout passes', async () => {
    const mockActionFn = jest.fn();

    const props: ControlProps = {
      label: '',
      uischema: {
        type: 'Control',
        scope: '',
        options: {
          action: mockActionFn,
        },
      },
      data: {},
      errors: '',
      rootSchema: {},
      id: '',
      schema: {},
      enabled: true,
      visible: true,
      path: '',
      handleChange: () => {},
    };

    const { container, getByRole } = render(<ReminderPromptControl {...props} />);

    expect(container.firstChild).toBeNull();

    act(() => {
      jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);
    });

    expect(container.firstChild).not.toBeNull();

    const box = getByRole('alert');
    const sendAgainLink = within(box).getByText('email.button.resend');

    expect(mockActionFn).not.toHaveBeenCalled();
    fireEvent.click(sendAgainLink);
    expect(mockActionFn).toHaveBeenCalledTimes(1);
    expect(mockActionFn).toHaveBeenCalledWith({ resend: true });
  });

  it('should show prompt after custom timeout passes', async () => {
    const mockActionFn = jest.fn();
    const CUSTOM_TIMEOUT = 1_000 * 60 * 5;

    const props: ControlProps = {
      label: '',
      uischema: {
        type: 'Control',
        scope: '',
        options: {
          timeout: CUSTOM_TIMEOUT,
          action: mockActionFn,
        },
      },
      data: {},
      errors: '',
      rootSchema: {},
      id: '',
      schema: {},
      enabled: true,
      visible: true,
      path: '',
      handleChange: () => {},
    };

    const { container } = render(<ReminderPromptControl {...props} />);

    act(() => {
      jest.advanceTimersByTime(CUSTOM_TIMEOUT);
    });

    expect(container.firstChild).not.toBeNull();
  });
});
