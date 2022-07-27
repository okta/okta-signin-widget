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

import { IdxTransaction } from '@okta/okta-auth-js';
import { fireEvent, render, within } from '@testing-library/preact';
import { h } from 'preact';
import { act } from 'preact/test-utils';
import { getStubTransaction } from 'src/mocks/utils/utils';

import {
  ReminderElement, UISchemaElementComponentProps, WidgetProps,
} from '../../types';
import ReminderPrompt, { DEFAULT_TIMEOUT_MS } from './ReminderPrompt';

jest.useFakeTimers();

let transaction: IdxTransaction;
let mockProps: WidgetProps = {};
jest.mock('../../contexts', () => ({
  useWidgetContext: jest.fn().mockImplementation(
    () => ({ widgetProps: mockProps, idxTransaction: transaction }),
  ),
}));

describe('ReminderPrompt', () => {
  beforeEach(() => {
    transaction = getStubTransaction();
    mockProps = {};
  });

  it('should show prompt with working link after default timeout passes', async () => {
    const mockActionFn = jest.fn();

    const props: UISchemaElementComponentProps & { uischema: ReminderElement; } = {
      uischema: {
        type: 'Reminder',
        options: {
          ctaText: 'Didnt receive the email?',
          linkLabel: 'Send again?',
          action: mockActionFn,
        },
      },
    };

    const { container, getByRole } = render(<ReminderPrompt {...props} />);

    expect(container.firstChild).toBeNull();

    act(() => {
      jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);
    });

    expect(container.firstChild).not.toBeNull();

    const box = getByRole('alert');
    const sendAgainLink = await within(box).findByText('Send again?');

    expect(mockActionFn).not.toHaveBeenCalled();
    fireEvent.click(sendAgainLink);
    expect(mockActionFn).toHaveBeenCalledTimes(1);
    expect(mockActionFn).toHaveBeenCalledWith({ resend: true });
  });

  it('should show prompt with working link after default timeout passes and include stateHandle when stateToken is set', async () => {
    const mockStateHandle = 'abc12356789';
    mockProps = { stateToken: '123abc' };
    transaction.context = {
      ...transaction.context,
      stateHandle: mockStateHandle,
    };
    const mockActionFn = jest.fn();

    const props: UISchemaElementComponentProps & { uischema: ReminderElement; } = {
      uischema: {
        type: 'Reminder',
        options: {
          ctaText: 'Didnt receive the email?',
          linkLabel: 'Send again?',
          action: mockActionFn,
        },
      },
    };

    const { container, getByRole } = render(<ReminderPrompt {...props} />);

    expect(container.firstChild).toBeNull();

    act(() => {
      jest.advanceTimersByTime(DEFAULT_TIMEOUT_MS);
    });

    expect(container.firstChild).not.toBeNull();

    const box = getByRole('alert');
    const sendAgainLink = await within(box).findByText('Send again?');

    expect(mockActionFn).not.toHaveBeenCalled();
    fireEvent.click(sendAgainLink);
    expect(mockActionFn).toHaveBeenCalledTimes(1);
    expect(mockActionFn).toHaveBeenCalledWith({ resend: true, stateHandle: mockStateHandle });
  });

  it('should show prompt after custom timeout passes', async () => {
    const mockActionFn = jest.fn();
    const CUSTOM_TIMEOUT = 1_000 * 60 * 5;

    const props: UISchemaElementComponentProps & { uischema: ReminderElement; } = {
      uischema: {
        type: 'Reminder',
        options: {
          ctaText: 'Didnt receive the email?',
          linkLabel: 'Send again?',
          timeout: CUSTOM_TIMEOUT,
          action: mockActionFn,
        },
      },
    };

    const { container } = render(<ReminderPrompt {...props} />);

    act(() => {
      jest.advanceTimersByTime(CUSTOM_TIMEOUT);
    });

    expect(container.firstChild).not.toBeNull();
  });
});
