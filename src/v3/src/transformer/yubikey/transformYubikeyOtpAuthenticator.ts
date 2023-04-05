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

import { YubikeyDemoImage } from '../../components/Images';
import { IDX_STEP } from '../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  ImageWithTextElement,
  TitleElement,
} from '../../types';
import { loc } from '../../util';
import { getUIElementWithName } from '../utils';

export const transformYubikeyOtpAuthenticator: IdxStepTransformer = ({ formBag, transaction }) => {
  const { uischema } = formBag;
  const { nextStep } = transaction;

  const passcodeElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements,
  ) as FieldElement;
  passcodeElement.options.attributes = {
    ...passcodeElement.options.attributes,
    autocomplete: 'off',
  };

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: nextStep!.name === IDX_STEP.ENROLL_AUTHENTICATOR
        ? loc('oie.yubikey.enroll.title', 'login')
        : loc('oie.yubikey.challenge.title', 'login'),
    },
  };

  const submitButtonControl: ButtonElement = {
    type: 'Button',
    label: nextStep!.name === IDX_STEP.ENROLL_AUTHENTICATOR
      ? loc('oie.enroll.authenticator.button.text', 'login')
      : loc('oform.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: nextStep!.name,
    },
  };

  const descriptionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.yubikey.description', 'login'),
    },
  };

  const imageElement: ImageWithTextElement = {
    type: 'ImageWithText',
    options: {
      id: 'yubikey',
      SVGIcon: YubikeyDemoImage,
      alignment: 'center',
    },
  };

  uischema.elements = [
    titleElement,
    descriptionElement,
    passcodeElement,
    submitButtonControl,
  ];

  if (nextStep!.name === IDX_STEP.ENROLL_AUTHENTICATOR) {
    uischema.elements.unshift(imageElement);
  }

  return formBag;
};
