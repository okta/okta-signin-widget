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
import { IdxTransaction } from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import {
  DescriptionElement,
  IdxStepTransformer,
  IonFormField,
  TitleElement,
} from 'src/types';

import { removeUIElementWithScope } from '../utils';

const isPasswordRecovery = (transaction: IdxTransaction): boolean => (
  // @ts-ignore OKTA-486472 (prop is missing from interface)
  transaction.rawIdxState.recoveryAuthenticator?.value?.type === 'password'
);

export const transformSelectAuthenticatorVerify: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep } = transaction;
  const { options } = nextStep;
  const { schema, uischema } = formBag;

  const inputs = (nextStep.inputs ?? []) as IonFormField[];
  schema.required = schema.required ?? [];

  inputs.filter((input) => input.name === 'authenticator').forEach((input) => {
    schema.properties = schema.properties ?? {};
    schema.properties[input.name] = {
      type: 'object',
      enum: options?.map((option: IdxOption) => ({
        label: option.label,
        value: {
          key: option.value,
          label: 'oie.verify.authenticator.button.text',
        },
      })),
    };

    // This is required to pass the Tester for Authenticator list control
    const targetScope = `#/properties/${input.name}`;
    uischema.elements = removeUIElementWithScope(
      targetScope,
      uischema.elements as ControlElement[],
    );
    uischema.elements.push({
      type: 'Control',
      scope: targetScope,
      label: '',
      options: {
        format: 'AuthenticatorList',
      },
    } as ControlElement);
  });

  const isPwRecovery = isPasswordRecovery(transaction);
  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: isPwRecovery
        ? 'password.reset.title.generic'
        : 'oie.select.authenticators.verify.title',
    },
  };
  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: isPwRecovery
        ? 'oie.password.reset.verification'
        : 'oie.select.authenticators.verify.subtitle',
    },
  };

  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);

  return formBag;
};
