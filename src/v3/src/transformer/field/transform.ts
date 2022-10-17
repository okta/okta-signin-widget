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

import { IdxMessage, Input, NextStep } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import {
  FieldElement,
  FormBag,
  TransformStepFnWithOptions,
  WidgetProps,
} from '../../types';
import { flattenInputs, loc } from '../../util';
import { isCustomizedI18nKey } from '../i18n';
import { transformer as attributesTransformer } from './attributes';
import { transformer as typeTransformer } from './type';

const mapUiElement = (input: Input): FieldElement => {
  const { label } = input;
  const fieldType = typeTransformer(input);
  const attributes = attributesTransformer(input);

  return {
    type: 'Field',
    label,
    key: input.name,
    options: {
      inputMeta: { ...input },
      ...fieldType?.[input.name],
      ...attributes,
    },
  };
};

const getValidationMessages = (
  fieldName: string,
  widgetProps: WidgetProps,
  step?: NextStep,
): IdxMessage[] => {
  const { name } = step || {};
  const errorMessage: IdxMessage = {
    class: 'ERROR',
    message: loc('model.validation.field.blank', 'login'),
    i18n: { key: 'model.validation.field.blank' },
  };
  const customizedErrorConfig = [
    { field: 'identifier', key: 'error.username.required' },
    { field: 'credentials.passcode', key: 'error.password.required' },
  ].find((obj) => obj.field === fieldName);
  if (customizedErrorConfig
    && name === IDX_STEP.IDENTIFY
    && isCustomizedI18nKey(customizedErrorConfig.key, widgetProps)) {
    errorMessage.message = loc(customizedErrorConfig.key, 'login');
    errorMessage.i18n.key = customizedErrorConfig.key;
  }
  return [errorMessage];
};

export const transformStepInputs = (
  formbag: FormBag,
  widgetProps: WidgetProps,
  step?: NextStep,
): FormBag => {
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
      const {
        name, required, mutable, type,
      } = input;

      // add uischema
      const uischema = mapUiElement(input);
      acc.uischema.elements = [...acc.uischema.elements, uischema];

      if (type === 'boolean' && required) {
        acc.data[name] = (input.value as unknown as boolean) === true;
      }

      // add client validation for "required" field
      // do not validate immutable fields, they will always be added to payload programatically
      if (required && mutable !== false && type !== 'object') {
        acc.dataSchema[name] = {
          validate(data) {
            // in the case of a required boolean input, just return true
            // if the backend requires the checbox val to be true, error will be displayed
            if (typeof data[name] === 'boolean' || !!data[name]) {
              return undefined;
            }
            return getValidationMessages(name, widgetProps, step);
          },
        };
        acc.dataSchema.fieldsToValidate.push(name);
      }

      return acc;
    }, formbag);
};

export const transformFields: TransformStepFnWithOptions = ({
  transaction, step: stepName, widgetProps,
}) => (formbag) => {
  const { availableSteps = [], nextStep = {} as NextStep } = transaction;
  const step = nextStep.name === stepName
    ? nextStep
    : availableSteps.find((s) => s.name === stepName);
  return transformStepInputs(formbag, widgetProps, step);
};
