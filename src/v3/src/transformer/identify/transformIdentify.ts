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

export const transformIdentify: IdxStepTransformer = ({ formBag, widgetProps, transaction }) => {
  const { features, username } = widgetProps;
  const { uischema, data } = formBag;

  const identifierElement = getUIElementWithName(
    'identifier',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;
  const passwordElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('oform.next', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  if (passwordElement) {
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

  // add username/identifier from config if provided
  if (identifierElement) {
    // add username/identifier from config if provided
    if (username) {
      data.identifier = username;
    } else if (features?.rememberMe && features?.rememberMyUsernameOnOIE) {
      const usernameCookie = getUsernameCookie();
      data.identifier = usernameCookie;
    }
  }

  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  return formBag;
};
