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

import { Input, NextStep } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import {
  FieldElement,
  FormBag,
  TransformStepFnWithOptions,
  WidgetMessage,
  WidgetProps,
} from '../../types';
import { flattenInputs, loc } from '../../util';
import { isCustomizedI18nKey } from '../i18n';
import { transformer as attributesTransformer } from './attributes';
import { transformer as typeTransformer } from './type';

type ValidationErrorTransformer = (input: Input, data: Record<string, unknown>,
  widgetProps: WidgetProps, step?: NextStep) => WidgetMessage[] | undefined;
type ValidationErrorTester = {
  tester: (value?: unknown) => boolean,
  message: () => WidgetMessage,
};

const mapUiElement = (input: Input): FieldElement => {
  const { label, name } = input;
  const fieldType = typeTransformer(input);
  const attributes = attributesTransformer(input);

  return {
    type: 'Field',
    label,
    key: name,
    options: {
      inputMeta: { ...input },
      ...fieldType?.[name],
      ...attributes,
    },
  };
};

const getValidationMessages: ValidationErrorTransformer = (
  input: Input,
  data: Record<string, unknown>,
  widgetProps: WidgetProps,
  step?: NextStep,
): WidgetMessage[] | undefined => {
  const {
    name: fieldName,
    type,
    maxLength,
    minLength,
  } = input;
  const { name } = step || {};
  const fieldValue = data[fieldName];

  // Customized i18n key support for fields
  const customizedErrorConfig = [
    { field: 'identifier', key: 'error.username.required' },
    { field: 'credentials.passcode', key: 'error.password.required' },
  ].find((obj) => obj.field === fieldName);
  const useCustomizedBlankErrorMessage = !!customizedErrorConfig && name === IDX_STEP.IDENTIFY
                                    && isCustomizedI18nKey(customizedErrorConfig.key, widgetProps);

  const validationErrorChecks: ValidationErrorTester[] = [
    {
      // Validate maxLength for string inputs that have the property set
      tester: (value?: unknown) => !!maxLength && type === 'string' && !!value && (value as string).length > maxLength,
      message: () => (
        {
          class: 'ERROR',
          message: loc('model.validation.field.string.maxLength', 'login'),
          i18n: { key: 'model.validation.field.string.maxLength' },
        }
      ),
    },
    {
      // Validate minlength for string inputs that have the property set
      tester: (value?: unknown) => !!minLength && type === 'string' && !!value && (value as string).length < minLength,
      message: () => (
        {
          class: 'ERROR',
          message: loc('model.validation.field.string.minLength', 'login'),
          i18n: { key: 'model.validation.field.string.minLength' },
        }
      ),
    },
    {
      tester: (value?: unknown) => !value && useCustomizedBlankErrorMessage,
      message: () => (
        {
          class: 'ERROR',
          // As long as message() is only ever called after tester(), we can be sure that customizedErrorConfig is defined
          message: loc(customizedErrorConfig!.key, 'login'),
          i18n: { key: customizedErrorConfig!.key },
        }
      ),
    },
    {
      // Default blank field error message should be rendered as long as no custom i18n keys are set in widget config
      tester: (value?: unknown) => !value && !useCustomizedBlankErrorMessage,
      message: () => (
        {
          class: 'ERROR',
          message: loc('model.validation.field.blank', 'login'),
          i18n: { key: 'model.validation.field.blank' },
        }
      ),
    },
  ];

  const messages: WidgetMessage[] | undefined = validationErrorChecks
    .filter(({ tester }) => (tester(fieldValue)))?.map((error) => error.message());

  return messages;
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
    .filter((input) => input.visible === true
        || (input.visible !== false && input.mutable !== false))
    .reduce((acc: FormBag, input: Input) => {
      const {
        name, required, mutable, type,
      } = input;

      // add uischema
      const uischema = mapUiElement(input);
      acc.uischema.elements = [...acc.uischema.elements, uischema];

      if (type === 'boolean' && required) {
        acc.data[name] = (input.value as unknown) === true;
      }

      // add client validation for "required" field
      // do not validate immutable fields, they will always be added to payload programatically
      if (required && mutable !== false && type !== 'object') {
        acc.dataSchema[name] = {
          validate(data) {
            // in the case of a required boolean input, just return true
            // if the backend requires the checbox val to be true, error will be displayed
            if (typeof data[name] === 'boolean') {
              return undefined;
            }
            return getValidationMessages(input, data, widgetProps, step);
          },
        };
        acc.dataSchema.fieldsToValidate.push(name);
        // Of the required fields, trim appropriately
        if (uischema.options.attributes?.inputmode === 'numeric') {
          acc.dataSchema.fieldsToTrim.push(name);
        }
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
