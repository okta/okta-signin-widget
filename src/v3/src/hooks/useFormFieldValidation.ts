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

import { StateUpdater, useCallback } from 'preact/hooks';

import { getMessage } from '../../../v2/ion/i18nTransformer';
import { useWidgetContext } from '../contexts';
import { DataSchema, FieldElement } from '../types';

export const useFormFieldValidation = (
  uischema: FieldElement,
): (
  setError?: StateUpdater<string | undefined>, value?: string | boolean | number
  ) => void => {
  const { name } = uischema.options.inputMeta;
  const { dataSchemaRef, data } = useWidgetContext();

  return useCallback((
    setError?: StateUpdater<string | undefined>,
    value?: string | boolean | number,
  ) => {
    const validator = dataSchemaRef.current?.[name] as DataSchema;
    if (typeof validator?.validate === 'function') {
      const updatedData = { ...data, ...(value !== undefined && { [name]: value }) };
      const messages = validator.validate({ ...updatedData });
      const matchingMessage = messages?.find(
        (message) => message.name === undefined || message.name === name,
      );
      if (matchingMessage?.i18n?.key) {
        // @ts-ignore Message interface defined in v2/i18nTransformer JsDoc is incorrect
        setError?.(getMessage(matchingMessage));
        return;
      }
    }
    setError?.(undefined);
  }, [data, dataSchemaRef, name]);
};
