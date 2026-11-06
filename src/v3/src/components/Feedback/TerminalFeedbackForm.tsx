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
  Box,
  Button as OdyButton,
  Heading4,
  useOdysseyDesignTokens,
} from '@okta/odyssey-react-mui';
import { IdxTransaction } from '@okta/okta-auth-js';
import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';

import { useWidgetContext } from '../../contexts';
import { FeedbackFormElement, UISchemaElementComponent } from '../../types';
import { loc } from '../../util';
import { FeedbackFields } from './FeedbackFields';
import { FeedbackLegalText } from './FeedbackLegalText';
import { FeedbackStack } from './FeedbackStack';
import { useFeedbackForm } from './useFeedbackForm';

/**
 * Inline "Send feedback to Okta" form for error terminals (the server error +
 * "Back to sign in"). Instead of the bottom-of-view "Send feedback" link + dialog,
 * the transformer inserts this form below the error. Same fields/copy as the
 * dialog; Send is gated on the diagnostic-logs consent checkbox. A successful send
 * records the transaction it was sent from (`setFeedbackSentFor`), which re-runs
 * the transformer to collapse that view to the green confirmation + back link.
 *
 * Rendered inside the view's `<form>`: Enter in the email input is swallowed so
 * it doesn't trigger implicit submission of the (no-op) terminal form.
 */
export const TerminalFeedbackForm: UISchemaElementComponent<{
  uischema: FeedbackFormElement
}> = () => {
  const tokens = useOdysseyDesignTokens();
  const { idxTransaction, setFeedbackSentFor } = useWidgetContext();
  const form = useFeedbackForm();
  const {
    canSubmit, submit, sent, resetSent,
  } = form;
  // The view the user pressed Send on. A send can take seconds; if the view
  // changes meanwhile, the confirmation stays pinned to the original transaction
  // instead of marking the new view as sent.
  const submittedForRef = useRef<IdxTransaction | undefined>();

  useEffect(() => {
    if (!sent) {
      return;
    }
    // Consume `sent` so a later send from this (possibly reused) instance fires again.
    resetSent();
    setFeedbackSentFor(submittedForRef.current);
  }, [sent, resetSent, setFeedbackSentFor]);

  const handleSubmit = useCallback(() => {
    submittedForRef.current = idxTransaction;
    // submit never rejects (a failed send surfaces as `failed`), so no await
    submit();
  }, [idxTransaction, submit]);

  const preventImplicitSubmit = useCallback((e: h.JSX.TargetedKeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
    }
  }, []);

  return (
    // Plain div: Odyssey's Box only forwards a whitelisted prop set (no onKeyDown).
    // The keydown handler is a bubbling guard, not an interaction on the div itself.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onKeyDown={preventImplicitSubmit}
      data-se="feedback-terminal"
    >
      <FeedbackStack>
        <Heading4>{loc('feedback.dialog.title', 'login')}</Heading4>

        <FeedbackFields
          form={form}
          descriptionLabelKey="feedback.dialog.description.label"
          consentLabelKey="feedback.dialog.consent"
          testIdPrefix="feedback-terminal"
        />

        {/* Extra room between the consent checkbox and the dense legal copy. */}
        <Box marginBlock={tokens.Spacing2}>
          <FeedbackLegalText i18nKey="feedback.legal" />
        </Box>

        <OdyButton
          label={loc('feedback.dialog.submit', 'login')}
          variant="primary"
          isFullWidth
          isDisabled={!canSubmit}
          onClick={handleSubmit}
          testId="feedback-terminal-submit"
        />
      </FeedbackStack>
    </div>
  );
};
