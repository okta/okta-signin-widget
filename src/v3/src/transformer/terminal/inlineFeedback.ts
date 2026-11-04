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

import {
  FeedbackFormElement, InfoboxElement, UISchemaElement, UISchemaLayout,
} from '../../types';
import { loc } from '../../util';
import { traverseLayout } from '../util';

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

/** Inline "Send feedback to Okta" form shown below an error view's message. */
export const createFeedbackFormElement = (): FeedbackFormElement => ({ type: 'FeedbackForm' });

/** Whether any element in `layout` (including nested layouts) matches `predicate`. */
export const containsElement = (
  layout: UISchemaLayout,
  predicate: (element: UISchemaElement) => boolean,
): boolean => {
  let found = false;
  traverseLayout({
    layout,
    predicate,
    callback: () => { found = true; },
  });
  return found;
};

/**
 * Whether the view shows an error callout. Checked on the built view rather than
 * the raw IDX messages, since transformTerminalMessages turns several cases into
 * errors itself (unexpected error, unsupported response, expired session, ...).
 */
export const hasErrorMessage = (layout: UISchemaLayout): boolean => containsElement(
  layout,
  (element) => element.type === 'InfoBox' && (element as InfoboxElement).options?.class === 'ERROR',
);

/**
 * Whether the view already has its own feedback surface (the inline form, or its
 * "Feedback sent to Okta" confirmation), so the "Send feedback" link is not shown.
 */
export const hasInlineFeedback = (layout: UISchemaLayout): boolean => containsElement(
  layout,
  (element) => element.type === 'FeedbackForm'
    || (element as InfoboxElement).options?.dataSe === 'feedback-terminal-success',
);
