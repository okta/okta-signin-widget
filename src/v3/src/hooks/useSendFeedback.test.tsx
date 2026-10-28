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

import { renderHook } from '@testing-library/preact-hooks';
import { ComponentChildren, h } from 'preact';

import { WidgetContextProvider } from '../contexts';
import { IWidgetContext } from '../types';
import { useSendFeedback } from './useSendFeedback';

const mockSendFeedbackToSentry = jest.fn();
jest.mock('../util/sentryFeedback', () => ({
  sendFeedbackToSentry: (...args: unknown[]) => mockSendFeedbackToSentry(...args),
}));
jest.mock('../util/getEventContext', () => ({
  getEventContext: () => ({ formName: 'challenge-authenticator', authenticatorKey: 'okta_verify' }),
}));

const renderUseSendFeedback = (context: Partial<IWidgetContext>) => {
  const widgetContext = { widgetProps: { flow: 'default' }, ...context } as unknown as IWidgetContext;
  const wrapper = ({ children }: { children: ComponentChildren }) => (
    <WidgetContextProvider value={widgetContext}>{children}</WidgetContextProvider>
  );
  return renderHook(() => useSendFeedback(), { wrapper });
};

describe('useSendFeedback', () => {
  beforeEach(() => {
    mockSendFeedbackToSentry.mockReset().mockResolvedValue({ ok: true, eventId: 'e1' });
  });

  it('is disabled unless the widget evaluated feedback as available', async () => {
    // feedback.enabled alone is not enough: availability also requires the Sentry wrapper
    const { result } = renderUseSendFeedback({
      widgetProps: { feedback: { enabled: true } },
      feedbackAvailable: false,
    } as Partial<IWidgetContext>);

    expect(result.current?.enabled).toBe(false);
    await expect(result.current?.sendFeedback('hi')).resolves.toEqual({ ok: false });
    expect(mockSendFeedbackToSentry).not.toHaveBeenCalled();
  });

  it('sends with the input and the fixed context tags when available', async () => {
    const { result } = renderUseSendFeedback({ feedbackAvailable: true });

    expect(result.current?.enabled).toBe(true);
    await result.current?.sendFeedback({ comment: 'broken', email: 'a@b.com', attachLogs: false });

    expect(mockSendFeedbackToSentry).toHaveBeenCalledWith({
      comment: 'broken',
      email: 'a@b.com',
      attachLogs: false,
      // authenticatorKey is sent as `factor` to survive the okta-prod auth* scrubber
      context: { flow: 'default', formName: 'challenge-authenticator', factor: 'okta_verify' },
    });
  });

  it('accepts a plain comment string', async () => {
    const { result } = renderUseSendFeedback({ feedbackAvailable: true });

    await result.current?.sendFeedback('just a comment');

    expect(mockSendFeedbackToSentry).toHaveBeenCalledWith(expect.objectContaining({
      comment: 'just a comment',
      email: undefined,
      attachLogs: undefined,
    }));
  });
});
