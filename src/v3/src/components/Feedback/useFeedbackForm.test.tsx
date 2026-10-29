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

import { IdxTransaction } from '@okta/okta-auth-js';
import { act, renderHook } from '@testing-library/preact-hooks';
import { ComponentChildren, h } from 'preact';

import { WidgetContextProvider } from '../../contexts';
import { IWidgetContext } from '../../types';
import { useFeedbackForm } from './useFeedbackForm';

const mockSendFeedback = jest.fn();
jest.mock('../../hooks', () => ({
  useSendFeedback: () => ({ enabled: true, sendFeedback: mockSendFeedback }),
}));

const withIdentifier = (identifier?: string) => ({
  context: { user: { value: { identifier } } },
} as unknown as IdxTransaction);

const renderUseFeedbackForm = (idxTransaction?: IdxTransaction) => {
  const widgetContext = { idxTransaction, widgetProps: {} } as unknown as IWidgetContext;
  const wrapper = ({ children }: { children: ComponentChildren }) => (
    <WidgetContextProvider value={widgetContext}>{children}</WidgetContextProvider>
  );
  return renderHook(() => useFeedbackForm(), { wrapper });
};

describe('useFeedbackForm', () => {
  beforeEach(() => {
    mockSendFeedback.mockReset().mockResolvedValue({ ok: true });
  });

  it('prefills the email when the IDX identifier is an email', () => {
    const { result } = renderUseFeedbackForm(withIdentifier('user@example.com'));
    expect(result.current?.email).toBe('user@example.com');
  });

  it('does not prefill the email when the identifier is a plain username', () => {
    const { result } = renderUseFeedbackForm(withIdentifier('jdoe'));
    expect(result.current?.email).toBe('');
  });

  it('gates submit on the consent checkbox', async () => {
    const { result } = renderUseFeedbackForm();
    expect(result.current?.canSubmit).toBe(false);

    await act(async () => {
      await result.current?.submit();
    });
    expect(mockSendFeedback).not.toHaveBeenCalled();

    act(() => result.current?.setConsent(true));
    expect(result.current?.canSubmit).toBe(true);
  });

  it('sends email, comment and attachLogs from the form state', async () => {
    const { result } = renderUseFeedbackForm();
    act(() => {
      result.current?.setEmail('a@b.com');
      result.current?.setComment('it broke');
      result.current?.setConsent(true);
    });

    await act(async () => {
      await result.current?.submit();
    });

    expect(mockSendFeedback).toHaveBeenCalledWith({
      email: 'a@b.com',
      comment: 'it broke',
      attachLogs: true,
    });
    expect(result.current?.sent).toBe(true);
    expect(result.current?.submitting).toBe(false);
  });

  it('clears the comment and consent (but keeps the email) after a send', async () => {
    const { result } = renderUseFeedbackForm();
    act(() => {
      result.current?.setEmail('a@b.com');
      result.current?.setComment('it broke');
      result.current?.setConsent(true);
    });

    await act(async () => {
      await result.current?.submit();
    });

    expect(result.current?.comment).toBe('');
    expect(result.current?.consent).toBe(false);
    expect(result.current?.canSubmit).toBe(false);
    expect(result.current?.email).toBe('a@b.com');
  });

  it('still reports sent when Sentry is unavailable (best-effort send)', async () => {
    mockSendFeedback.mockResolvedValue({ ok: false });
    const { result } = renderUseFeedbackForm();
    act(() => result.current?.setConsent(true));

    await act(async () => {
      await result.current?.submit();
    });

    expect(result.current?.sent).toBe(true);
  });

  it('clears the sent flag on resetSent', async () => {
    const { result } = renderUseFeedbackForm();
    act(() => result.current?.setConsent(true));
    await act(async () => {
      await result.current?.submit();
    });

    act(() => result.current?.resetSent());
    expect(result.current?.sent).toBe(false);
  });
});
