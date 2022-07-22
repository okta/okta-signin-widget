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

import { useCallback } from 'preact/hooks';

import { useWidgetContext } from '../contexts';
import { FieldElement } from '../types';

export const useOnValidate = (uischema: FieldElement) => {
  const { name } = uischema.options.inputMeta;
  const { ajv, formBag: { schema } = {}, setFormErrors, data } = useWidgetContext();

  return useCallback((value?: string | boolean | number) => {
    const updatedData = { ...data, ...(value && { [name]: value }) };
    const validate = ajv.compile(schema!)
    if (!validate(updatedData)) {
      setFormErrors(validate.errors);
    } else {
      setFormErrors(undefined);
    }
  }, [setFormErrors, data, ajv, schema]);
};
