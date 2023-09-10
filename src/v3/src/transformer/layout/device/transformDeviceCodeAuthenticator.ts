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

import { getUIElementWithName } from 'src/transformer/utils';
import {
    ButtonElement,
    ButtonType,
    DescriptionElement,
    FieldElement,
    IdxStepTransformer,
    StepperButtonElement,
    TitleElement,
    UISchemaElement,
  } from '../../../types';
  import { loc } from '../../../util';
  
  export const transformDeviceCodeAuthenticator: IdxStepTransformer = ({
    transaction,
    formBag,
  }) => {
    const { uischema, data } = formBag;
    const { nextStep: { name: step = '' } = {} } = transaction;
  
    const titleElement: TitleElement = {
      type: 'Title',
      options: { content: loc('device.code.activate.title', 'login') },
    };
  
    const subtitleElement: DescriptionElement = {
      type: 'Description',
      contentType: 'subtitle',
      options: {
        content: loc('device.code.activate.subtitle', 'login'),
      },
    };

    const userCodeElement = getUIElementWithName(
        'userCode',
        uischema.elements as UISchemaElement[],
    ) as FieldElement;

    if (userCodeElement) {
        // Turns on flag to hyphenate activation code input after the 4th character
        // NOTE: Hyphenation is triggered by a KeyboardEvent and only occurs upon typing, not pre-filling
        userCodeElement.hyphenate = true;
        // Pre-fill the activation code input with a value if it is passed one via inputMeta
        if (userCodeElement.options.inputMeta.type === 'string') {
          data.userCode = userCodeElement.options.inputMeta.value;
        }
    }

    uischema.elements.unshift(titleElement, subtitleElement);
  
    return formBag;
  };
  