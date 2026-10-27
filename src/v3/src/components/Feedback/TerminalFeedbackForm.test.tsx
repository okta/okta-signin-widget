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

import { render, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';

import { WidgetContextProvider } from '../../contexts';
import { FeedbackFormElement, IWidgetContext } from '../../types';
import { TerminalFeedbackForm } from './TerminalFeedbackForm';

const mockSendFeedback = jest.fn();
jest.mock('../../hooks', () => ({
  useSendFeedback: () => ({ enabled: true, sendFeedback: mockSendFeedback }),
}));

const uischema: FeedbackFormElement = { type: 'FeedbackForm' };

const pressEnter = (el: HTMLElement): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
};

const renderInForm = () => {
  const setTerminalFeedbackSent = jest.fn();
  const widgetContext = {
    widgetProps: {},
    setTerminalFeedbackSent,
  } as unknown as IWidgetContext;
  const result = render(
    <WidgetContextProvider value={widgetContext}>
      {/* Rendered inside the terminal view's <form> in the real widget. */}
      <form onSubmit={(e) => e.preventDefault()}>
        <TerminalFeedbackForm uischema={uischema} />
      </form>
    </WidgetContextProvider>,
  );
  return { ...result, setTerminalFeedbackSent };
};

describe('TerminalFeedbackForm', () => {
  beforeEach(() => {
    mockSendFeedback.mockReset().mockResolvedValue({ ok: true });
  });

  it('renders the dialog-copy heading, fields and a disabled submit', () => {
    const { getByText, getByTestId } = renderInForm();

    expect(getByText('feedback.dialog.title')).toBeInTheDocument();
    expect(getByTestId('feedback-terminal-email')).toBeInTheDocument();
    expect(getByTestId('feedback-terminal-comment')).toBeInTheDocument();
    expect(getByTestId('feedback-terminal-submit')).toBeDisabled();
  });

  it('enables submit only after consent is checked', async () => {
    const user = userEvent.setup();
    const { getByRole, getByTestId } = renderInForm();

    await user.click(getByRole('checkbox'));

    expect(getByTestId('feedback-terminal-submit')).toBeEnabled();
  });

  // Browsers implicitly submit the surrounding terminal <form> on Enter in a
  // single-line input (checkboxes don't count). user-event's emulation of that
  // also counts the checkbox, so assert the guard cancels the keydown directly.
  it('cancels Enter in the email field so the terminal form is not submitted', () => {
    const { getByTestId } = renderInForm();
    const email = getByTestId('feedback-terminal-email');

    const enter = pressEnter(email);

    expect(enter.defaultPrevented).toBe(true);
  });

  it('does not cancel Enter in the description textarea (newlines still work)', () => {
    const { getByTestId } = renderInForm();
    const comment = getByTestId('feedback-terminal-comment');

    const enter = pressEnter(comment);

    expect(enter.defaultPrevented).toBe(false);
  });

  it('sends the feedback and flips setTerminalFeedbackSent on success', async () => {
    const user = userEvent.setup();
    const { getByRole, getByTestId, setTerminalFeedbackSent } = renderInForm();

    await user.type(getByTestId('feedback-terminal-comment'), 'stuck here');
    await user.click(getByRole('checkbox'));
    await user.click(getByTestId('feedback-terminal-submit'));

    expect(mockSendFeedback).toHaveBeenCalledWith(expect.objectContaining({
      comment: 'stuck here',
      attachLogs: true,
    }));
    await waitFor(() => expect(setTerminalFeedbackSent).toHaveBeenCalledWith(true));
  });
});
