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

import { FeedbackFormElement, InfoboxElement } from '../../types';
import { loc } from '../../util';

/** Inline-feedback state passed to the terminal / unhandled-error transformers. */
export type InlineFeedbackOptions = {
  /** `feedback.enabled` AND the Okta Sentry wrapper is present (see isFeedbackAvailable). */
  feedbackAvailable?: boolean;
  /** The inline form on this view was sent successfully. */
  feedbackSent?: boolean;
};

export const createFeedbackSuccessElement = (): InfoboxElement => ({
  type: 'InfoBox',
  options: {
    message: {
      class: 'SUCCESS',
      message: loc('feedback.dialog.success', 'login'),
      i18n: { key: 'feedback.dialog.success' },
    },
    class: 'SUCCESS',
    dataSe: 'feedback-terminal-success',
  },
});

/** Inline "Send feedback to Okta" form shown below a message-only view's message. */
export const createFeedbackFormElement = (): FeedbackFormElement => ({ type: 'FeedbackForm' });
