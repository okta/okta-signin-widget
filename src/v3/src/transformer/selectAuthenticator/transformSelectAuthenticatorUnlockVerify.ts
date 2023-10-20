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

import { IdxMessage, NextStep } from '@okta/okta-auth-js';

import {
  AuthenticatorButtonListElement,
  AutoSubmitElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdentifierContainerElement,
  IdxStepTransformer,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';
import { getUsernameCookie, loc, shouldHideIdentifier } from '../../util';
import { getUIElementWithName } from '../utils';
import { getAuthenticatorVerifyButtonElements } from './utils';

export const transformSelectAuthenticatorUnlockVerify: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { nextStep: { inputs, name: stepName } = {} as NextStep } = transaction;
  const { uischema, data } = formBag;
  const { features, username } = widgetProps;

  const authenticator = inputs?.find(({ name }) => name === 'authenticator');
  if (!authenticator?.options?.length) {
    return formBag;
  }
  const authenticatorButtons = getAuthenticatorVerifyButtonElements(
    authenticator.options,
    stepName,
  );

  const identifierContainer: IdentifierContainerElement = {
    type: 'IdentifierContainer',
    options: {
      identifier: data.identifier as string,
    },
  };

  const unlockAccountTitle: TitleElement = {
    type: 'Title',
    options: {
      content: loc('unlockaccount', 'login'),
    },
  };

  const verifyTitle: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.select.authenticators.verify.title', 'login'),
    },
  };

  const verifySubtitle: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.select.authenticators.verify.subtitle', 'login'),
    },
  };

  const identifier = getUIElementWithName('identifier', uischema.elements) as FieldElement;

  if (identifier) {
    // add username/identifier from config if provided
    if (username) {
      data.identifier = username;
    } else if (typeof identifier.options.inputMeta.value === 'string') {
      data.identifier = identifier.options.inputMeta.value;
    // TODO: OKTA-508744 - to use rememberMe in features once Default values are added widgetProps.
    // (i.e. rememberMe is default = true in v2)
    } else if (typeof features?.rememberMe === 'undefined' || features?.rememberMe === true) {
      const usernameCookie = getUsernameCookie();
      data.identifier = usernameCookie;
    }
  }

  const authenticatorList: AuthenticatorButtonListElement = {
    type: 'AuthenticatorButtonList',
    options: { buttons: authenticatorButtons, dataSe: 'authenticator-verify-list' },
  };

  const identifyWithUsernameLayout: UISchemaLayout = {
    type: UISchemaLayoutType.VERTICAL,
    elements: [],
  };

  // TODO: Refactor transformer once we have backend support for this Stepper flow - OKTA-657627
  const nextButton: StepperButtonElement = {
    type: 'StepperButton',
    label: loc('oform.next', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      variant: 'primary',
      nextStepIndex: (widgetContext) => {
        const { setMessage, data: updatedData } = widgetContext;
        setMessage(undefined);

        if (updatedData.identifier && typeof updatedData.identifier === 'string') {
          identifierContainer.options.identifier = (updatedData.identifier as string);
          // If the user only has one authenticator that they can use to verify, add the AutoSubmit
          // element to skip rendering the authenticator list and proceed with a challenge request
          if (authenticatorButtons.length === 1) {
            const authenticatorOptions = authenticatorButtons[0].options;
            const autoSubmit: AutoSubmitElement = {
              type: 'AutoSubmit',
              options: {
                step: stepName,
                actionParams: authenticatorOptions.actionParams,
                includeData: authenticatorOptions.includeData,
                includeImmutableData: authenticatorOptions.includeImmutableData,
              },
            };
            identifyWithUsernameLayout.elements.push(autoSubmit);
            // Keep users on first layout because AutoSubmit will trigger view change
            return 0;
          }

          return 1;
        }

        // If username field is blank, replicate onSubmitValidation error UX and block next step
        setMessage({
          message: loc('oform.errorbanner.title', 'login'),
          class: 'ERROR',
          i18n: { key: 'oform.errorbanner.title' },
        } as IdxMessage);
        return 0;
      },
    },
  };

  identifyWithUsernameLayout.elements = [
    unlockAccountTitle,
    identifier,
    nextButton,
  ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 0 }));

  const authenticatorListLayout: UISchemaLayout = {
    type: UISchemaLayoutType.VERTICAL,
    elements: [
      verifyTitle,
      verifySubtitle,
      authenticatorList,
    ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 1 })),
  };

  const unlockAccountStepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    key: 'unlockAccountStepper',
    elements: [
      identifyWithUsernameLayout,
      authenticatorListLayout,
    ],
  };

  if (!shouldHideIdentifier(
    features?.showIdentifier,
    data.identifier as string,
    transaction.nextStep?.name,
  )) {
    authenticatorListLayout.elements.unshift(identifierContainer);
  }

  uischema.elements = [unlockAccountStepper];

  return formBag;
};
