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
import { IdxStepTransformer } from 'src/types';

export const transformOktaVerifyQrCode: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { authenticator } } = transaction;

  if (!authenticator?.contextualData?.qrcode) {
    // N/A for this transformer
    return formBag;
  }

  const { href } = authenticator.contextualData.qrcode;
  const { key, displayName } = authenticator;

  const { schema, uischema, data } = formBag;
  schema.properties = schema.properties ?? {};
  schema.required = schema.required ?? [];

  schema.properties[key] = {
    type: 'string',
  };

  const element: ControlElement = {
    type: 'Control',
    label: displayName,
    scope: `#/properties/${key}`,
    options: {
      format: 'qrcode',
    },
  };

  data[key] = href;

  // prepend
  uischema.elements.unshift(element);

  return formBag;
};
