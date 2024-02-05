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

import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ChromeDtcContainerElement,
  DescriptionElement,
  LinkElement,
  OpenOktaVerifyFPButtonElement,
  SpinnerElement,
  StepperLayout,
  StepperNavigatorElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import * as utils from '../../../util/idxUtils';
import { transformOktaVerifyDeviceChallengePoll } from './transformOktaVerifyDeviceChallengePoll';

describe('Transform Okta Verify Device Challenge Poll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  const widgetProps: WidgetProps = {};

  describe('where remediation is device-challenge-poll', () => {
    beforeEach(() => {
      formBag.uischema.elements = [];
      transaction.nextStep = {
        name: 'device-challenge-poll',
        relatesTo: {
          value: {
            // @ts-expect-error Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
            challengeMethod: 'CUSTOM_URI',
            href: 'okta-verify.html',
            downloadHref: 'https://apps.apple.com/us/app/okta-verify/id490179405',
          },
        },
      };
      transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE }];
      jest.spyOn(utils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
    });

    it('should transform elements when challengeMethod is CUSTOM_URI', () => {
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(7);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('customUri.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('customUri.required.content.prompt');
      expect((updatedFormBag.uischema.elements[2] as OpenOktaVerifyFPButtonElement).options.href)
        .toBe('okta-verify.html');
      expect((updatedFormBag.uischema.elements[3] as DescriptionElement).options.content)
        .toBe('customUri.required.content.download.title');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
        .toBe('customUri.required.content.download.linkText');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.href)
        .toBe('https://apps.apple.com/us/app/okta-verify/id490179405');
      expect((updatedFormBag.uischema.elements[5] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[6] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[6] as LinkElement).options.step)
        .toBe('cancel');
    });

    it('should transform elements when challengeMethod is APP_LINK', () => {
      // @ts-expect-error Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
      transaction.nextStep?.relatesTo.value.challengeMethod = 'APP_LINK';
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(2);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('appLink.title');
      expect((updatedFormBag.uischema.elements[1] as StepperLayout).type)
        .toBe('Stepper');

      const stepperLayout = updatedFormBag.uischema.elements[1];
      const [layoutOne, layoutTwo] = (stepperLayout as StepperLayout).elements;

      expect(layoutOne.elements.length).toBe(4);
      expect((layoutOne.elements[0] as StepperNavigatorElement).type)
        .toBe('StepperNavigator');
      expect((layoutOne.elements[1] as SpinnerElement).type)
        .toBe('Spinner');
      expect((layoutOne.elements[2] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((layoutOne.elements[3] as LinkElement).options.step)
        .toBe('authenticatorChallenge-cancel');

      expect(layoutTwo.elements.length).toBe(4);
      expect((layoutTwo.elements[0] as DescriptionElement).options.content)
        .toBe('appLink.content');
      expect((layoutTwo.elements[1] as OpenOktaVerifyFPButtonElement).options.href)
        .toBe('okta-verify.html');
      expect((layoutTwo.elements[2] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((layoutTwo.elements[3] as LinkElement).type)
        .toBe('Link');
      expect((layoutTwo.elements[3] as LinkElement).options.step)
        .toBe('cancel');
    });

    it('should transform elements when challengeMethod is UNIVERSAL_LINK', () => {
      // @ts-expect-error Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
      transaction.nextStep?.relatesTo.value.challengeMethod = 'UNIVERSAL_LINK';
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(6);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('universalLink.title');
      expect((updatedFormBag.uischema.elements[1] as SpinnerElement).type)
        .toBe('Spinner');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toBe('universalLink.content');
      expect((updatedFormBag.uischema.elements[3] as OpenOktaVerifyFPButtonElement).options.href)
        .toBe('okta-verify.html');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[5] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[5] as LinkElement).options.step)
        .toBe('cancel');
    });

    it('should transform elements when challengeMethod is CHROME_DTC', () => {
      // @ts-expect-error Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
      transaction.nextStep?.relatesTo.value.challengeMethod = 'CHROME_DTC';
      transaction.availableSteps = undefined;
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('deviceTrust.sso.redirectText');
      expect((updatedFormBag.uischema.elements[1] as SpinnerElement).type)
        .toBe('Spinner');
      expect((updatedFormBag.uischema.elements[2] as ChromeDtcContainerElement).options.href)
        .toBe('okta-verify.html');
      expect((updatedFormBag.uischema.elements[3] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[3] as LinkElement).options.step)
        .toBe('cancel');
    });
  });

  describe('where remediation is challenge-poll', () => {
    beforeEach(() => {
      formBag.uischema.elements = [];
      transaction.nextStep = {
        name: 'challenge-poll',
        relatesTo: {
          value: {
            contextualData: {
              // @ts-expect-error Property 'challenge' does not exist
              challenge: {
                value: {
                  challengeMethod: 'CUSTOM_URI',
                  href: 'okta-verify.html',
                  downloadHref: 'https://apps.apple.com/us/app/okta-verify/id490179405',
                },
              },
            },
          },
        },
      };
      transaction.availableSteps = [{ name: IDX_STEP.SELECT_AUTHENTICATOR_AUTHENTICATE }];
      jest.spyOn(utils, 'hasMinAuthenticatorOptions').mockReturnValue(true);
    });

    it('should transform elements when challengeMethod is CUSTOM_URI', () => {
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(7);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('customUri.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
        .toBe('customUri.required.content.prompt');
      expect((updatedFormBag.uischema.elements[2] as OpenOktaVerifyFPButtonElement).options.href)
        .toBe('okta-verify.html');
      expect((updatedFormBag.uischema.elements[3] as DescriptionElement).options.content)
        .toBe('customUri.required.content.download.title');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
        .toBe('customUri.required.content.download.linkText');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.href)
        .toBe('https://apps.apple.com/us/app/okta-verify/id490179405');
      expect((updatedFormBag.uischema.elements[5] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[6] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[6] as LinkElement).options.step)
        .toBe('cancel');
    });

    it('should transform elements when challengeMethod is APP_LINK', () => {
      // @ts-expect-error Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
      transaction.nextStep?.relatesTo.value.contextualData.challenge.value.challengeMethod = 'APP_LINK';
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(6);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('appLink.title');
      expect((updatedFormBag.uischema.elements[1] as SpinnerElement).type)
        .toBe('Spinner');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toBe('appLink.content');
      expect((updatedFormBag.uischema.elements[3] as OpenOktaVerifyFPButtonElement).options.href)
        .toBe('okta-verify.html');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[5] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[5] as LinkElement).options.step)
        .toBe('cancel');
    });

    it('should transform elements when challengeMethod is UNIVERSAL_LINK', () => {
      // @ts-expect-error Property 'challengeMethod' does not exist on type 'IdxAuthenticator'.
      transaction.nextStep?.relatesTo.value.contextualData.challenge.value.challengeMethod = 'UNIVERSAL_LINK';
      const updatedFormBag = transformOktaVerifyDeviceChallengePoll({
        transaction,
        formBag,
        widgetProps,
      });

      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(6);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
        .toBe('universalLink.title');
      expect((updatedFormBag.uischema.elements[1] as SpinnerElement).type)
        .toBe('Spinner');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
        .toBe('universalLink.content');
      expect((updatedFormBag.uischema.elements[3] as OpenOktaVerifyFPButtonElement).options.href)
        .toBe('okta-verify.html');
      expect((updatedFormBag.uischema.elements[4] as LinkElement).options.label)
        .toBe('oie.verification.switch.authenticator');
      expect((updatedFormBag.uischema.elements[5] as LinkElement).type)
        .toBe('Link');
      expect((updatedFormBag.uischema.elements[5] as LinkElement).options.step)
        .toBe('cancel');
    });
  });
});
