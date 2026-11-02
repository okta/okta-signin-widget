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
  /** True after a send the sender confirmed (`ok: true`); drives the success state. */
  sent: boolean;
  /** True after a send that wasn't confirmed; drives the "couldn't send" message. */
  failed: boolean;
  /** Clear the `sent` flag (e.g. when the success toast auto-hides). */
  resetSent: () => void;
  /** Fire the send; no-ops if consent isn't given or a send is in flight. Never rejects. */
  submit: () => Promise<void>;
};

/**
 * Shared state + submit logic for both feedback surfaces (the inline form on
 * message-only views and the "Send feedback" dialog). Gates submit on the
 * diagnostic-logs consent checkbox and delegates the actual send to
 * {@link useSendFeedback}. The consent checkbox also maps to `attachLogs`
 * (whether the Session Replay buffer is attached).
 *
 * The email starts empty: it's optional PII, so the user types it only if they
 * want a reply (it is not prefilled from the IDX identifier).
 */
export const useFeedbackForm = (): UseFeedbackForm => {
  const { sendFeedback } = useSendFeedback();

  const [email, setEmail] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [consent, setConsent] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);

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
    setFailed(false);
    let ok = false;
    try {
      ({ ok } = await sendFeedback({
        email,
        comment,
        // The consent checkbox is what authorizes attaching diagnostic logs
        // (Session Replay) — in both surfaces.
        attachLogs: consent,
      }));
    } catch {
      // sendFeedback never throws; treated as a failed send if it ever does
    } finally {
      setSubmitting(false);
    }
    if (!ok) {
      // Don't claim "Feedback sent" when the sender couldn't send it; keep the
      // input so the user can try again.
      setFailed(true);
      return;
    }
    setSent(true);
    // Clear the comment and consent so a re-opened dialog (it stays mounted)
    // can't re-send the old text or re-attach logs without a fresh consent.
    // Only clear the comment if it's still what was sent, so text typed while
    // the send was in flight survives. The email stays.
    setComment((current) => (current === comment ? '' : current));
    setConsent(false);
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
    failed,
    resetSent,
    submit,
  };
};
