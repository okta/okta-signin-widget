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

import { useCallback, useMemo, useState } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { useSendFeedback } from '../../hooks';

export type UseFeedbackForm = {
  email: string;
  setEmail: (v: string) => void;
  comment: string;
  setComment: (v: string) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  /** True once the diagnostic-logs consent checkbox is ticked (and not sending). */
  canSubmit: boolean;
  /** True while a send is in flight. */
  submitting: boolean;
  /** True after a successful send (drives the success state). */
  sent: boolean;
  /** Clear the `sent` flag (e.g. when the success toast auto-hides). */
  resetSent: () => void;
  /** Fire the send; no-ops if consent isn't given or a send is in flight. */
  submit: () => Promise<void>;
};

/**
 * Shared state + submit logic for both feedback surfaces (crash "Report issue"
 * form and the "Send feedback" dialog). Prefills the email from the current IDX
 * identifier when available, gates submit on the diagnostic-logs consent
 * checkbox, and delegates the actual send to {@link useSendFeedback}. The consent
 * checkbox also maps to `attachLogs` (whether the Session Replay buffer is attached).
 */
export const useFeedbackForm = (): UseFeedbackForm => {
  const { idxTransaction } = useWidgetContext();
  const { sendFeedback } = useSendFeedback();

  const prefilledEmail = useMemo(() => {
    const identifier = idxTransaction?.context?.user?.value?.identifier;
    // Only prefill when it looks like an email; identifiers can be usernames.
    return typeof identifier === 'string' && identifier.includes('@') ? identifier : '';
  }, [idxTransaction]);

  const [email, setEmail] = useState<string>(prefilledEmail);
  const [comment, setComment] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);

  const canSubmit = useMemo(() => {
    if (submitting) {
      return false;
    }
    // Both surfaces require the diagnostic-logs consent checkbox before sending.
    return consent;
  }, [consent, submitting]);

  const submit = useCallback(async () => {
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    try {
      await sendFeedback({
        email,
        comment,
        // The consent checkbox is what authorizes attaching diagnostic logs
        // (Session Replay) — in both surfaces.
        attachLogs: consent,
      });
      // Best-effort send: show the success state regardless of the Sentry
      // result so the user always gets closure (a missing wrapper logs loudly
      // to the console but must not strand the user on a spinner).
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, sendFeedback, email, comment, consent]);

  const resetSent = useCallback(() => setSent(false), []);

  return {
    email,
    setEmail,
    comment,
    setComment,
    consent,
    setConsent,
    canSubmit,
    submitting,
    sent,
    resetSent,
    submit,
  };
};
