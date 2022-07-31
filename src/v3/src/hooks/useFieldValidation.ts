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
import { FieldElement } from '../types';

export const useFieldValidation = (uischema: FieldElement) => {
  const { name } = uischema.options.inputMeta;
  const { dataSchemaRef, data } = useWidgetContext();

  return useCallback((
    setFieldError: StateUpdater<string | undefined>,
    value?: string | boolean | number,
  ) => {
    const updatedData = { ...data, ...(value && { [name]: value }) };
    const validator = dataSchemaRef.current?.[name];
    if (typeof validator?.validate === 'function') {
      const messages = validator.validate({ ...updatedData });
      if (messages?.[0]?.i18n?.key) {
        // @ts-ignore Message interface defined in v2/i18nTransformer JsDoc is incorrect
        // eslint-disable-next-line no-param-reassign
        setFieldError(getMessage(messages?.[0]));
        return;
      }
    }
    setFieldError(undefined);
  }, [data, dataSchemaRef, name]);
};
