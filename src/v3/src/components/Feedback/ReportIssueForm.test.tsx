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

import { render } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';

import { WidgetContextProvider } from '../../contexts';
import { IWidgetContext } from '../../types';
import { ReportIssueForm } from './ReportIssueForm';

const mockSendFeedback = jest.fn();
jest.mock('../../hooks', () => ({
  useSendFeedback: () => ({ enabled: true, sendFeedback: mockSendFeedback }),
}));

const renderReportIssueForm = () => {
  const onBackToSignIn = jest.fn();
  const widgetContext = { widgetProps: {} } as unknown as IWidgetContext;
  const result = render(
    <WidgetContextProvider value={widgetContext}>
      <ReportIssueForm onBackToSignIn={onBackToSignIn} />
    </WidgetContextProvider>,
  );
  return { ...result, onBackToSignIn };
};

describe('ReportIssueForm', () => {
  beforeEach(() => {
    mockSendFeedback.mockReset().mockResolvedValue({ ok: true });
  });

  it('leads with the "Unable to load page" callout and gates submit on consent', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByRole } = renderReportIssueForm();

    expect(getByTestId('feedback-report-error')).toBeInTheDocument();
    expect(getByTestId('feedback-report-submit')).toBeDisabled();

    await user.click(getByRole('checkbox'));
    expect(getByTestId('feedback-report-submit')).toBeEnabled();
  });

  it('swaps the form for the success state after sending', async () => {
    const user = userEvent.setup();
    const {
      getByTestId, getByRole, findByTestId, queryByTestId,
    } = renderReportIssueForm();

    await user.type(getByTestId('feedback-report-comment'), 'blank page');
    await user.click(getByRole('checkbox'));
    await user.click(getByTestId('feedback-report-submit'));

    expect(mockSendFeedback).toHaveBeenCalledWith(expect.objectContaining({
      comment: 'blank page',
      attachLogs: true,
    }));
    expect(await findByTestId('feedback-report-success')).toBeInTheDocument();
    expect(queryByTestId('feedback-report-error')).not.toBeInTheDocument();
    expect(queryByTestId('feedback-report-submit')).not.toBeInTheDocument();
    expect(getByTestId('feedback-report-back')).toBeInTheDocument();
  });

  it('calls onBackToSignIn from the back link', async () => {
    const user = userEvent.setup();
    const { getByTestId, onBackToSignIn } = renderReportIssueForm();

    await user.click(getByTestId('feedback-report-back'));

    expect(onBackToSignIn).toHaveBeenCalledTimes(1);
  });
});
