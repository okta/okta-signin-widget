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

import { UISchemaElement } from '@jsonforms/core';
import { NextStep } from '@okta/okta-auth-js';
import { DescriptionElement, IdxStepTransformer, TitleElement } from 'src/types';

import { IDX_STEP } from '../../constants';
import { isCredentialsApiAvailable, webAuthNAuthenticationHandler, webAuthNEnrollmentHandler } from '../../util';

const SUPPORTED_STEPS = [IDX_STEP.ENROLL_AUTHENTICATOR, IDX_STEP.CHALLENGE_AUTHENTICATOR];

const generateUISchemaElementAndInformationLabelFor = (
  nextStep: NextStep,
): { infoTextLabel: string; element: UISchemaElement; } | undefined => {
  // This verifies that the browser supports the credentials API
  // and the step is supported for this transformer
  if (!isCredentialsApiAvailable() || !SUPPORTED_STEPS.includes(nextStep.name)) {
    return undefined;
  }

  return {
    infoTextLabel: nextStep.name === IDX_STEP.ENROLL_AUTHENTICATOR
      ? 'oie.enroll.webauthn.instructions'
      : 'oie.verify.webauthn.instructions',
    // TODO: Define and extend the below type for custom renderer - OKTA-473161
    element: {
      type: 'Button',
      options: {
        onClick: nextStep.name === IDX_STEP.ENROLL_AUTHENTICATOR
          ? webAuthNEnrollmentHandler
          : webAuthNAuthenticationHandler,
        label: nextStep.name === IDX_STEP.ENROLL_AUTHENTICATOR
          ? 'oie.enroll.webauthn.save'
          : 'mfa.challenge.verify',
        submitOnLoad: true,
        showLoadingIndicator: true,
        nextStep,
      },
    },
  };
};

export const transformWebAuthNAuthenticator: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep } = transaction;
  const { uischema, data } = formBag;

  // These are hidden fields that will cause JsonForm form errors
  // if the prop/value are missing. This data is handled by webAuthNHandlers
  // and the user will not be able to proceed unless they have successfully authenticated
  // with biometric source
  data.clientData = 'clientData';
  data.attestation = 'attestation';
  data.authenticatorData = 'authenticatorData';
  data.signatureData = 'signatureData';

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

  const elementAndInformationLabel = generateUISchemaElementAndInformationLabelFor(nextStep);
  if (elementAndInformationLabel) {
    (informationalTextElement.options ?? {}).content = elementAndInformationLabel.infoTextLabel;
    uischema.elements.unshift(elementAndInformationLabel.element);
  }
  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);

  return formBag;
};
