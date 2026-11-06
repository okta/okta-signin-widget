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
  Callout,
  Checkbox as OdyCheckbox,
  CheckboxGroup,
  TextField,
} from '@okta/odyssey-react-mui';
import { h } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

import { loc } from '../../util';
import { REPLAY_BLOCK_ATTRIBUTE } from './constants';
import { FeedbackStack } from './FeedbackStack';
import { UseFeedbackForm } from './useFeedbackForm';

type FeedbackFieldsProps = {
  form: UseFeedbackForm;
  /** i18n key for the free-text area label (differs per surface). */
  descriptionLabelKey: string;
  /** i18n key for the consent checkbox label (differs per surface). */
  consentLabelKey: string;
  /** testId prefix so the two surfaces get distinct selectors. */
  testIdPrefix: string;
};

/**
 * The three shared inputs both feedback surfaces render: optional Email, a
 * multiline free-text area, and the diagnostic-logs consent checkbox, plus the
 * "couldn't send" message after a failed send. Labels that differ between the
 * inline form and the dialog are passed in; the field wiring itself is identical.
 */
export const FeedbackFields = ({
  form,
  descriptionLabelKey,
  consentLabelKey,
  testIdPrefix,
}: FeedbackFieldsProps): h.JSX.Element => {
  const {
    email, setEmail, comment, setComment, consent, setConsent, failed,
  } = form;

  // MUI's autosize rewrites the inline style of both of the multiline field's
  // textareas (the field and its hidden mirror) as the user types. Odyssey's
  // TextField takes no extra props for them, so tag them from here. Session
  // Replay processes mutations asynchronously, after this runs.
  const commentFieldRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    commentFieldRef.current?.querySelectorAll('textarea')
      .forEach((textarea) => textarea.setAttribute(REPLAY_BLOCK_ATTRIBUTE, ''));
  }, []);

  return (
    <FeedbackStack>
      {failed && (
        <Callout
          severity="error"
          role="alert"
          text={loc('feedback.error', 'login')}
          testId={`${testIdPrefix}-error`}
        />
      )}
      <TextField
        label={loc('feedback.email.label', 'login')}
        type="email"
        autoCompleteType="email"
        value={email}
        isOptional
        onChange={(e) => setEmail((e.currentTarget as HTMLInputElement).value)}
        testId={`${testIdPrefix}-email`}
      />
      <div ref={commentFieldRef}>
        <TextField
          label={loc(descriptionLabelKey, 'login')}
          // the comment is sent as typed (not scrubbed client-side)
          hint={loc('feedback.description.hint', 'login')}
          isMultiline
          isOptional
          value={comment}
          onChange={(e) => setComment((e.currentTarget as HTMLTextAreaElement).value)}
          testId={`${testIdPrefix}-comment`}
        />
      </div>
      <CheckboxGroup
        id={`${testIdPrefix}-consent-group`}
        label=""
      >
        <OdyCheckbox
          label={loc(consentLabelKey, 'login')}
          isChecked={consent}
          onChange={(e) => setConsent((e.currentTarget as HTMLInputElement).checked)}
          testId={`${testIdPrefix}-consent`}
        />
      </CheckboxGroup>
    </FeedbackStack>
  );
};
