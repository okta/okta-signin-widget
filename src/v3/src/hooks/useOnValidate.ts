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

import { useWidgetContext } from '../contexts';
import { FieldElement } from '../types';
import { getSubmitButtonSchema } from '../util';

export const useOnValidate = (uischema: FieldElement) => {
  const { name } = uischema.options.inputMeta;
  const { formBag: { dataSchema }, data, stepperStepIndex } = useWidgetContext();
  const submitButtonSchema = getSubmitButtonSchema(uischema, stepperStepIndex);
  const { actionParams: params } = submitButtonSchema?.options || {};

  return useCallback((
    setFieldError: StateUpdater<string | undefined>,
    value?: string | boolean | number,
  ) => {
    const updatedData = { ...data, ...(value && { [name]: value }) };
    const validator = dataSchema[name];
    if (typeof validator?.validate === 'function') {
      const message = validator.validate({ ...updatedData, ...params });
      setFieldError(message?.i18n?.key);
    } else {
      setFieldError(undefined);
    }
  }, [data, dataSchema, name, params]);
};
