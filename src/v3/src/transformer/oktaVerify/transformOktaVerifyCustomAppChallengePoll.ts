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

import { NextStep } from '@okta/okta-auth-js';

import { PhoneIcon } from '../../components/Images';
import { AUTHENTICATOR_KEY, CHALLENGE_METHOD, IDX_STEP } from '../../constants';
import {
  ButtonElement,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  ImageWithTextElement,
  IWidgetContext,
  LinkElement,
  ReminderElement,
  TitleElement,
} from '../../types';
import {
  getAuthenticatorKey,
  getDisplayName,
  hasMinAuthenticatorOptions,
  loc,
  updateTransactionWithNextStep,
} from '../../util';
import { transformOktaVerifyDeviceChallengePoll, transformOktaVerifyFPLoopbackPoll } from '../layout/oktaVerify';
import { getUIElementWithName } from '../utils';

export const transformOktaVerifyCustomAppChallengePoll: IdxStepTransformer = (options) => {
  const { transaction, formBag } = options;
  const { nextStep = {} as NextStep, availableSteps } = transaction;
  const { relatesTo } = nextStep;
  const { uischema, data } = formBag;

  const [selectedMethod] = relatesTo?.value?.methods || [];
  if (!selectedMethod) {
    return formBag;
  }

  if (selectedMethod.type === 'push') {
    // Need to initialize autoChallenge checkbox if it is set otherwise it will not display in UI
    const autoChallenge = getUIElementWithName('autoChallenge', uischema.elements) as FieldElement;
    data.autoChallenge = autoChallenge?.options?.inputMeta?.value;

    // @ts-ignore OKTA-496373 correctAnswer is missing from interface
    const correctAnswer = relatesTo?.value?.contextualData?.correctAnswer;

    if (correctAnswer) {
      uischema.elements.unshift({
        type: 'Title',
        options: { content: loc('oie.okta_verify.push.sent', 'login') },
      } as TitleElement);

      const resendStep = availableSteps?.find(({ name }) => name?.endsWith('resend'));
      if (resendStep) {
        const { name } = resendStep;
        uischema.elements.unshift({
          type: 'Reminder',
          noMargin: true,
          options: {
            contentHasHtml: true,
            contentClassname: 'resend-number-challenge',
            content: loc(
              'oie.numberchallenge.warning',
              'login',
              undefined,
              { $1: { element: 'a', attributes: { href: '#', class: 'resend-number-challenge' } } },
            ),
            step: name,
            isActionStep: true,
            actionParams: { resend: true },
          },
        } as ReminderElement);
      }

      const phoneIconImage: ImageWithTextElement = {
        type: 'ImageWithText',
        noTranslate: true,
        options: {
          id: 'code',
          SVGIcon: PhoneIcon,
          textContent: correctAnswer,
          alignment: 'center',
        },
      };

      const description: DescriptionElement = {
        type: 'Description',
        contentType: 'subtitle',
        options: {
          content: loc(
            'oie.numberchallenge.instruction',
            'login',
            [correctAnswer],
            { $1: { element: 'span', attributes: { class: 'strong' } } },
          ),
          dataSe: 'numberchallenge-instr-value',
        },
      };

      uischema.elements.push(description);
      uischema.elements.push(phoneIconImage);
    } else {
      const isOV = getAuthenticatorKey(transaction) === AUTHENTICATOR_KEY.OV;
      uischema.elements.unshift({
        type: 'Reminder',
        noMargin: true,
        options: {
          content: isOV
            ? loc('oktaverify.warning', 'login')
            : loc('oie.custom_app.push.warning', 'login', [getDisplayName(transaction)]),
        },
      } as ReminderElement);
      uischema.elements.unshift({
        type: 'Title',
        options: {
          content: isOV
            ? loc('oie.okta_verify.push.title', 'login')
            : loc('oie.verify.custom_app.title', 'login', [getDisplayName(transaction)]),
        },
      } as TitleElement);
      uischema.elements.push({
        type: 'Button',
        label: isOV
          ? loc('oie.okta_verify.push.sent', 'login')
          : loc('oie.custom_app.push.sent', 'login'),
        options: { disabled: true },
      } as ButtonElement);
    }

    // Since this transformer is shared, we have to add applicable buttons manually
    const hasMinAuthOptions = hasMinAuthenticatorOptions(
      transaction,
      IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE,
      1, // Min # of auth options for link to display
    );
    const selectVerifyStep = transaction.availableSteps
      ?.find(({ name }) => name === IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE);
    if (selectVerifyStep && hasMinAuthOptions) {
      const selectLink: LinkElement = {
        type: 'Link',
        contentType: 'footer',
        options: {
          label: loc('oie.verification.switch.authenticator', 'login'),
          step: selectVerifyStep.name,
          onClick: (widgetContext?: IWidgetContext): unknown => {
            if (typeof widgetContext === 'undefined') {
              return;
            }
            updateTransactionWithNextStep(transaction, selectVerifyStep, widgetContext);
          },
        },
      };
      uischema.elements.push(selectLink);
    }
    const cancelStep = transaction.availableSteps?.find(({ name }) => name === 'cancel');
    if (cancelStep) {
      const cancelLink: LinkElement = {
        type: 'Link',
        contentType: 'footer',
        options: {
          label: loc('goback', 'login'),
          isActionStep: true,
          step: 'cancel',
        },
      };
      uischema.elements.push(cancelLink);
    }
  } else if (selectedMethod.type === 'signed_nonce') {
    // selectedMethod.type === 'signed_nonce' reflects a FastPass OV flow
    // @ts-expect-error ts(2339) Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
    const challengeMethod = relatesTo?.value?.contextualData?.challenge?.value?.challengeMethod;
    if (challengeMethod === CHALLENGE_METHOD.LOOPBACK) {
      return transformOktaVerifyFPLoopbackPoll(options);
    }
    return transformOktaVerifyDeviceChallengePoll(options);
  }

  return formBag;
};
