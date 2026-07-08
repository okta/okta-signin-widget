/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  IdxStepTransformer,
  IWidgetContext,
  LinkElement,
  TitleElement,
} from '../../types';
import { hasMinAuthenticatorOptions, loc, updateTransactionWithNextStep } from '../../util';
import { getUIElementWithName } from '../utils';

/**
 * NFC PIN verification transformer.
 * Renders the "Enter PIN" screen after NFC card has been verified.
 * Footer: "Forgot PIN?" + "Verify with something else" + "Back to sign in"
 */
export const transformNfcPinVerify: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.nfc_pin.verify.title', 'login'),
    },
  };

  const buttonElement: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  // "Forgot PIN?" link (uses recover action)
  const recoverStep = transaction.availableSteps
    ?.find(({ name }) => name === 'currentAuthenticatorEnrollment-recover');
  const forgotPinLink: LinkElement | undefined = recoverStep ? {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('oie.nfc_pin.forgot.pin', 'login'),
      isActionStep: true,
      step: recoverStep.name,
    },
  } : undefined;

  // "Verify with something else" link
  const hasMinAuthOptions = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    1,
  );
  const selectVerifyStep = transaction.availableSteps
    ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE);
  const switchAuthLink: LinkElement | undefined = (selectVerifyStep && hasMinAuthOptions) ? {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('oie.verification.switch.authenticator', 'login'),
      step: selectVerifyStep.name || '',
      onClick: (widgetContext?: IWidgetContext): unknown => {
        if (typeof widgetContext === 'undefined' || typeof selectVerifyStep === 'undefined') {
          return;
        }
        updateTransactionWithNextStep(transaction, selectVerifyStep, widgetContext);
      },
    },
  } : undefined;

  // "Back to sign in" link
  const cancelLink: LinkElement = {
    type: 'Link',
    contentType: 'footer',
    options: {
      label: loc('goback', 'login'),
      isActionStep: true,
      step: 'cancel',
    },
  };

  // Override the passcode field label
  const passcodeElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements as FieldElement[],
  ) as FieldElement;
  if (passcodeElement) {
    passcodeElement.label = loc('oie.nfc_pin.verify.pinLabel', 'login');
    passcodeElement.options = {
      ...passcodeElement.options,
      attributes: {
        ...passcodeElement.options?.attributes,
        inputmode: 'numeric',
      },
    };
  }

  uischema.elements.unshift(titleElement);
  uischema.elements.push(buttonElement);
  if (forgotPinLink) {
    uischema.elements.push(forgotPinLink);
  }
  if (switchAuthLink) {
    uischema.elements.push(switchAuthLink);
  }
  uischema.elements.push(cancelLink);

  return formBag;
};
