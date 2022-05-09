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

import { ControlElement } from '@jsonforms/core';
import { IdxFeature } from '@okta/okta-auth-js';
import { Choice, IdxMethod, IonFormField } from 'src/types';
import { FormBag, IdxTransactionWithNextStep } from 'src/types/jsonforms';

import { AUTHENTICATOR_KEY, IDX_STEP } from '../constants';
import { hasMinAuthenticatorOptions } from '../util';
import { transformInputs } from './field';
import { getButtonControls } from './getButtonControls';
import TransformerMap from './idxTransformerMapping';
import { transformCustomMessages } from './messages/transformCustomMessages';
import { transformPoll } from './poll';
import { remediationContainsStep } from './utils';

const OPTION_EXCLUDED_STEPS = [
  IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
  IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
  IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK,
];

export default (transaction: IdxTransactionWithNextStep): FormBag => {
  const { nextStep } = transaction;

  const enabledFeatures = transaction?.enabledFeatures;
  const { authenticator, name: stepName, options } = nextStep;

  // TODO ensure type consistency between Input and IonFormField
  const inputs = (nextStep.inputs ?? []) as IonFormField[];

  // get formbag from ion adapter
  // TODO: remove this condition once we implement this change in OKTA-486109
  const { schema, uischema, data } = options && stepName !== IDX_STEP.SELECT_AUTHENTICATOR_UNLOCK
    ? transformInputs(nextStep.inputs?.slice(1))
    : transformInputs(nextStep.inputs?.slice(0));

  // TODO: We may need to revist this as more flows are added
  // see thread here: https://github.com/okta/siw-next/pull/67#discussion_r817100682
  // handle options as schema.enum
  if (options && inputs.length && !OPTION_EXCLUDED_STEPS.includes(stepName)) {
    schema.properties = schema.properties ?? {};
    schema.required = schema.required ?? [];

    const [{ name, label, required }] = inputs;

    // TODO opt.value may be { IdxForm } rather than string
    schema.properties[name] = {
      type: 'string',
      enum: options.map((opt) => opt.value),
    };

    if (required) {
      schema.required.unshift(name);
    }

    const element: ControlElement = {
      type: 'Control',
      label: label || name,
      scope: `#/properties/${name}`,
      options: {
        format: 'radio',
        choices: options.map((opt) => ({
          key: opt.value,
          value: opt.label,
        } as Choice)),
      },
    };

    // prepend
    uischema.elements.unshift(element);
  }

  // handle authenticator options
  const formBag = { schema, uischema, data };

  // Handles polling automatically
  transformPoll(transaction, formBag);

  const customTransformer = TransformerMap[stepName]?.[
    authenticator?.key || AUTHENTICATOR_KEY.DEFAULT
  ];
  const updatedFormBag = customTransformer?.transform?.(transaction, formBag) ?? formBag;

  const isIdentityStep = remediationContainsStep(transaction.neededToProceed, IDX_STEP.IDENTIFY);
  // TODO: Remove buttons from here and add to custom transformers - OKTA-479077
  const stepWithSubmit = customTransformer?.buttonConfig?.showDefaultSubmit ?? true;
  const stepWithCancel = customTransformer?.buttonConfig?.showDefaultCancel
    ?? (transaction.actions?.cancel && nextStep.name !== IDX_STEP.IDENTIFY);
  const stepWithRegister = enabledFeatures?.includes(IdxFeature.REGISTRATION) && isIdentityStep;
  const stepWithForgotPassword = enabledFeatures?.includes(IdxFeature.PASSWORD_RECOVERY)
    && isIdentityStep;
  const stepWithSignInWithFastPass = remediationContainsStep(
    transaction.neededToProceed,
    IDX_STEP.LAUNCH_AUTHENTICATOR,
  );
  const stepWithUnlockAccount = enabledFeatures?.includes(IdxFeature.ACCOUNT_UNLOCK)
    && isIdentityStep;
  const verifyWithOther = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    1, // Min # of auth options for link to display
  );
  const backToAuthList = hasMinAuthenticatorOptions(
    transaction,
    IDX_STEP.SELECT_AUTHENTICATOR_ENROLL,
    0, // Min # of auth options for link to display
  );

  const idxMethod: IdxMethod = 'proceed';
  const { elements, properties } = getButtonControls(
    {
      stepWithSubmit,
      stepWithCancel,
      stepWithRegister,
      stepWithForgotPassword,
      stepWithSignInWithFastPass,
      stepWithUnlockAccount,
      backToAuthList,
      verifyWithOther,
      idxMethod,
    },
  );

  updatedFormBag.schema.properties = {
    ...updatedFormBag.schema.properties,
    ...properties,
  };

  updatedFormBag.uischema.elements.push(...elements);

  // Handles custom messages
  transformCustomMessages(transaction, updatedFormBag);

  return updatedFormBag;
};
