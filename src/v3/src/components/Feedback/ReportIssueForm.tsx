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
  Callout,
  Heading4,
  Link as OdyLink,
  useOdysseyDesignTokens,
} from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useCallback } from 'preact/hooks';

import { loc } from '../../util';
import { FeedbackFields } from './FeedbackFields';
import { FeedbackLegalText } from './FeedbackLegalText';
import { FeedbackStack } from './FeedbackStack';
import { useFeedbackForm } from './useFeedbackForm';

type ReportIssueFormProps = {
  /** Invoked when the user clicks "Back to sign in". */
  onBackToSignIn: () => void;
};

/**
 * Crash / terminal "Report issue to Okta" inline form. Shown in place of the
 * normal view when the widget hits a fatal error. Leads with the red "Unable to
 * load page" callout, then collects optional email + a description of what the
 * user was doing, gated on the diagnostic-logs consent checkbox. After a send it
 * swaps the whole form for a green "Report sent to Okta" confirmation.
 */
export const ReportIssueForm = ({ onBackToSignIn }: ReportIssueFormProps): h.JSX.Element => {
  const tokens = useOdysseyDesignTokens();
  const form = useFeedbackForm();
  const { canSubmit, submit, sent } = form;

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const backToSignIn = (
    <OdyLink
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onBackToSignIn();
      }}
      testId="feedback-report-back"
    >
      {loc('feedback.backToSignIn', 'login')}
    </OdyLink>
  );

  if (sent) {
    return (
      <FeedbackStack>
        <Callout
          severity="success"
          role="status"
          title={loc('feedback.report.success.title', 'login')}
          text={loc('feedback.report.success.body', 'login')}
          testId="feedback-report-success"
        />
        {backToSignIn}
      </FeedbackStack>
    );
  }

  return (
    <FeedbackStack>
      <Callout
        severity="error"
        role="alert"
        title={loc('feedback.report.callout.title', 'login')}
        text={loc('feedback.report.callout.body', 'login')}
        testId="feedback-report-error"
      />

      <Heading4>{loc('feedback.report.title', 'login')}</Heading4>

      <FeedbackFields
        form={form}
        descriptionLabelKey="feedback.report.description.label"
        consentLabelKey="feedback.report.consent"
        testIdPrefix="feedback-report"
      />

      {/* Extra breathing room around the legal text: it sits between the consent
          checkbox and the submit button, and the dense multi-line copy reads as
          cramped at the base container gap alone. */}
      <Box marginBlock={tokens.Spacing2}>
        <FeedbackLegalText i18nKey="feedback.report.legal" />
      </Box>

      <OdyButton
        label={loc('feedback.report.submit', 'login')}
        variant="primary"
        isFullWidth
        isDisabled={!canSubmit}
        onClick={handleSubmit}
        testId="feedback-report-submit"
      />

      {backToSignIn}
    </FeedbackStack>
  );
};
