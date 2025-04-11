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

import {
  APIError, FieldError, IdxMessage, Input,
} from '@okta/okta-auth-js';
import { StateUpdater } from 'preact/hooks';

import { RegistrationElementSchema, WidgetMessage } from '../../types';
import { flattenInputs } from '../flattenInputs';
import { loc } from '../locUtil';
import { resetMessagesToInputs } from '../resetMessagesToInputs';

type RegistrationFieldError = FieldError & { property: string };

export const convertIdxInputsToRegistrationSchema = (
  inputs: Input[],
): RegistrationElementSchema[] => (
  inputs.reduce((acc: Input[], input: Input) => {
    const flattenedInputs = flattenInputs(input);
    return [...acc, ...flattenedInputs];
  }, []).map((flattenedInput: Input) => ({
    ...flattenedInput,
    'label-top': true,
    'data-se': flattenedInput.name,
    wide: true,
  } as RegistrationElementSchema))
);

export const convertRegistrationSchemaToIdxInputs = (
  schema: RegistrationElementSchema[],
  idxInputs: Input[],
): void => {
  schema.forEach((schemaEle: RegistrationElementSchema) => {
    if (schemaEle.name?.includes('.')) {
      // nested object (only go one level deep)
      const [schemaGroupName, schemaGrpFieldName] = schemaEle.name.split('.');
      const inputGroupIndex = idxInputs.findIndex(({ name }) => name === schemaGroupName);
      if (inputGroupIndex !== -1 && Array.isArray(idxInputs[inputGroupIndex]?.value)) {
        // Existing input
        const inputGroupFieldIndex = (
          idxInputs[inputGroupIndex]?.value as Input[]
        )?.findIndex(({ name }) => name === schemaGrpFieldName);
        if (inputGroupFieldIndex !== -1 && Array.isArray(idxInputs[inputGroupIndex].value)) {
          // Update existing field
          const srcObj = (idxInputs[inputGroupIndex].value as Input[])[inputGroupFieldIndex];
          Object.assign(srcObj, { ...schemaEle, name: schemaGrpFieldName });
        } else {
          // Add new field
          const schemaInputField = { ...schemaEle, name: schemaGrpFieldName };
          (idxInputs[inputGroupIndex].value as Record<string, unknown>[]).push(schemaInputField);
        }
      } else {
        // New top level input
        idxInputs.push({
          name: schemaGroupName,
          type: 'object',
          required: schemaEle.required,
          // @ts-expect-error Registration Schema Element has extra fields that are not in Input
          value: { ...schemaEle, name: schemaGrpFieldName },
        });
      }
    } else {
      // not nested
      const existFieldIdx = idxInputs.findIndex(({ name }) => name === schemaEle.name);
      if (existFieldIdx !== -1) {
        // Existing Field (modify)
        Object.assign(idxInputs[existFieldIdx], schemaEle);
      } else {
        // New Field (create)
        // @ts-expect-error Registration Schema Element has extra fields that are not in Input
        idxInputs.push(schemaEle);
      }
    }
  });
};

export const triggerRegistrationErrorMessages = (
  error: APIError,
  inputs: Input[],
  setMessage: StateUpdater<IdxMessage | undefined>,
): void => {
  if (Array.isArray(error.errorCauses)) {
    // field level error messages
    const messagesByField: Record<string, WidgetMessage[]> = error.errorCauses
      .reduce((acc, err) => {
        const { errorSummary, property } = err as RegistrationFieldError;
        return {
          ...acc,
          [property]: [{ class: 'ERROR', message: errorSummary }],
        };
      }, {});
    resetMessagesToInputs(inputs, messagesByField);
  }

  setMessage({
    class: 'ERROR',
    i18n: { key: '' },
    message: error.errorSummary || loc('oform.errorbanner.title', 'login'),
  });
};
