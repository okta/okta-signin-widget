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
  ButtonElement,
  DescriptionElement,
  FieldElement,
  TitleElement,
  WidgetProps,
} from '../../types';
import { transformYubikeyOtpAuthenticator } from './transformYubikeyOtpAuthenticator';

describe('Yubikey OTP transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;

  describe('Yubikey OTP Enroll tests', () => {
    beforeEach(() => {
      transaction.nextStep = {
        name: IDX_STEP.ENROLL_AUTHENTICATOR,
      };
      formBag.uischema.elements = [
        {
          type: 'Field',
          options: { inputMeta: { name: 'credentials.passcode', secret: true } },
        } as FieldElement,
      ];
      widgetProps = {};
    });

    it('should add correct title, image, description, passcode input, and Set up button', () => {
      const updatedFormBag = transformYubikeyOtpAuthenticator({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(5);
      expect(updatedFormBag.uischema.elements[0].type).toBe('ImageWithText');
      expect((updatedFormBag.uischema.elements[1] as TitleElement).options?.content)
        .toBe('oie.yubikey.enroll.title');
      expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
        .toBe('oie.yubikey.description');
      expect((updatedFormBag.uischema.elements[3] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');
      expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
        .toBe('oie.enroll.authenticator.button.text');
    });
  });

  describe('Yubikey OTP Verify tests', () => {
    beforeEach(() => {
      transaction.nextStep = {
        name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      };
      formBag.uischema.elements = [
        {
          type: 'Field',
          options: { inputMeta: { name: 'credentials.passcode', secret: true } },
        } as FieldElement,
      ];
      widgetProps = {};
    });

    it('should add correct title, description, passcode input, and Verify button', () => {
      const updatedFormBag = transformYubikeyOtpAuthenticator({
        transaction,
        formBag,
        widgetProps,
      });
      expect(updatedFormBag).toMatchSnapshot();
      expect(updatedFormBag.uischema.elements.length).toBe(4);
      expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
        .toBe('oie.yubikey.challenge.title');
      expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
        .toBe('oie.yubikey.description');
      expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
        .toBe('credentials.passcode');
      expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
        .toBe('oform.verify');
    });
  });
});
