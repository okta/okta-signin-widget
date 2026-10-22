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

import { useCallback } from 'preact/hooks';

import { useWidgetContext } from '../contexts';
import { getEventContext } from '../util/getEventContext';
import { SendFeedbackResult, sendFeedbackToSentry } from '../util/sentryFeedback';

/** User-supplied fields collected by the feedback UI. */
export type SendFeedbackInput = {
  /** Free-form feedback/comment typed by the user. */
  comment?: string;
  /** Optional email typed by the user. */
  email?: string;
  /**
   * Whether the user consented to attaching diagnostic logs (Session Replay).
   * When omitted, defaults to the sender's behavior (attach).
   */
  attachLogs?: boolean;
};

export type UseSendFeedback = {
  /**
   * Whether the "Send feedback" affordance should be shown. True only when
   * `feedback.enabled` is set.
   */
  enabled: boolean;
  /**
   * Emit a linked Sentry User Feedback entry for the current flow/form, with
   * the user's comment/email and (when consented) the Session Replay buffer.
   * Safe to call from any view. Accepts a plain comment string for convenience,
   * or a full input object. Resolves with `{ ok: false }` (and logs) if the
   * wrapper global is absent; never throws.
   */
  sendFeedback: (input?: string | SendFeedbackInput) => Promise<SendFeedbackResult>;
};

/**
 * Widget-level "Send feedback" entry point, invokable from ANY view (not just
 * terminal errors). Derives the fixed, low-cardinality tag context
 * (flow/formName/factor) from the current IDX transaction and delegates to
 * {@link sendFeedbackToSentry}. UI/i18n for the trigger itself lives in a
 * separate ticket (OKTA-1290987); this hook is the functional seam.
 */
export const useSendFeedback = (): UseSendFeedback => {
  const { widgetProps, idxTransaction } = useWidgetContext();
  const { feedback, flow } = widgetProps;
  const enabled = Boolean(feedback?.enabled);

  const sendFeedback = useCallback(async (
    input?: string | SendFeedbackInput,
  ): Promise<SendFeedbackResult> => {
    if (!enabled) {
      return { ok: false };
    }
    const { comment, email, attachLogs } = typeof input === 'string'
      ? { comment: input, email: undefined, attachLogs: undefined }
      : (input ?? {});
    const { formName, authenticatorKey } = getEventContext(idxTransaction);
    return sendFeedbackToSentry({
      comment,
      email,
      attachLogs,
      context: {
        flow,
        formName,
        // mapped to the `factor` tag (not `authenticatorKey`) to survive the
        // okta-prod `auth*` scrubber — see FeedbackContext.
        factor: authenticatorKey,
      },
    });
  }, [enabled, flow, idxTransaction]);

  return { enabled, sendFeedback };
};
