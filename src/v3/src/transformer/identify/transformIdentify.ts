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
  ButtonElement,
  ButtonType,
  FieldElement,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { getUsernameCookie, loc } from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';

export const transformIdentify: IdxStepTransformer = ({ formBag, widgetProps }) => {
  const { features, username } = widgetProps;
  const { uischema } = formBag;

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('oform.next', 'login'),
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
      dataType: 'save',
    },
  };

  if (getUIElementWithName(
    'credentials.passcode',
    uischema.elements as UISchemaElement[],
  )) {
    submitBtnElement.label = loc('oie.primaryauth.submit', 'login');
  }

  if (features?.showKeepMeSignedIn === false) {
    uischema.elements = removeUIElementWithName(
      'rememberMe',
      uischema.elements as UISchemaElement[],
    );
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('primaryauth.title', 'login') },
  };

  const identifierElement = getUIElementWithName(
    'identifier',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;

  // add username/identifier from config if provided
  if (identifierElement) {
    if (username) {
      identifierElement.options = {
        ...identifierElement.options,
        defaultOption: username,
      };
    } else if (features?.rememberMe && features?.rememberMyUsernameOnOIE) {
      const usernameCookie = getUsernameCookie();
      identifierElement.options = {
        ...identifierElement.options,
        defaultOption: usernameCookie ?? undefined,
      };
    }
  }

  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  return formBag;
};
