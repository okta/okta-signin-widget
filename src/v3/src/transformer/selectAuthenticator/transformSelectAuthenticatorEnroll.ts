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

import {
  AuthenticatorButtonListElement,
  ButtonElement,
  ButtonType,
  DescriptionElement,
  HeadingElement,
  IdxStepTransformer,
  TitleElement,
} from '../../types';
import { loc } from '../../util';
import { getAuthenticatorEnrollButtonElements } from './utils';

const getContentDescrAndParams = (brandName?: string): TitleElement['options'] => {
  if (brandName) {
    return {
      content: loc('oie.select.authenticators.enroll.subtitle.custom', 'login', [brandName]),
    };
  }
  return { content: loc('oie.select.authenticators.enroll.subtitle', 'login') };
};

export const transformSelectAuthenticatorEnroll: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { uischema } = formBag;
  const { brandName } = widgetProps;
  const {
    nextStep: { inputs, name: stepName } = {} as NextStep,
    availableSteps,
    // @ts-ignore OKTA-499928 authenticatorEnrollments missing from rawIdxState
    rawIdxState: { authenticatorEnrollments },
  } = transaction;

  const authenticator = inputs?.find(({ name }) => name === 'authenticator');
  if (!authenticator?.options?.length) {
    return formBag;
  }
  const authenticatorButtons = getAuthenticatorEnrollButtonElements(
    authenticator.options,
    stepName,
    authenticatorEnrollments?.value,
  );
  const skipStep = availableSteps?.find(({ name }) => name === 'skip');

  const title: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.select.authenticators.enroll.title', 'login'),
    },
  };
  const informationalText: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: getContentDescrAndParams(brandName),
  };
  const description: HeadingElement = {
    type: 'Heading',
    options: {
      content: skipStep ? loc('oie.setup.optional', 'login') : loc('oie.setup.required', 'login'),
      level: 3,
      visualLevel: 6,
    },
  };
  const authenticatorListElement: AuthenticatorButtonListElement = {
    type: 'AuthenticatorButtonList',
    options: { buttons: authenticatorButtons, dataSe: 'authenticator-enroll-list' },
  };
  const skipButton: ButtonElement = {
    type: 'Button',
    label: loc('oie.optional.authenticator.button.title', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: 'skip',
    },
  };

  uischema.elements = [
    title,
    informationalText,
    description,
    authenticatorListElement,
    ...(skipStep ? [skipButton] : []),
  ];

  return formBag;
};
