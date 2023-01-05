/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Input, NextStep } from '@okta/okta-auth-js';

import { IDX_STEP } from '../../constants';
import {
  AuthenticatorButtonListElement,
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  IWidgetContext,
  LinkElement,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { hasMinAuthenticatorOptions, loc, updateTransactionWithNextStep } from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';
import { getOVMethodTypeAuthenticatorButtonElements, isOnlyPushWithAutoChallenge } from './utils';

export const transformSelectOVMethodVerify: IdxStepTransformer = ({ transaction, formBag }) => {
  const {
    availableSteps,
    nextStep: { inputs, name: stepName, relatesTo } = {} as NextStep,
  } = transaction;
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

    const sendPushButton: ButtonElement = {
      type: 'Button',
      label: loc('oie.okta_verify.sendPushButton', 'login'),
      options: {
        type: ButtonType.SUBMIT,
        step: stepName,
      },
    };
    uischema.elements.push(sendPushButton);
    const selectVerifyStep = availableSteps?.find(
      ({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
    );
    const shouldAddLink = hasMinAuthenticatorOptions(
      transaction,
      IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
      1, // Min # of auth options for link to display
    );
    if (selectVerifyStep && shouldAddLink) {
      const { name: selectAuthStep } = selectVerifyStep;
      const listLink: LinkElement = {
        type: 'Link',
        contentType: 'footer',
        options: {
          label: loc('oie.verification.switch.authenticator', 'login'),
          step: selectAuthStep,
          onClick: (widgetContext?: IWidgetContext): unknown => {
            if (typeof widgetContext === 'undefined') {
              return;
            }
            updateTransactionWithNextStep(transaction, selectVerifyStep, widgetContext);
          },
        },
      };
      uischema.elements.push(listLink);
    }
  } else {
    const buttonElements = getOVMethodTypeAuthenticatorButtonElements(
      authenticator,
      stepName,
      relatesTo?.value?.deviceKnown,
    );
    uischema.elements = removeUIElementWithName(
      'authenticator.methodType',
      uischema.elements as UISchemaElement[],
    );
    const authenticatorListElement: AuthenticatorButtonListElement = {
      type: 'AuthenticatorButtonList',
      options: { buttons: buttonElements },
    };
    uischema.elements.push(authenticatorListElement);

    const titleElement: TitleElement = {
      type: 'Title',
      options: {
        content: loc('oie.select.authenticators.verify.title', 'login'),
      },
    };
    const descriptionElement: DescriptionElement = {
      type: 'Description',
      contentType: 'subtitle',
      noMargin: true,
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
