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

import { IdxTransaction, Input, NextStep } from '@okta/okta-auth-js';

import {
  FieldElement, FormBag, StepTransformer, TranslationInfo, UISchemaElement,
} from '../../types';
import { flattenInputs, loc } from '../../util';
import { createForm } from '../utils';
import { transformer as attributesTransformer } from './attributes';
import { transformer as typeTransformer } from './type';

const getAdditionalUITranslations = (name: string | undefined): TranslationInfo[] | undefined => {
  if (!name?.endsWith('phoneNumber')) {
    return undefined;
  }
  return [
    {
      fieldName: 'country',
      i18nKey: 'country.label',
      value: loc('country.label', 'login'),
    },
    {
      fieldName: 'extension',
      i18nKey: 'phone.extention.label',
      value: loc('phone.extention.label', 'login'),
    },
  ];
};

const mapUiElement = (input: Input): UISchemaElement => {
  const { name, label } = input;
  const fieldType = typeTransformer(input);
  const attributes = attributesTransformer(input);

  return {
    type: 'Control',
    label,
    name,
    options: {
      inputMeta: { ...input },
      ...fieldType?.[input.name],
      ...attributes,
      translations: getAdditionalUITranslations(name),
    },
  } as UISchemaElement;
};

export const transformStepInputs: StepTransformer = (step?: NextStep): FormBag => {
  const formbag = createForm();
  if (!step) {
    return formbag;
  }

  const { inputs = [] } = step;

  return inputs
    .reduce((acc: Input[], input: Input) => {
      const flattenedInputs = flattenInputs(input);
      return [...acc, ...flattenedInputs];
    }, [])
    .filter((input) => input.visible !== false && input.mutable !== false)
    .reduce((acc: FormBag, input: Input) => {
      const { name, required, mutable } = input;

      // add uischema
      const uischema = mapUiElement(input);
      acc.uischema.elements = [...acc.uischema.elements, uischema];

      // add client validation for "required" field
      // do not validate immutable fields, they will always be added to payload programatically
      if (required && mutable !== false) {
        acc.dataSchema[name] = {
          validate(data) {
            const isValid = !!data[name];
            return isValid ? undefined : {
              i18n: {
                key: 'model.validation.field.blank',
              },
            };
          },
        };
      }

      // populate all input keys to guide auth-js how to proceed in the remediation engine
      // TODO: logic here can be removed once authjs can handle auto proceed without hints from the downstream
      const { options: { type } } = uischema as FieldElement;
      let defaultValue;
      if (type === 'string') {
        defaultValue = '';
      }
      if (type === 'boolean') {
        defaultValue = false;
      }
      acc.data[name] = defaultValue;
      return acc;
    }, formbag);
};

export const transformInputs = (
  transaction: IdxTransaction,
  stepName: string,
): FormBag => {
  const { availableSteps = [], nextStep = {} as NextStep } = transaction;
  const step = nextStep.name === stepName
    ? nextStep
    : availableSteps.find((s) => s.name === stepName);
  return transformStepInputs(step);
};
