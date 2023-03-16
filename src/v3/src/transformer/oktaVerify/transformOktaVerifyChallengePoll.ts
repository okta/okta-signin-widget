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
import { HTMLReactParserOptions } from 'html-react-parser';

import { CHALLENGE_METHOD, IDX_STEP } from '../../constants';
import PhoneSvg from '../../img/phone-icon.svg';
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
  getLinkReplacerFn,
  hasMinAuthenticatorOptions,
  loc,
  updateTransactionWithNextStep,
} from '../../util';
import { transformOktaVerifyDeviceChallengePoll, transformOktaVerifyFPLoopbackPoll } from '../layout/oktaVerify';
import { getUIElementWithName } from '../utils';

export const transformOktaVerifyChallengePoll: IdxStepTransformer = (options) => {
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
        const parserOptions: HTMLReactParserOptions = {};
        parserOptions.replace = getLinkReplacerFn(parserOptions, 'monochrome');
        const { name } = resendStep;
        uischema.elements.unshift({
          type: 'Reminder',
          noMargin: true,
          parserOptions,
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
          SVGIcon: PhoneSvg,
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
      uischema.elements.unshift({
        type: 'Reminder',
        noMargin: true,
        options: {
          content: loc('oktaverify.warning', 'login'),
        },
      } as ReminderElement);
      uischema.elements.unshift({
        type: 'Title',
        options: { content: loc('oie.okta_verify.push.title', 'login') },
      } as TitleElement);
      uischema.elements.push({
        type: 'Button',
        label: loc('oie.okta_verify.push.sent', 'login'),
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
