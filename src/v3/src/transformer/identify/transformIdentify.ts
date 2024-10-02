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

import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  IdxAuthenticatorWithChallengeData,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
  WebAuthNAutofillElement,
  WebAuthNAutofillUICredentials,
} from '../../types';
import {
  getUsernameCookie,
  isConfigRecoverFlow,
  isCredentialsApiAvailable,
  loc,
  webAuthNAutofillActionHandler
} from '../../util';
import { transformIdentityRecovery } from '../layout/recovery';
import { getUIElementWithName, removeUIElementWithName } from '../utils';

export const transformIdentify: IdxStepTransformer = ({
  formBag,
  widgetProps,
  transaction,
}) => {
  const { features, username } = widgetProps;
  const { uischema, data } = formBag;
  const webauthAutofillStep = transaction.availableSteps?.find(({ name }) => name === IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR);
  const identifyStep = transaction.availableSteps?.find(({ name }) => name === IDX_STEP.IDENTIFY);

  // TODO
  // OKTA-651781
  // there is a bug with the flow param resetPassword with identifier first flow
  // where password recovery flow has extra steps in identifier-first flow
  // this is to keep the user experience consistent with identify-recovery flow
  // this is in parity with the gen 2 fix: PR#2382
  if (isConfigRecoverFlow(widgetProps.flow)) {
    return transformIdentityRecovery({ formBag, widgetProps, transaction });
  }

  const identifierElement = getUIElementWithName(
    'identifier',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;
  if (identifierElement) {
    // add username/identifier from config if provided
    if (username) {
      data.identifier = username;
    } else if (typeof identifierElement.options.inputMeta.value === 'string') {
      data.identifier = identifierElement.options.inputMeta.value;
    // TODO: OKTA-508744 - to use rememberMe in features once Default values are added widgetProps.
    // (i.e. rememberMe is default = true in v2)
    } else if (typeof features?.rememberMe === 'undefined' || features?.rememberMe === true) {
      const usernameCookie = getUsernameCookie();
      data.identifier = usernameCookie;
    }

    if (webauthAutofillStep && isCredentialsApiAvailable() && identifierElement.options.attributes) {
      identifierElement.options.attributes.autocomplete = 'webauthn';
    }
  }

  const passwordElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;

  // overriding this as it seems to have a logic flaw and doesn't take the 1st available step as the next
  const nextStep = webauthAutofillStep && identifyStep ? identifyStep.name : transaction.nextStep!.name;

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('oform.next', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: nextStep,
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

  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  if (webauthAutofillStep && isCredentialsApiAvailable()) {
    const { challengeData } = webauthAutofillStep.relatesTo?.value as IdxAuthenticatorWithChallengeData;
    const webAuthNAutofillEl: WebAuthNAutofillElement = {
      type: 'WebAuthNAutofill',
      options: {
        step: IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR,
        getCredentials: (abortController) => webAuthNAutofillActionHandler(challengeData, abortController) as Promise<WebAuthNAutofillUICredentials>,
      },
    };
    uischema.elements.push(webAuthNAutofillEl);
  }

  return formBag;
};
