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

import { Input } from '@okta/okta-auth-js';

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { loc } from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';
import { getOVMethodTypeAuthenticatorButtonElements, isOnlyPushWithAutoChallenge } from './utils';

export const transformSelectOVMethodVerify: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep: { inputs } = {} } = transaction;
  const authenticator = inputs?.find(({ name }) => name === 'authenticator') as Input;
  if (!authenticator) {
    return formBag;
  }

  const { uischema, data } = formBag;

  if (isOnlyPushWithAutoChallenge(authenticator.value as Input[])) {
    uischema.elements = removeUIElementWithName(
      'authenticator.methodType',
      uischema.elements as UISchemaElement[],
    );
    const autoChallenge = getUIElementWithName(
      'authenticator.autoChallenge',
      uischema.elements as UISchemaElement[],
    ) as FieldElement;
    if (autoChallenge) {
      data[autoChallenge.options.inputMeta.name] = autoChallenge.options.inputMeta.value;
    }
    data['authenticator.methodType'] = 'push';

    uischema.elements.unshift({
      type: 'Title',
      options: { content: loc('oie.okta_verify.push.title', 'login') },
    } as TitleElement);
    uischema.elements.push({
      type: 'Button',
      label: loc('oie.okta_verify.sendPushButton', 'login'),
      scope: `#/properties/${ButtonType.SUBMIT}`,
      options: {
        type: ButtonType.SUBMIT,
      },
    } as ButtonElement);
  } else {
    const methodType = (authenticator.value as Input[])?.find(({ name }) => name === 'methodType');
    if (!methodType?.options) {
      return formBag;
    }

    const buttonElements = getOVMethodTypeAuthenticatorButtonElements(methodType.options);
    uischema.elements = removeUIElementWithName(
      'authenticator.methodType',
      uischema.elements as UISchemaElement[],
    );
    uischema.elements = uischema.elements.concat(buttonElements);

    const titleElement: TitleElement = {
      type: 'Title',
      options: {
        content: loc('oie.select.authenticators.verify.title', 'login'),
      },
    };
    const descriptionElement: DescriptionElement = {
      type: 'Description',
      options: {
        content: loc('oie.select.authenticators.verify.subtitle', 'login'),
      },
    };

    // Title -> Descr -> Element(s)
    uischema.elements.unshift(descriptionElement);
    uischema.elements.unshift(titleElement);
  }

  return formBag;
};
