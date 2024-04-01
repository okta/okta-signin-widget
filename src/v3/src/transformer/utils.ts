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
  FieldElement,
  FormBag,
  UISchemaElement,
  UISchemaLayoutType,
} from '../types';

export const createForm = (): FormBag => ({
  schema: {},
  uischema: {
    type: UISchemaLayoutType.VERTICAL,
    elements: [],
  },
  data: {},
  dataSchema: {
    fieldsToValidate: [] as string[],
  } as FormBag['dataSchema'],
});

export const removeUIElementWithName = (
  name: string,
  elements: UISchemaElement[],
): UISchemaElement[] => (
  elements.filter((element) => (
    name !== (element as FieldElement).options?.inputMeta?.name
  ))
);

export const getUIElementWithName = (
  name: string,
  elements: UISchemaElement[],
): UISchemaElement | undefined => (
  elements.find((element) => (
    name === (element as FieldElement).options?.inputMeta?.name
  ))
);
