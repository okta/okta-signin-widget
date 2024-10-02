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

import { IDX_STEP } from "../../constants";
import { ButtonElement, FieldElement, IdxAuthenticatorWithChallengeData, TransformStepFnWithOptions, WebAuthNAutofillElement, WebAuthNAutofillUICredentials } from "../../types";
import { isConditionalMediationAvailable, webAuthNAutofillActionHandler } from "../../util";
import { traverseLayout } from "../util";
import { getUIElementWithName } from "../utils";

export const addWebAuthNAutofillHandler: TransformStepFnWithOptions = ({
  transaction,
  widgetProps
}) => formbag => {
  const webauthAutofillStep = transaction.availableSteps?.find(
    ({ name }) => name === IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR
  );
  const { features: { disableAutocomplete } = {} } = widgetProps;
  // only apply this transformation if the remediation contains CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR
  // and autocomplete is enabled (as the Passkey autofill relies on the autocomplete attribute containing 'webauthn')
  if (!webauthAutofillStep || disableAutocomplete) {
    return formbag;
  }

  const identifierElement = getUIElementWithName('identifier', formbag.uischema.elements) as FieldElement;
  if (identifierElement?.options?.attributes) {
    identifierElement.options.attributes.autocomplete = 'username webauthn';
    
    const identifyStep = transaction.availableSteps?.find(
      ({ name }) => name === IDX_STEP.IDENTIFY
    );

    if (identifyStep) {
      traverseLayout({
        layout: formbag.uischema,
        predicate: (el) => (el.type === 'Button' && el.key == 'challenge-webauthn-autofillui-authenticator_Button'),
        callback: (el) => {
          const submitBtnElement = el as ButtonElement;
          submitBtnElement.options.step = identifyStep.name
          submitBtnElement.key = `${identifyStep.name}_Button`;
        },
      });
    }

    if (webauthAutofillStep && isConditionalMediationAvailable()) {
      const { challengeData } = webauthAutofillStep.relatesTo?.value as IdxAuthenticatorWithChallengeData;
      const webAuthNAutofillEl: WebAuthNAutofillElement = {
        type: 'WebAuthNAutofill',
        options: {
          step: IDX_STEP.CHALLENGE_WEBAUTHN_AUTOFILLUI_AUTHENTICATOR,
          getCredentials: (abortController) => webAuthNAutofillActionHandler(challengeData, abortController) as Promise<WebAuthNAutofillUICredentials>,
        },
      };
      formbag.uischema.elements.push(webAuthNAutofillEl);
    }
  }  

  return formbag;
};
