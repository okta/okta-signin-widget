/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
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

import { IDX_STEP } from '../../constants';
import {
  DescriptionElement,
  IdxStepTransformer,
  TitleElement,
  WebAuthNButtonElement,
} from '../../types';
import {
  isCredentialsApiAvailable,
  webAuthNAuthenticationHandler,
  webAuthNEnrollmentHandler,
} from '../../util';

const SUPPORTED_STEPS = [IDX_STEP.ENROLL_AUTHENTICATOR, IDX_STEP.CHALLENGE_AUTHENTICATOR];

const generateUISchemaElementAndInformationLabelFor = (
  transaction: IdxTransaction,
): { infoTextLabel: string; element: WebAuthNButtonElement; } | undefined => {
  const { nextStep: { name } = {} } = transaction;
  // This verifies that the browser supports the credentials API
  // and the step is supported for this transformer
  if (!isCredentialsApiAvailable() || !SUPPORTED_STEPS.includes(name!)) {
    return undefined;
  }

  return {
    infoTextLabel: name === IDX_STEP.ENROLL_AUTHENTICATOR
      ? 'oie.enroll.webauthn.instructions'
      : 'oie.verify.webauthn.instructions',
    element: {
      type: 'WebAuthNSubmitButton',
      options: {
        onClick: name === IDX_STEP.ENROLL_AUTHENTICATOR
          ? () => webAuthNEnrollmentHandler(transaction)
          : () => webAuthNAuthenticationHandler(transaction),
        label: name === IDX_STEP.ENROLL_AUTHENTICATOR
          ? 'oie.enroll.webauthn.save'
          : 'mfa.challenge.verify',
        submitOnLoad: true,
        showLoadingIndicator: true,
      },
    },
  };
};

export const transformWebAuthNAuthenticator: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.enroll.webauthn.title',
    },
  };
  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'webauthn.biometric.error.factorNotSupported',
    },
  };

  const elementAndInformationLabel = generateUISchemaElementAndInformationLabelFor(
    transaction,
  );
  if (elementAndInformationLabel) {
    (informationalTextElement.options ?? {}).content = elementAndInformationLabel.infoTextLabel;
    uischema.elements.unshift(elementAndInformationLabel.element);
  }
  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);

  return formBag;
};
