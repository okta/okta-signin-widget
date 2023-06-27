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

import { IDX_STEP } from '../../../constants';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  TitleElement,
} from '../../../types';
import { getDisplayName, loc } from '../../../util';

export const transformSymantecVipAuthenticator: IdxStepTransformer = ({
  formBag,
  transaction,
}) => {
  const { uischema } = formBag;
  const { nextStep = {} as NextStep } = transaction;
  const stepName = nextStep.name;

  const authenticatorVendorName = getDisplayName(transaction)
    || loc('oie.on_prem.authenticator.default.vendorName', 'login');

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: stepName === IDX_STEP.ENROLL_AUTHENTICATOR
        ? loc('oie.symantecVip.enroll.title', 'login', [authenticatorVendorName])
        : loc('oie.symantecVip.challenge.title', 'login', [authenticatorVendorName]),
    },
  };

  const subtitleElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: stepName === IDX_STEP.ENROLL_AUTHENTICATOR
        ? loc('oie.symantecVip.enroll.description', 'login', [authenticatorVendorName])
        : loc('oie.symantecVip.challenge.description', 'login', [authenticatorVendorName]),
    },
  };

  const submitButtonControl: ButtonElement = {
    type: 'Button',
    label: stepName === IDX_STEP.ENROLL_AUTHENTICATOR
      ? loc('mfa.enroll', 'login')
      : loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements = [
    titleElement,
    subtitleElement,
    ...uischema.elements,
    submitButtonControl,
  ];

  return formBag;
};
