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
  Dialog,
  Toast,
  ToastStack,
  useOdysseyDesignTokens,
} from '@okta/odyssey-react-mui';
import { Fragment, h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';

import { loc } from '../../util';
import { FeedbackFields } from './FeedbackFields';
import { FeedbackLegalText } from './FeedbackLegalText';
import { FeedbackStack } from './FeedbackStack';
import { useFeedbackForm } from './useFeedbackForm';

type SendFeedbackDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

// How long the success toast stays up before auto-hiding (ms).
const SUCCESS_TOAST_DURATION = 6000;

/**
 * "Send feedback to Okta" dialog — the any-view feedback surface. Email and
 * feedback text are optional, but Send is gated on the diagnostic-logs consent
 * checkbox (nothing is sent without consent). On a successful send the dialog
 * closes and a success Toast is shown.
 *
 * The caller owns `isOpen`/`onClose` (the trigger link); this component owns the
 * form state and the post-send Toast. The toast is wrapped in a ToastStack so it
 * pins to the viewport bottom (position:fixed, Odyssey's intended placement)
 * instead of rendering static inside the widget container.
 */
export const SendFeedbackDialog = ({ isOpen, onClose }: SendFeedbackDialogProps): h.JSX.Element => {
  const tokens = useOdysseyDesignTokens();
  const form = useFeedbackForm();
  const {
    canSubmit, submit, sent, resetSent,
  } = form;

  // When the send succeeds, close the dialog; the ToastStack (a sibling) then
  // surfaces the confirmation at the viewport bottom, outside the dismissed modal.
  useEffect(() => {
    if (sent && isOpen) {
      onClose();
    }
  }, [sent, isOpen, onClose]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  return (
    <Fragment>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={loc('feedback.dialog.title', 'login')}
        testId="feedback-dialog"
        primaryCallToActionComponent={(
          <OdyButton
            label={loc('feedback.dialog.submit', 'login')}
            variant="primary"
            isDisabled={!canSubmit}
            onClick={handleSubmit}
            testId="feedback-dialog-submit"
          />
        )}
        secondaryCallToActionComponent={(
          <OdyButton
            label={loc('feedback.cancel', 'login')}
            variant="floating"
            onClick={onClose}
            testId="feedback-dialog-cancel"
          />
        )}
      >
        <FeedbackStack>
          <FeedbackFields
            form={form}
            descriptionLabelKey="feedback.dialog.description.label"
            consentLabelKey="feedback.dialog.consent"
            testIdPrefix="feedback-dialog"
          />
          {/* Extra room between the consent checkbox and the dense legal copy. */}
          <Box marginBlockStart={tokens.Spacing2}>
            <FeedbackLegalText i18nKey="feedback.legal" />
          </Box>
        </FeedbackStack>
      </Dialog>
      {sent && (
        <ToastStack>
          <Toast
            severity="success"
            text={loc('feedback.dialog.success', 'login')}
            isVisible={sent}
            autoHideDuration={SUCCESS_TOAST_DURATION}
            onHide={resetSent}
            role="status"
            testId="feedback-dialog-success-toast"
          />
        </ToastStack>
      )}
    </Fragment>
  );
};
