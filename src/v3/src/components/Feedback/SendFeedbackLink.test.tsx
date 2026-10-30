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
import { IWidgetContext } from '../../types';
import { SendFeedbackLink } from './SendFeedbackLink';

const mockSendFeedback = jest.fn();
let mockEnabled = true;
jest.mock('../../hooks', () => ({
  useSendFeedback: () => ({ enabled: mockEnabled, sendFeedback: mockSendFeedback }),
}));

const renderLink = () => {
  const widgetContext = { widgetProps: {} } as unknown as IWidgetContext;
  return render(
    <WidgetContextProvider value={widgetContext}>
      <SendFeedbackLink />
    </WidgetContextProvider>,
  );
};

describe('SendFeedbackLink + SendFeedbackDialog', () => {
  beforeEach(() => {
    mockEnabled = true;
    mockSendFeedback.mockReset().mockResolvedValue({ ok: true });
  });

  it('renders nothing when feedback is disabled', () => {
    mockEnabled = false;
    const { queryByTestId } = renderLink();

    expect(queryByTestId('send-feedback-link')).not.toBeInTheDocument();
  });

  it('opens the dialog from the link and closes it on Cancel', async () => {
    const user = userEvent.setup();
    const { getByTestId, findByTestId, queryByTestId } = renderLink();

    expect(queryByTestId('feedback-dialog')).not.toBeInTheDocument();
    await user.click(getByTestId('send-feedback-link'));
    expect(await findByTestId('feedback-dialog')).toBeInTheDocument();
    expect(getByTestId('feedback-dialog-submit')).toBeDisabled();

    await user.click(getByTestId('feedback-dialog-cancel'));
    await waitFor(() => expect(queryByTestId('feedback-dialog')).not.toBeInTheDocument());
    expect(mockSendFeedback).not.toHaveBeenCalled();
  });

  it('sends, closes the dialog and shows the success toast', async () => {
    const user = userEvent.setup();
    const {
      getByTestId, findByTestId, getByRole, queryByTestId,
    } = renderLink();

    await user.click(getByTestId('send-feedback-link'));
    await findByTestId('feedback-dialog');
    await user.type(getByTestId('feedback-dialog-comment'), 'confusing step');
    await user.click(getByRole('checkbox'));
    await user.click(getByTestId('feedback-dialog-submit'));

    expect(mockSendFeedback).toHaveBeenCalledWith(expect.objectContaining({
      comment: 'confusing step',
      attachLogs: true,
    }));
    expect(await findByTestId('feedback-dialog-success-toast')).toBeInTheDocument();
    await waitFor(() => expect(queryByTestId('feedback-dialog')).not.toBeInTheDocument());
  });
});
