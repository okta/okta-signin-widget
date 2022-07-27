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
  DataSchema,
  FieldElement,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { getUsernameCookie, loc } from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';

const updateErrorMessages = (
  dataSchema: Record<string, DataSchema>,
  fieldName: string,
  errorKey: string,
) => {
  // eslint-disable-next-line no-param-reassign
  dataSchema[fieldName] = {
    validate(data) {
      const isValid = !!data[fieldName];
      return isValid ? undefined : {
        i18n: {
          // TODO: OKTA-476303 use loc function here so key is translated
          key: errorKey,
        },
      };
    },
  };
};

export const transformIdentify: IdxStepTransformer = ({ formBag, widgetProps, transaction }) => {
  const { features, username } = widgetProps;
  const { uischema, dataSchema } = formBag;

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
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
      dataType: 'save',
      step: transaction.nextStep!.name,
    },
  };

  if (passwordElement) {
    submitBtnElement.label = loc('oie.primaryauth.submit', 'login');
    // Overwrite error messages with custom keys
    updateErrorMessages(dataSchema, 'credentials.passcode', 'error.password.required');
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

  if (identifierElement) {
    // Overwrite error messages with custom keys
    updateErrorMessages(dataSchema, 'identifier', 'error.username.required');

    // add username/identifier from config if provided
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
